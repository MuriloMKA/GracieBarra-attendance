import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import { useData, BeltColor, Program } from "../context/DataContext";
import { AttendanceCard } from "../components/AttendanceCard";
import {
  BeltDisplay,
  BELT_NAMES_PT,
  calculateProgram,
} from "../components/BeltDisplay";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, X, GraduationCap, Trash2, Info } from "lucide-react";
import { toast } from "sonner";

const ADULT_BELTS: BeltColor[] = ["White", "Blue", "Purple", "Brown", "Black"];
const GBK_BELTS: BeltColor[] = ["White", "Grey", "Yellow", "Orange", "Green"];

const getAvailableBelts = (program: Program): BeltColor[] =>
  program === "GBK" ? GBK_BELTS : ADULT_BELTS;

// Opções de faixa para a transição (incluindo transição de GBK para GB1)
const getGraduationBeltOptions = (
  program: Program,
  belt: BeltColor,
): BeltColor[] => {
  if (program === "GBK" && belt === "Green") {
    // Transição de juvenil para adulto
    return ["Green", "Blue"];
  }
  return getAvailableBelts(program);
};

const getPreviousBelt = (
  belt: BeltColor,
  program: Program,
): BeltColor | undefined => {
  const orderedBelts = getAvailableBelts(program);
  const currentIndex = orderedBelts.indexOf(belt);
  if (currentIndex <= 0) return undefined;
  return orderedBelts[currentIndex - 1];
};

const withDayBefore = (isoDate: string): string => {
  const date = parseISO(isoDate);
  date.setDate(date.getDate() - 1);
  return format(date, "yyyy-MM-dd");
};

const extractBeltFromNotes = (notes?: string): BeltColor | null => {
  if (!notes) return null;
  const match = notes.match(/BELT:([A-Za-z]+)/);
  if (!match) return null;
  const belt = match[1] as BeltColor;
  if (BELT_NAMES_PT[belt]) return belt;
  return null;
};

const cleanNotes = (notes?: string): string | undefined => {
  if (!notes) return undefined;
  return notes.replace(/^BELT:[A-Za-z]+\|?\s*/, "").trim() || undefined;
};

interface BeltHistorySegment {
  key: string;
  belt: BeltColor;
  startDate: string | null;
  endDate: string | null;
  label: string;
}

