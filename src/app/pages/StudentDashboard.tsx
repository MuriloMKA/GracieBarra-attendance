import React, { useState } from 'react';
import { Link } from 'react-router';
import { useData } from '../context/DataContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, Clock, CreditCard, Award, CalendarDays, CheckCheck, AlertCircle } from 'lucide-react';
import { BeltDisplay, getCardStyle } from '../components/BeltDisplay';
import { toast } from 'sonner';

export const StudentDashboard: React.FC = () => {
  const { currentUser, students, attendance, classes, checkIn } = useData();
  const [checkedInClasses, setCheckedInClasses] = useState<string[]>([]);

  const student = students.find(s => s.id === currentUser?.studentId);
  if (!student) return <div className="p-8 text-center text-gray-500">Perfil de aluno não encontrado.</div>;

  const today = new Date();
  const todayDOW = today.getDay();
  const todayStr = today.toISOString().split('T')[0];

  // Filter classes available today
  const todayClasses = classes.filter(c => c.daysOfWeek.includes(todayDOW));

  // Already checked in classes today (confirmed or pending)
  const myTodayAttendance = attendance.filter(
    a => a.studentId === student.id && a.date.startsWith(todayStr)
  );
  const alreadyCheckedClassIds = new Set(myTodayAttendance.map(a => a.classId));

  // Stats
  const myAllAttendance = attendance.filter(a => a.studentId === student.id);
  const confirmedCount = myAllAttendance.filter(a => a.confirmed).length;
  const pendingCount = myAllAttendance.filter(a => !a.confirmed).length;

  const cardStyle = getCardStyle(student.program, student.belt, student.degrees);

  const handleCheckIn = (cls: { id: string; name: string; time: string }) => {
    if (alreadyCheckedClassIds.has(cls.id)) {
      toast.error('Você já realizou check-in nesta aula hoje.');
      return;
    }
    checkIn(student.id, cls.id, cls.name, cls.time);
    setCheckedInClasses(prev => [...prev, cls.id]);
    toast.success(`Check-in realizado para ${cls.name} ${cls.time}! Aguarde a confirmação do professor.`);
  };

  // Recent confirmed attendance (last 5)
  const recentAttendance = myAllAttendance
    .filter(a => a.confirmed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Olá, {student.name.split(' ')[0]}! 👊
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <CalendarDays size={15} />
            {format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <div className="text-2xl font-black text-[#D10A11]">{confirmedCount}</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Aulas Confirmadas</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <div className="text-2xl font-black text-[#003087]">{student.degrees}</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Graus na Faixa</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <div className="text-2xl font-black text-amber-500">{pendingCount}</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Pendentes</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <div className="text-2xl font-black text-green-600">{student.specialDates.filter(sd => sd.type === 'graduation').length}</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Graduações</div>
        </div>
      </div>

      {/* Belt Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Award size={18} className="text-[#D10A11]" />
          Minha Faixa
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <BeltDisplay belt={student.belt} degrees={student.degrees} program={student.program} size="lg" />
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              <span className="font-medium">Programa:</span>{' '}
              <span className="bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-800">{student.program}</span>
            </div>
            <div>
              <span className="font-medium">Última graduação:</span>{' '}
              {format(parseISO(student.lastGraduationDate), 'dd/MM/yyyy')}
            </div>
            <div>
              <span className="font-medium">Próximo grau estimado:</span>{' '}
              <span className="text-[#003087] font-bold">{format(parseISO(student.nextDegreeDate), 'dd/MM/yyyy')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Classes - CHECK-IN */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Clock size={18} className="text-[#D10A11]" />
          Aulas de Hoje — Faça seu Check-In
        </h2>
        {todayClasses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500">
            Não há aulas agendadas para hoje.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayClasses.map(cls => {
              const isCheckedIn = alreadyCheckedClassIds.has(cls.id) || checkedInClasses.includes(cls.id);
              const pendingRecord = myTodayAttendance.find(a => a.classId === cls.id && !a.confirmed);
              const confirmedRecord = myTodayAttendance.find(a => a.classId === cls.id && a.confirmed);
              return (
                <div
                  key={cls.id}
                  className={`bg-white rounded-xl border-2 p-5 shadow-sm transition-all ${
                    confirmedRecord
                      ? 'border-green-400 bg-green-50'
                      : pendingRecord
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-gray-200 hover:border-[#D10A11]/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-gray-900 text-base">{cls.name}</div>
                      <div className="text-gray-500 text-sm">{cls.instructor}</div>
                    </div>
                    <div className={`text-2xl font-black ${confirmedRecord ? 'text-green-600' : pendingRecord ? 'text-amber-600' : 'text-[#D10A11]'}`}>
                      {cls.time}
                    </div>
                  </div>

                  {confirmedRecord ? (
                    <div className="flex items-center gap-2 text-green-700 text-sm font-bold">
                      <CheckCheck size={18} />
                      Presença confirmada!
                    </div>
                  ) : pendingRecord ? (
                    <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                      <AlertCircle size={16} />
                      Aguardando confirmação do professor
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(cls)}
                      className="w-full py-2.5 bg-[#D10A11] hover:bg-red-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg"
                    >
                      <CheckCircle2 size={18} />
                      Fazer Check-In
                    </button>
                  )}
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
            {recentAttendance.map(att => (
              <div key={att.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{att.className}</div>
                    <div className="text-xs text-gray-500">{att.classTime}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">
                    {format(parseISO(att.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                  <div className="text-xs text-green-600 font-medium">Confirmada</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};