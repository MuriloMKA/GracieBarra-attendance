import React from "react";
import { Link } from "react-router";
import { useData } from "../context/DataContext";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Users,
  CheckSquare,
  Clock,
  Award,
  Check,
  X,
  ArrowRight,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { BELT_NAMES_PT } from "../components/BeltDisplay";

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    students,
    attendance,
    confirmAttendance,
    rejectAttendance,
  } = useData();

  const pendingCheckIns = attendance
    .filter((a) => !a.confirmed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  const handleConfirm = async (id: string, studentName: string) => {
    await confirmAttendance(id);
  };

  const handleReject = async (id: string, studentName: string) => {
    await rejectAttendance(id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
            <Clock size={20} className="text-amber-500" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Pendentes
            </span>
          </div>
          <div className="text-3xl font-black text-amber-500">
            {pendingCheckIns.length}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="bg-gray-900 text-white rounded-xl p-5 flex items-center gap-4">
          <Award size={32} className="text-[#D10A11] shrink-0" />
          <div>
            <div className="font-black text-lg">Cartões de Frequência</div>
            <div className="text-gray-400 text-sm mt-1">
              Acesse via lista de alunos para ver e marcar datas
            </div>
          </div>
        </div>
      </div>

      {/* Pending Check-ins */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-gray-900 text-lg flex items-center gap-2">
            <Clock size={20} className="text-amber-500" />
            Check-ins Pendentes
            {pendingCheckIns.length > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCheckIns.length}
              </span>
            )}
          </h2>
        </div>

        {pendingCheckIns.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <Check size={48} className="mx-auto text-green-400 mb-3" />
            <p className="text-gray-500 font-medium">
              Todos os check-ins foram processados!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {pendingCheckIns.map((checkIn) => {
              const student = students.find(
                (s) => (s.id || s._id) === checkIn.studentId,
              );
              if (!student) return null;
              const checkInId = checkIn.id || checkIn._id;
              if (!checkInId) return null;

              const isCheckinToday = (() => {
                const d = parseISO(checkIn.date);
                const today = new Date();
                return (
                  d.getFullYear() === today.getFullYear() &&
                  d.getMonth() === today.getMonth() &&
                  d.getDate() === today.getDate()
                );
              })();
              return (
                <div
                  key={checkInId}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#003087] text-white flex items-center justify-center font-black text-base shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {BELT_NAMES_PT[student.belt]}{" "}
                        {student.degrees > 0 ? `${student.degrees}° grau` : ""}{" "}
                        • {student.program}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCheckinToday ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          {format(
                            parseISO(checkIn.date),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR },
                          )}
                        </span>
                        <span className="text-xs bg-[#003087]/10 text-[#003087] px-2 py-0.5 rounded-full font-bold">
                          {checkIn.className} {checkIn.classTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleConfirm(checkInId, student.name)}
                      className="flex items-center gap-1.5 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg transition-colors font-bold text-sm"
                    >
                      <Check size={16} />
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleReject(checkInId, student.name)}
                      className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition-colors text-sm"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
