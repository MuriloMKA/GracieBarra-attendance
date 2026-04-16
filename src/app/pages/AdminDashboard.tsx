import React, { useState, useEffect } from "react";
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
import { QRScanner } from "../components/QRScanner";
import api from "../services/api";

interface StudentReadyForDegree extends Student {
  weeksCompleted: number;
  weeksRequired: number;
  nextDegree: number;
  confirmedAttendances: number;
}

export const AdminDashboard: React.FC = () => {
  const { currentUser, students, attendance, classes, checkIn } = useData();

  const [showScanner, setShowScanner] = useState(false);
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>("");
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
      const student = students.find(
        (s) => (s.id || s._id) === studentData.studentId,
      );

      if (!student) {
        toast.error("Aluno não encontrado!");
        setShowScanner(false);
        return;
      }

      setScannedStudent(student);
      setShowScanner(false);
    } catch (error) {
      toast.error("QR Code inválido!");
      setShowScanner(false);
    }
  };

  const handleConfirmAttendance = () => {
    if (!scannedStudent || !selectedClass) {
      toast.error("Selecione uma aula!");
      return;
    }

    const classData = todayClasses.find(
      (c) => (c.id || c._id) === selectedClass,
    );
    if (!classData) return;

    const studentId = (scannedStudent.id || scannedStudent._id) as string;

    // Verifica se já tem presença confirmada hoje nessa aula
    const alreadyConfirmed = attendance.some(
      (a) =>
        a.studentId === studentId &&
        a.classId === selectedClass &&
        a.confirmed &&
        a.date.startsWith(today.toISOString().split("T")[0]),
    );

    if (alreadyConfirmed) {
      toast.error("Presença já confirmada nesta aula hoje!");
      setScannedStudent(null);
      setSelectedClass("");
      return;
    }

    // Adiciona presença confirmada diretamente
    checkIn(
      studentId,
      selectedClass,
      classData.name,
      classData.time,
      true, // Já confirmado
    );

    setScannedStudent(null);
    setSelectedClass("");
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
                      </div>
                      <div className="text-xs text-amber-600 font-medium mt-1">
                        {student.weeksCompleted} de {student.weeksRequired}{" "}
                        semanas completas
                      </div>
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
          Confirmar Presença
        </h2>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D10A11]/10 rounded-full mb-3">
                <QrCode size={32} className="text-[#D10A11]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">
                Escaneie o QR Code do Aluno
              </h3>
              <p className="text-gray-500 text-sm">
                Use a câmera do seu celular para escanear o QR Code pessoal do
                aluno e confirmar presença
              </p>
            </div>
            <button
              onClick={() => setShowScanner(true)}
              className="px-8 py-3 bg-[#D10A11] hover:bg-red-700 text-white rounded-xl font-black shadow-lg transition-all flex items-center gap-2 mx-auto"
            >
              <QrCode size={20} />
              Escanear QR Code
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

      {/* Confirmação Modal */}
      {scannedStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-black text-gray-900 text-xl mb-4">
              Confirmar Presença
            </h3>

            {/* Info do Aluno */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-[#003087] text-white flex items-center justify-center font-black">
                  {scannedStudent.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-gray-900">
                    {scannedStudent.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {BELT_NAMES_PT[scannedStudent.belt]} •{" "}
                    {calculateProgram(
                      scannedStudent.program,
                      scannedStudent.belt,
                      scannedStudent.degrees,
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Seleção de Aula */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Selecione a aula:
              </label>
              {todayClasses.length === 0 ? (
                <div className="text-sm text-gray-500 italic">
                  Nenhuma aula agendada para hoje
                </div>
              ) : (
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D10A11] focus:outline-none text-sm"
                >
                  <option value="">Escolha uma aula...</option>
                  {todayClasses.map((cls) => (
                    <option key={cls.id || cls._id} value={cls.id || cls._id}>
                      {cls.name} - {cls.time} ({cls.instructor})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setScannedStudent(null);
                  setSelectedClass("");
                }}
                className="flex-1 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAttendance}
                disabled={!selectedClass}
                className="flex-1 px-4 py-2.5 bg-[#D10A11] hover:bg-red-700 text-white rounded-xl font-black text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
