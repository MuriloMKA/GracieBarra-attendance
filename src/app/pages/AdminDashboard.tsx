import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { useData, JJClass, Student, BeltColor } from "../context/DataContext";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Users,
  CheckSquare,
  Award,
  ArrowRight,
  Shield,
  QrCode,
  Check,
  TrendingUp,
  AlertCircle,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import {
  BELT_NAMES_PT,
  calculateProgram,
  getDegreeDisplayLabel,
  getNextDegreeDisplayLabel,
} from "../components/BeltDisplay";
import {
  getDegreeProgress,
  getWeeksRequiredForNextDegree,
} from "../utils/degreeCalculator";
import { QRScanner } from "../components/QRScanner";
import api from "../services/api";

interface StudentReadyForDegree extends Student {
  weeksCompleted: number;
  weeksRequired: number;
  nextDegree: number;
  confirmedAttendances: number;
  progressUnit?: "semanas" | "treinos";
}

export const AdminDashboard: React.FC = () => {
  const { currentUser, students, attendance, classes, checkIn, updateStudent } =
    useData();

  const [showScanner, setShowScanner] = useState(false);
  const scannerCooldowns = useRef<Map<string, number>>(new Map());
  const [studentsReadyForDegree, setStudentsReadyForDegree] = useState<
    StudentReadyForDegree[]
  >([]);

  // Buscar alunos prontos para receber grau
  useEffect(() => {
    const fetchStudentsReadyForDegree = async () => {
      try {
        const response = await api.get("/students/ready-for-degree");
        setStudentsReadyForDegree(response.data);
      } catch (error) {
        console.error("Erro ao buscar alunos prontos para grau:", error);
      }
    };

    fetchStudentsReadyForDegree();
  }, [attendance, students]); // Recarrega quando attendance ou students mudarem

  const confirmedToday = attendance.filter((a) => {
    if (!a.confirmed) return false;
    const d = parseISO(a.date);
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }).length;

  // Aulas disponíveis hoje
  const today = new Date();
  const todayClasses = classes.filter((c) =>
    c.daysOfWeek.includes(today.getDay()),
  );

  const handleScanSuccess = (decodedText: string) => {
    try {
      const studentData = JSON.parse(decodedText);
      const studentId = studentData.studentId;

      const now = Date.now();
      const lastScan = scannerCooldowns.current.get(studentId) || 0;
      if (now - lastScan < 5000) {
        // Ignora leituras repetidas do mesmo aluno por 5 segundos
        return;
      }

      const student = students.find((s) => (s.id || s._id) === studentId);

      if (!student) {
        toast.error("Aluno não encontrado!");
        return;
      }

      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      scannerCooldowns.current.set(studentId, now);

      const alreadyConfirmed = attendance.some(
        (a) =>
          a.studentId === studentId &&
          a.classId === "manual-scan" &&
          a.confirmed &&
          a.date.startsWith(today.toISOString().split("T")[0]),
      );

      if (alreadyConfirmed) {
        toast.info(`Presença já confirmada para ${student.name} hoje!`);
        return;
      }

      const currentTime = format(now, "HH:mm");

      // Adiciona presença confirmada diretamente
      checkIn(
        studentId,
        "manual-scan",
        "Presença via QR Code",
        currentTime,
        true, // Já confirmado
      ).then(async () => {
        toast.success(
          `Check-in de ${student.name} concluído às ${currentTime}!`,
        );

        // Verifica sistema de graus após o checkin
        try {
          // Precisamos pegar a contagem de treinos atualizada (que agora inclui o checkIn recém-feito na DB)
          // Mas como o estado React da presença pode não ter atualizado reativamente a tempo,
          // Vamos calcular simulando a presença extra.

          const progProgram = calculateProgram(
            student.program,
            student.belt,
            student.degrees,
          );
          const required = getWeeksRequiredForNextDegree(
            student.belt,
            student.degrees,
            progProgram,
          );

          if (required && required > 0) {
            // Simulamos o array de attendances com a nova presença adicionada
            const simulatedAttendance = [
              ...attendance,
              {
                id: "simulated-now",
                studentId: student.id,
                classId: "manual-scan",
                date: today.toISOString(),
                status: "present",
                confirmed: true,
              },
            ] as any[];

            // Obtém progresso re-calculado
            const lastGraduationDate =
              student.lastGraduationDate || today.toISOString();

            // Usa as funções internas para ver se bateu o total
            const progressObj = getDegreeProgress(
              simulatedAttendance,
              lastGraduationDate,
              student.belt,
              student.degrees,
              progProgram,
            );

            if (progressObj && progressObj.isReadyForGraduation) {
              const dateIso = today.toISOString().split("T")[0];
              await updateStudent({
                ...student,
                degrees: student.degrees + 1,
                specialDates: [
                  ...student.specialDates,
                  {
                    date: dateIso,
                    type: "grade",
                    notes: "Grau automático pós Check-in",
                  },
                ],
              });
              toast.success(`Grau automático atribuído para ${student.name}!`);
            }
          }
        } catch (e) {
          console.error("Erro ao validar grau automático", e);
        }
      });
    } catch (error) {
      toast.error("QR Code inválido!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center overflow-hidden border-2 border-gray-200">
            <img
              src="/images/logo.png"
              alt="Gracie Barra Logo"
              className="w-full h-full object-cover scale-110"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Shield size={24} className="text-[#D10A11]" />
              Painel do Professor
            </h1>
            <p className="text-gray-500 mt-1">
              Bem-vindo, {currentUser?.name} —{" "}
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Users size={20} className="text-[#003087]" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Alunos
            </span>
          </div>
          <div className="text-3xl font-black text-gray-900">
            {students.length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <CheckSquare size={20} className="text-green-600" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Confirmados Hoje
            </span>
          </div>
          <div className="text-3xl font-black text-green-600">
            {confirmedToday}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Award size={20} className="text-[#D10A11]" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Graduações
            </span>
          </div>
          <div className="text-3xl font-black text-[#D10A11]">
            {students.reduce(
              (acc, s) =>
                acc +
                s.specialDates.filter((sd) => sd.type === "graduation").length,
              0,
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/admin/students"
          className="bg-[#003087] hover:bg-blue-900 text-white rounded-xl p-5 flex items-center justify-between group transition-all shadow-lg"
        >
          <div>
            <div className="font-black text-lg">Gerenciar Alunos</div>
            <div className="text-blue-200 text-sm mt-1">
              Ver lista, editar faixa, grau e informações
            </div>
          </div>
          <ArrowRight
            size={24}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>

        <Link
          to="/admin/classes"
          className="bg-[#D10A11] hover:bg-red-700 text-white rounded-xl p-5 flex items-center justify-between group transition-all shadow-lg"
        >
          <div>
            <div className="font-black text-lg">Gerenciar Aulas</div>
            <div className="text-red-200 text-sm mt-1">
              Configurar horários e dias das aulas
            </div>
          </div>
          <ArrowRight
            size={24}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>

        <Link
          to="/admin/notifications"
          className="bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl p-5 flex items-center justify-between group transition-all shadow-lg"
        >
          <div>
            <div className="font-black text-lg flex items-center gap-2">
              <Bell size={18} />
              Notificacoes
            </div>
            <div className="text-amber-100 text-sm mt-1">
              Enviar push para todos os usuarios
            </div>
          </div>
          <ArrowRight
            size={24}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {/* Alunos Prontos para Receber Grau */}
      {studentsReadyForDegree.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-amber-500 rounded-full">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-lg flex items-center gap-2">
                <AlertCircle size={20} className="text-amber-600" />
                Alunos Prontos para Receber Grau
              </h2>
              <p className="text-amber-700 text-sm">
                {studentsReadyForDegree.length}{" "}
                {studentsReadyForDegree.length === 1
                  ? "aluno completou"
                  : "alunos completaram"}{" "}
                os requisitos para o próximo grau
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {studentsReadyForDegree.map((student) => (
              <Link
                key={student._id}
                to={`/admin/students/${student._id}/card`}
                className="bg-white rounded-lg border border-amber-200 p-4 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-[#003087] text-white flex items-center justify-center font-black shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 truncate">
                        {student.name}
                      </div>
                      {(() => {
                        const progressUnit =
                          student.progressUnit ||
                          (student.program === "GBK" ? "semanas" : "treinos");
                        const completed =
                          progressUnit === "semanas"
                            ? student.weeksCompleted.toFixed(1)
                            : Math.round(student.weeksCompleted).toString();
                        const required =
                          progressUnit === "semanas"
                            ? String(student.weeksRequired)
                            : String(Math.round(student.weeksRequired));

                        return (
                          <div className="text-xs text-gray-600">
                            {BELT_NAMES_PT[student.belt]}{" "}
                            {getDegreeDisplayLabel(
                              student.program,
                              student.belt,
                              student.degrees,
                            )}{" "}
                            →{" "}
                            {getNextDegreeDisplayLabel(
                              student.program,
                              student.belt,
                              student.degrees,
                            )}
                            <div className="text-xs text-amber-600 font-medium mt-1">
                              {completed} de {required} {progressUnit}{" "}
                              completados
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      Pronto!
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-gray-400 group-hover:text-[#D10A11] group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-4 p-3 bg-amber-100 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>💡 Dica:</strong> Ao confirmar a presença desses alunos
              hoje, o grau será automaticamente incrementado no cartão de
              frequência!
            </p>
          </div>
        </div>
      )}

      {/* Confirmar Presença via QR Code */}
      <div>
        <h2 className="font-black text-gray-900 text-lg mb-4 flex items-center gap-2">
          <QrCode size={20} className="text-[#D10A11]" />
          Leitor de QR Code
        </h2>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-center max-w-sm mx-auto">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D10A11]/10 rounded-full mb-3">
                <QrCode size={32} className="text-[#D10A11]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Leitor Contínuo</h3>
              <p className="text-gray-500 text-sm">
                Aponte a câmera para os QR Codes dos alunos. O horário da
                confirmação será registrado automaticamente.
              </p>
            </div>
            <button
              onClick={() => setShowScanner(true)}
              className="w-full py-3 bg-[#D10A11] hover:bg-red-700 text-white rounded-xl font-black shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <QrCode size={20} />
              Iniciar Leitor
            </button>
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};
