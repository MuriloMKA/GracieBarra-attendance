import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useData, SpecialDate } from '../context/DataContext';
import { AttendanceCard } from '../components/AttendanceCard';
import { BeltDisplay } from '../components/BeltDisplay';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, X, GraduationCap, Award, Trash2, Info } from 'lucide-react';
import { toast } from 'sonner';

interface MarkDateModalProps {
  date: string;
  existingType?: 'graduation' | 'grade';
  onConfirm: (type: 'graduation' | 'grade', notes: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

function MarkDateModal({ date, existingType, onConfirm, onRemove, onClose }: MarkDateModalProps) {
  const [type, setType] = useState<'graduation' | 'grade'>(existingType || 'grade');
  const [notes, setNotes] = useState('');
  const displayDate = format(parseISO(date), "d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-gray-900 text-lg">Marcar Data Especial</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Data selecionada: <strong>{displayDate}</strong>
        </p>

        <div className="space-y-3 mb-5">
          <label className="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all hover:border-red-300"
            style={{ borderColor: type === 'graduation' ? '#D10A11' : '#E5E7EB' }}
          >
            <input
              type="radio"
              name="markType"
              checked={type === 'graduation'}
              onChange={() => setType('graduation')}
              className="accent-[#D10A11]"
            />
            <div>
              <div className="font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap size={18} className="text-[#D10A11]" />
                Graduação (Nova Faixa)
              </div>
              <div className="text-xs text-gray-500">Marcar dia em que o aluno recebeu nova faixa</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all hover:border-red-300"
            style={{ borderColor: type === 'grade' ? '#D10A11' : '#E5E7EB' }}
          >
            <input
              type="radio"
              name="markType"
              checked={type === 'grade'}
              onChange={() => setType('grade')}
              className="accent-[#D10A11]"
            />
            <div>
              <div className="font-bold text-gray-900 flex items-center gap-2">
                <Award size={18} className="text-[#D10A11]" />
                Novo Grau (Stripe)
              </div>
              <div className="text-xs text-gray-500">Marcar dia em que o aluno ganhou um grau na faixa</div>
            </div>
          </label>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-bold text-gray-700 mb-1">Observação (opcional)</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: Faixa Azul 1° Grau"
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D10A11] focus:outline-none text-sm"
          />
        </div>

        <div className="flex gap-3">
          {existingType && (
            <button
              onClick={onRemove}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm transition-colors"
            >
              <Trash2 size={16} />
              Remover
            </button>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(type, notes)}
            className="px-5 py-2.5 bg-[#D10A11] hover:bg-red-700 text-white rounded-xl font-black text-sm shadow-lg transition-all"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export const AdminStudentCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { students, attendance, addSpecialDate, removeSpecialDate, updateStudent } = useData();
  const [markingDate, setMarkingDate] = useState<{ date: string; existingType?: 'graduation' | 'grade' } | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  const student = students.find(s => s.id === id);
  if (!student) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">
        <p>Aluno não encontrado.</p>
        <Link to="/admin/students" className="text-[#003087] hover:underline mt-2 block">Voltar para lista</Link>
      </div>
    );
  }

  const studentAttendance = attendance.filter(a => a.studentId === student.id);
  const confirmedCount = studentAttendance.filter(a => a.confirmed).length;
  const graduationDates = student.specialDates
    .filter(sd => sd.type === 'graduation')
    .sort((a, b) => a.date.localeCompare(b.date));

  const handleCellClick = (date: string, existingType?: 'graduation' | 'grade') => {
    setMarkingDate({ date, existingType });
  };

  const handleMarkConfirm = (type: 'graduation' | 'grade', notes: string) => {
    if (!markingDate) return;

    // Remove existing special date for this date if any
    const existing = student.specialDates.find(sd => sd.date === markingDate.date);
    if (existing) {
      removeSpecialDate(student.id, existing.id);
    }

    addSpecialDate(student.id, markingDate.date, type, notes || undefined);

    if (type === 'graduation') {
      // Also update lastGraduationDate
      updateStudent({ ...student, lastGraduationDate: markingDate.date });
      toast.success(`Data de graduação marcada: ${markingDate.date}`);
    } else {
      toast.success(`Novo grau marcado: ${markingDate.date}`);
    }
    setMarkingDate(null);
  };

  const handleMarkRemove = () => {
    if (!markingDate) return;
    const existing = student.specialDates.find(sd => sd.date === markingDate.date);
    if (existing) {
      removeSpecialDate(student.id, existing.id);
      toast.success('Marcação removida.');
    }
    setMarkingDate(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/students"
            className="flex items-center gap-2 text-gray-500 hover:text-[#D10A11] transition-colors text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Voltar
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900">Cartão de Frequência</h1>
            <p className="text-gray-500 text-sm">{student.name}</p>
          </div>
        </div>
        {/* Year selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYear(y => y - 1)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium"
          >
            ← {year - 1}
          </button>
          <span className="px-4 py-1.5 bg-[#003087] text-white rounded-lg font-black text-sm">{year}</span>
          <button
            onClick={() => setYear(y => y + 1)}
            disabled={year >= new Date().getFullYear()}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {year + 1} →
          </button>
        </div>
      </div>

      {/* Student Info Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#003087] text-white flex items-center justify-center font-black text-xl">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="font-black text-gray-900">{student.name}</div>
            <div className="text-sm text-gray-500">{student.email}</div>
          </div>
        </div>
        <div className="flex-1 sm:px-6">
          <BeltDisplay belt={student.belt} degrees={student.degrees} program={student.program} size="md" />
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-2xl font-black text-[#003087]">{confirmedCount}</div>
            <div className="text-xs text-gray-500">Aulas</div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#D10A11]">{graduationDates.length}</div>
            <div className="text-xs text-gray-500">Graduações</div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <Info size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <div className="text-sm text-amber-800">
          <strong>Modo Admin:</strong> Clique em qualquer célula do calendário para marcar ou desmarcar datas de <strong>graduação</strong> (nova faixa) ou <strong>novo grau</strong> (stripe).
          Os pontos vermelhos aparecem no cartão do aluno.
        </div>
      </div>

      {/* Attendance Card */}
      <AttendanceCard
        student={student}
        attendanceHistory={studentAttendance}
        year={year}
        adminMode={true}
        onCellClick={handleCellClick}
      />

      {/* Graduation History */}
      {graduationDates.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap size={20} className="text-[#D10A11]" />
            Histórico de Graduações
          </h3>
          <div className="space-y-2">
            {graduationDates.map((sd, i) => (
              <div key={sd.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D10A11] text-white flex items-center justify-center text-xs font-black">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">
                      {format(parseISO(sd.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                    {sd.notes && <div className="text-xs text-gray-500">{sd.notes}</div>}
                  </div>
                </div>
                <button
                  onClick={() => {
                    removeSpecialDate(student.id, sd.id);
                    toast.success('Graduação removida do histórico.');
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remover"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mark Date Modal */}
      {markingDate && (
        <MarkDateModal
          date={markingDate.date}
          existingType={markingDate.existingType}
          onConfirm={handleMarkConfirm}
          onRemove={handleMarkRemove}
          onClose={() => setMarkingDate(null)}
        />
      )}
    </div>
  );
};
