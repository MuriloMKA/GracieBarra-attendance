import React from "react";
import { Link } from "react-router";
import { useData } from "../context/DataContext";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Clock,
  CreditCard,
  Award,
  CalendarDays,
  CheckCheck,
  TrendingUp,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  BeltDisplay,
  getCardStyle,
  calculateProgram,
  BELT_NAMES_PT,
} from "../components/BeltDisplay";
import { getDegreeProgress } from "../utils/degreeCalculator";

export const StudentDashboard: React.FC = () => {
  const { currentUser, students, attendance, classes } = useData();

  const student = students.find(
    (s) => (s.id || s._id) === currentUser?.studentId,
  );
  if (!student)
    return (
      <div className="p-8 text-center text-gray-500">
        Perfil de aluno não encontrado.
      </div>
    );

  const today = new Date();
  const todayDOW = today.getDay();
  const todayStr = today.toISOString().split("T")[0];

  // All classes that normally happen today
  const allTodayClasses = classes.filter((c) =>
    c.daysOfWeek.includes(todayDOW),
  );

  // Separate open and closed classes
  const todayClasses = allTodayClasses.filter(
    (c) => !(c.closedDates || []).includes(todayStr),
  );

  const closedTodayClasses = allTodayClasses.filter((c) =>
    (c.closedDates || []).includes(todayStr),
  );

  // Already checked in classes today (confirmed or pending)
  const studentIdToMatch = (student.id || student._id) as string;
  const myTodayAttendance = attendance.filter(
    (a) => a.studentId === studentIdToMatch && a.date.startsWith(todayStr),
  );

  // Stats
  const myAllAttendance = attendance.filter(
    (a) => a.studentId === studentIdToMatch,
  );
  const confirmedCount = myAllAttendance.filter((a) => a.confirmed).length;

  // Calcula o programa real baseado na faixa e grau
  const actualProgram = calculateProgram(
    student.program,
    student.belt,
    student.degrees,
  );

  const cardStyle = getCardStyle(
    student.program,
    student.belt,
    student.degrees,
    student.birthDate,
  );

  // Calcula progresso do próximo grau automaticamente
  const degreeProgress = getDegreeProgress(
    myAllAttendance,
    student.lastGraduationDate,
    student.belt,
    student.degrees,
    student.program,
  );

  // Recent confirmed attendance (last 5)
  const recentAttendance = myAllAttendance
    .filter((a) => a.confirmed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome */}
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
            <h1 className="text-2xl font-black text-gray-900">
              Olá, {student.name.split(" ")[0]}! 👊
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <CalendarDays size={15} />
              {format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <Link
          to="/student/card"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all hover:scale-105 ${cardStyle.outerBg}`}
        >
          <CreditCard size={18} />
          Ver Cartão de Frequência
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <div className="text-2xl font-black text-[#D10A11]">
            {confirmedCount}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">
            Aulas Confirmadas
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <div className="text-2xl font-black text-[#003087]">
            {student.degrees}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">
            Graus na Faixa
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <div className="text-2xl font-black text-green-600">
            {
              student.specialDates.filter((sd) => sd.type === "graduation")
                .length
            }
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">
            Graduações
          </div>
        </div>
      </div>

      {/* Belt Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Award size={18} className="text-[#D10A11]" />
          Minha Faixa
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <BeltDisplay
                belt={student.belt}
                degrees={student.degrees}
                program={student.program}
                size="lg"
              />
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-medium">Programa:</span>{" "}
                <span className="bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-800">
                  {actualProgram}
                </span>
              </div>
              <div>
                <span className="font-medium">Última graduação:</span>{" "}
                {format(parseISO(student.lastGraduationDate), "dd/MM/yyyy")}
              </div>
            </div>
          </div>

          {/* Progresso do Próximo Grau */}
          {degreeProgress.weeksRequired !== null && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#003087]" />
                  Progresso para o {student.degrees + 1}º Grau
                </h3>
                {degreeProgress.isReadyForGraduation && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    Pronto!
                  </span>
                )}
              </div>

              {/* Barra de Progresso */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      degreeProgress.isReadyForGraduation
                        ? "bg-green-500"
                        : "bg-[#003087]"
                    }`}
                    style={{ width: `${degreeProgress.progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span className="font-medium">
                    {degreeProgress.weeksCompleted} semanas completadas
                  </span>
                  <span className="font-bold text-[#003087]">
                    {degreeProgress.progressPercentage}%
                  </span>
                </div>
              </div>

              {/* Informações Detalhadas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">
                    Semanas Necessárias
                  </div>
                  <div className="font-black text-[#003087] text-lg">
                    {degreeProgress.weeksRequired}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">
                    Semanas Restantes
                  </div>
                  <div className="font-black text-purple-700 text-lg">
                    {degreeProgress.weeksRemaining?.toFixed(1) || 0}
                  </div>
                </div>
              </div>

              {/* Data Estimada */}
              <div className="mt-3 p-3 bg-gradient-to-r from-[#003087]/5 to-[#D10A11]/5 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Próximo grau estimado:
                  </span>
                  <span className="text-sm font-black text-[#003087]">
                    {degreeProgress.estimatedDate}
                  </span>
                </div>
              </div>

              {/* Mensagem explicativa */}
              <div className="mt-2 text-xs text-gray-500 italic">
                * Baseado na sua frequência média. A data pode variar conforme
                sua assiduidade nos treinos.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Aulas de Hoje */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Clock size={18} className="text-[#D10A11]" />
          Aulas de Hoje
        </h2>
        {allTodayClasses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500">
            Não há aulas agendadas para hoje.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Aulas Abertas */}
            {todayClasses.map((cls) => {
              const classId = (cls.id || cls._id) as string;
              const confirmedRecord = myTodayAttendance.find(
                (a) => a.classId === classId && a.confirmed,
              );
              return (
                <div
                  key={classId}
                  className={`bg-white rounded-xl border-2 p-5 shadow-sm transition-all ${
                    confirmedRecord
                      ? "border-green-400 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-gray-900 text-base">
                        {cls.name}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {cls.instructor}
                      </div>
                    </div>
                    <div
                      className={`text-2xl font-black ${confirmedRecord ? "text-green-600" : "text-[#D10A11]"}`}
                    >
                      {cls.time}
                    </div>
                  </div>

                  {confirmedRecord ? (
                    <div className="flex items-center gap-2 text-green-700 text-sm font-bold">
                      <CheckCheck size={18} />
                      Presença confirmada!
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      Aguardando confirmação do professor
                    </div>
                  )}
                </div>
              );
            })}

            {/* Aulas Fechadas */}
            {closedTodayClasses.map((cls) => {
              const classId = (cls.id || cls._id) as string;
              return (
                <div
                  key={classId}
                  className="bg-gray-100 rounded-xl border-2 border-gray-300 p-5 shadow-sm opacity-75"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-gray-600 text-base">
                        {cls.name}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {cls.instructor}
                      </div>
                    </div>
                    <div className="text-2xl font-black text-gray-400">
                      {cls.time}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-red-600 text-sm font-bold bg-red-50 px-3 py-2 rounded-lg">
                    <X size={18} />
                    SEM AULA HOJE
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Attendance */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <CalendarDays size={18} className="text-[#003087]" />
          Presenças Recentes
        </h2>
        {recentAttendance.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500 text-sm">
            Nenhuma presença confirmada ainda.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            {recentAttendance.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      {att.className}
                    </div>
                    <div className="text-xs text-gray-500">{att.classTime}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">
                    {format(parseISO(att.date), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    Confirmada
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