interface MarkDateModalProps {
  date: string;
  existingType?: "graduation";
  currentBelt: BeltColor;
  currentProgram: Program;
  onConfirm: (newBelt: BeltColor, notes: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

function MarkDateModal({
  date,
  existingType,
  currentBelt,
  currentProgram,
  onConfirm,
  onRemove,
  onClose,
}: MarkDateModalProps) {
  const beltOptions = getGraduationBeltOptions(currentProgram, currentBelt);
  const [selectedBelt, setSelectedBelt] = useState<BeltColor>(currentBelt);
  const [notes, setNotes] = useState("");
  const displayDate = format(parseISO(date), "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-gray-900 text-lg">Marcar Graduação</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={22} />
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Data selecionada: <strong>{displayDate}</strong>
        </p>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <GraduationCap size={24} className="text-[#D10A11]" />
            <div>
              <div className="font-bold text-gray-900">
                Graduação (Nova Faixa)
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                Marque o dia em que o aluno recebeu nova faixa. Os graus são
                incrementados automaticamente ao confirmar presença.
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Nova faixa do aluno
          </label>
          <select
            value={selectedBelt}
            onChange={(e) => setSelectedBelt(e.target.value as BeltColor)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D10A11] focus:outline-none text-sm"
          >
            {beltOptions.map((belt) => (
              <option key={belt} value={belt}>
                {BELT_NAMES_PT[belt]}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Observação (opcional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Entrega oficial da nova faixa"
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
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(selectedBelt, notes)}
            className="px-5 py-2.5 bg-[#D10A11] hover:bg-red-700 text-white rounded-xl font-black text-sm shadow-lg transition-all"
          >
            Confirmar Graduação
          </button>
        </div>
      </div>
    </div>
  );
}

export const AdminStudentCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { students, attendance, removeSpecialDate, updateStudent } = useData();
  const [markingDate, setMarkingDate] = useState<{
    date: string;
    existingType?: "graduation";
  } | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  const student = students.find((s) => (s.id || s._id) === id);
  if (!student || !student.id) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">
        <p>Aluno não encontrado.</p>
        <Link
          to="/admin/students"
          className="text-[#003087] hover:underline mt-2 block"
        >
          Voltar para lista
        </Link>
      </div>
    );
  }

  const studentId = student.id; // Type narrowing

  const studentAttendance = attendance.filter(
    (a) => a.studentId === student.id,
  );
  const confirmedCount = studentAttendance.filter((a) => a.confirmed).length;
  const gradeDates = student.specialDates
    .filter((sd) => sd.type === "grade")
    .sort((a, b) => b.date.localeCompare(a.date));

  const graduationDates = student.specialDates
    .filter((sd) => sd.type === "graduation")
    .sort((a, b) => a.date.localeCompare(b.date));

  const beltHistory = useMemo<BeltHistorySegment[]>(() => {
    const segments: BeltHistorySegment[] = [];

    const gradEvents = graduationDates
      .map((sd) => ({ ...sd, belt: extractBeltFromNotes(sd.notes) }))
      .filter((sd) => Boolean(sd.belt)) as Array<{
      date: string;
      belt: BeltColor;
      notes?: string;
      id?: string;
      _id?: string;
    }>;

    if (gradEvents.length === 0) {
      return [
        {
          key: `current-${student.belt}`,
          belt: student.belt,
          startDate: null,
          endDate: null,
          label: "Faixa Atual",
        },
      ];
    }

    gradEvents.forEach((event, index) => {
      const nextEvent = gradEvents[index + 1];
      segments.push({
        key: `${event.belt}-${event.date}`,
        belt: event.belt,
        startDate: event.date,
        endDate: nextEvent ? withDayBefore(nextEvent.date) : null,
        label: BELT_NAMES_PT[event.belt],
      });
    });

    const first = gradEvents[0];
    const previousBelt = getPreviousBelt(first.belt, student.program);
    if (previousBelt) {
      segments.unshift({
        key: `before-${first.date}`,
        belt: previousBelt,
        startDate: null,
        endDate: withDayBefore(first.date),
        label: BELT_NAMES_PT[previousBelt],
      });
    }

    return segments;
  }, [graduationDates, student.belt, student.program]);

  const [selectedHistoryKey, setSelectedHistoryKey] = useState<string>(
    beltHistory[beltHistory.length - 1]?.key || `current-${student.belt}`,
  );

  useEffect(() => {
    const fallbackKey = beltHistory[beltHistory.length - 1]?.key;
    if (!fallbackKey) return;
    if (!beltHistory.some((segment) => segment.key === selectedHistoryKey)) {
      setSelectedHistoryKey(fallbackKey);
    }
  }, [beltHistory, selectedHistoryKey]);

  const activeHistory =
    beltHistory.find((segment) => segment.key === selectedHistoryKey) ||
    beltHistory[beltHistory.length - 1];

  const isDateInSelectedHistory = (dateInput: string): boolean => {
    if (!activeHistory) return true;
    const date = dateInput.slice(0, 10);
    if (activeHistory.startDate && date < activeHistory.startDate) return false;
    if (activeHistory.endDate && date > activeHistory.endDate) return false;
    return true;
  };

  const filteredAttendance = studentAttendance.filter((a) =>
    isDateInSelectedHistory(a.date),
  );

  const filteredSpecialDates = student.specialDates.filter((sd) =>
    isDateInSelectedHistory(sd.date),
  );

  const displayStudent = {
    ...student,
    belt: activeHistory?.belt || student.belt,
    program: calculateProgram(
      student.program,
      activeHistory?.belt || student.belt,
      student.degrees,
    ),
    specialDates: filteredSpecialDates,
  };

  const handleCellClick = (date: string, existingType?: "graduation") => {
    setMarkingDate({ date, existingType });
  };

  const handleMarkConfirm = async (newBelt: BeltColor, notes: string) => {
    if (!markingDate) return;

    const graduationNoteMetadata = `BELT:${newBelt}`;
    const fullNotes = notes.trim()
      ? `${graduationNoteMetadata}|${notes.trim()}`
      : graduationNoteMetadata;

    const specialDatesWithoutGraduationOnDay = student.specialDates.filter(
      (sd) => !(sd.date === markingDate.date && sd.type === "graduation"),
    );

    // Detectar transição de GBK para adulto (Green para Blue)
    let newProgram = student.program;
    if (student.program === "GBK" && newBelt === "Blue") {
      newProgram = "GB1"; // Transição de juvenil para adulto
    }

    try {
      await updateStudent({
        ...student,
        belt: newBelt,
        degrees: 0,
        program: calculateProgram(newProgram, newBelt, 0),
        lastGraduationDate: markingDate.date,
        specialDates: [
          ...specialDatesWithoutGraduationOnDay,
          {
            date: markingDate.date,
            type: "graduation",
            notes: fullNotes,
          },
        ],
      });

      const transitionMsg =
        student.program === "GBK" && newBelt === "Blue"
          ? " - Transição de juvenil para adulto realizada!"
          : "";
      toast.success(
        `Graduação registrada e faixa atualizada para ${BELT_NAMES_PT[newBelt]}.${transitionMsg}`,
      );
      setMarkingDate(null);
    } catch (error) {
      console.error("Erro ao registrar graduação:", error);
      toast.error("Não foi possível registrar a graduação.");
    }
  };

  const handleMarkRemove = async () => {
    if (!markingDate) return;
    const existing = student.specialDates.find(
      (sd) => sd.date === markingDate.date,
    );
    const existingId = existing?.id || existing?._id;
    if (existingId) {
      await removeSpecialDate(studentId, existingId);
      toast.success("Marcação removida.");
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
            <h1 className="text-xl font-black text-gray-900">
              Cartão de Frequência
            </h1>
            <p className="text-gray-500 text-sm">{student.name}</p>
          </div>
        </div>
        {/* Year selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium"
          >
            ← {year - 1}
          </button>
          <span className="px-4 py-1.5 bg-[#003087] text-white rounded-lg font-black text-sm">
            {year}
          </span>
          <button
            onClick={() => setYear((y) => y + 1)}
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
          <BeltDisplay
            belt={student.belt}
            degrees={student.degrees}
            program={student.program}
            size="md"
          />
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-2xl font-black text-[#003087]">
              {confirmedCount}
            </div>
            <div className="text-xs text-gray-500">Aulas</div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#D10A11]">
              {graduationDates.length}
            </div>
            <div className="text-xs text-gray-500">Graduações</div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">
              {gradeDates.length}
            </div>
            <div className="text-xs text-gray-500">Graus</div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <Info size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <div className="text-sm text-amber-800">
          <strong>Modo Admin:</strong> Clique em qualquer célula do calendário
          para marcar datas de <strong>graduação</strong> (nova faixa - bolinha
          vermelha). Os <strong>graus</strong> são incrementados automaticamente
          quando você confirma a presença do aluno e ficam marcados com{" "}
          <strong>X azul</strong> na ficha.
        </div>
      </div>

      {/* Attendance Card */}
      <AttendanceCard
        student={displayStudent}
        attendanceHistory={filteredAttendance}
        year={year}
        adminMode={true}
        historyBeltOptions={beltHistory.map((segment) => ({
          key: segment.key,
          belt: segment.belt,
          label: segment.label,
        }))}
        selectedHistoryBeltKey={selectedHistoryKey}
        onSelectHistoryBelt={setSelectedHistoryKey}
        onCellClick={handleCellClick}
      />

      {/* Degree and Graduation History */}
      {student.specialDates.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap size={20} className="text-[#D10A11]" />
            Histórico de Graus e Graduações
          </h3>
          <div className="space-y-2">
            {[...student.specialDates]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((sd, i) => (
                <div
                  key={`${sd.date}-${sd.type}-${sd.id || sd._id || i}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-black ${sd.type === "graduation" ? "bg-[#D10A11]" : "bg-blue-600"}`}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">
                        {format(parseISO(sd.date), "d 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {sd.type === "graduation"
                          ? `Graduação: ${BELT_NAMES_PT[extractBeltFromNotes(sd.notes) || student.belt]}`
                          : "Grau automático confirmado"}
                        {cleanNotes(sd.notes)
                          ? ` — ${cleanNotes(sd.notes)}`
                          : ""}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const eventId = sd.id || sd._id;
                      if (eventId) {
                        removeSpecialDate(studentId, eventId);
                        toast.success("Evento removido do histórico.");
                      }
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
          currentBelt={student.belt}
          currentProgram={student.program}
          onConfirm={handleMarkConfirm}
          onRemove={handleMarkRemove}
          onClose={() => setMarkingDate(null)}
        />
      )}
    </div>
  );
};
