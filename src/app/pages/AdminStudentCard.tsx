import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, GraduationCap, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useData, BeltColor, Program } from "../context/DataContext";
import { AttendanceCard } from "../components/AttendanceCard";
import {
  BeltDisplay,
  BELT_NAMES_PT,
  calculateProgram,
} from "../components/BeltDisplay";

const ADULT_BELTS: BeltColor[] = ["White", "Blue", "Purple", "Brown", "Black"];
const GBK_BELTS: BeltColor[] = [
  "White",
  "GreyWhite",
  "Grey",
  "GreyBlack",
  "YellowWhite",
  "Yellow",
  "YellowBlack",
  "OrangeWhite",
  "Orange",
  "OrangeBlack",
  "GreenWhite",
  "Green",
  "GreenBlack",
];

const getAvailableBelts = (program: Program): BeltColor[] =>
  program === "GBK" ? GBK_BELTS : ADULT_BELTS;

const getGraduationBeltOptions = (
  program: Program,
  belt: BeltColor,
): BeltColor[] => {
  const available = getAvailableBelts(program);
  const currentIndex = available.indexOf(belt);
  if (currentIndex === -1) return available;
  const options = available.slice(currentIndex + 1);

  if (
    program === "GBK" &&
    (belt === "Green" || belt === "GreenBlack") &&
    !options.includes("Blue")
  ) {
    options.push("Blue");
  }
  return options;
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
  const match = notes.match(/BELT:([A-Za-z]+(?:[A-Za-z]+)*)/);
  if (!match) return null;
  const belt = match[1] as BeltColor;
  if (BELT_NAMES_PT[belt]) return belt;
  return null;
};

const cleanNotes = (notes?: string): string | undefined => {
  if (!notes) return undefined;
  return (
    notes.replace(/^BELT:[A-Za-z]+(?:[A-Za-z]+)*\|?\s*/, "").trim() || undefined
  );
};

interface BeltHistorySegment {
  key: string;
  belt: BeltColor;
  startDate: string | null;
  endDate: string | null;
  label: string;
}

export const AdminStudentCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { students, attendance, updateStudent, removeSpecialDate, checkIn } =
    useData();

  const [year, setYear] = useState(new Date().getFullYear());
  const [manualAction, setManualAction] = useState<
    "grade" | "graduation" | "attendance"
  >("grade");
  const [manualDate, setManualDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [manualBelt, setManualBelt] = useState<BeltColor>("Blue");
  const [manualNotes, setManualNotes] = useState("");

  const student = students.find((s) => (s.id || s._id) === id);

  const studentId = student ? ((student.id || student._id) as string) : "";

  const studentAttendance = useMemo(
    () =>
      attendance.filter(
        (a) =>
          a.studentId === studentId ||
          (a.studentId as any)?._id === studentId ||
          (a.studentId as any)?.id === studentId,
      ),
    [attendance, studentId],
  );

  const confirmedCount = useMemo(() => {
    const map = new Map<string, number>();
    studentAttendance.forEach((a) => {
      if (a.confirmed) {
        const d = parseISO(a.date);
        const dayOfWeek = d.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          // ignore weekends
          const dateStr = a.date.slice(0, 10);
          const current = map.get(dateStr) || 0;
          if (current < 2) {
            map.set(dateStr, current + 1);
          }
        }
      }
    });

    let total = 0;
    map.forEach((count) => (total += count));
    return total;
  }, [studentAttendance]);
  const gradeDates = (student?.specialDates || [])
    .filter((sd) => sd.type === "grade")
    .sort((a, b) => b.date.localeCompare(a.date));
  const graduationDates = (student?.specialDates || [])
    .filter((sd) => sd.type === "graduation")
    .sort((a, b) => a.date.localeCompare(b.date));

  const beltHistory = useMemo<BeltHistorySegment[]>(() => {
    if (!student) return [];

    const gradEvents: Array<{
      date: string;
      belt: BeltColor;
      notes?: string;
      id?: string;
      _id?: string;
    }> = [];

    graduationDates.forEach((sd) => {
      const belt = extractBeltFromNotes(sd.notes);
      if (belt) {
        gradEvents.push({ ...sd, belt });
      }
    });

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

    const segments: BeltHistorySegment[] = [];
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
  }, [graduationDates, student]);

  const [selectedHistoryKey, setSelectedHistoryKey] = useState<string>(
    beltHistory[beltHistory.length - 1]?.key ||
      (student ? `current-${student.belt}` : ""),
  );

  useEffect(() => {
    const fallbackKey = beltHistory[beltHistory.length - 1]?.key;
    if (!fallbackKey) return;
    if (!beltHistory.some((segment) => segment.key === selectedHistoryKey)) {
      setSelectedHistoryKey(fallbackKey);
    }
  }, [beltHistory, selectedHistoryKey]);

  if (!student) {
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

  const graduationBeltOptions = getGraduationBeltOptions(
    student.program,
    student.belt,
  );

  const resetManualForm = () => {
    setManualAction("grade");
    setManualDate("");
    setManualBelt(graduationBeltOptions[0] || "Blue");
    setManualNotes("");
  };

  const handleManualSubmit = async () => {
    if (!manualDate) {
      toast.error("Selecione uma data.");
      return;
    }

    try {
      if (manualAction === "attendance") {
        const attendanceDateObj = parseISO(manualDate);
        attendanceDateObj.setUTCHours(12);

        const isoDateString = manualDate + "T12:00:00.000Z";

        await checkIn(
          studentId,
          "manual-add",
          "Presença Adicionada Manualmente",
          "00:00",
          true,
          isoDateString,
        );

        toast.success("Presença adicionada com sucesso.");
      } else if (manualAction === "grade") {
        // Do not increment degrees for retrospective (past) grade dates
        const todayIso = new Date().toISOString().split("T")[0];
        const isFutureOrToday = manualDate >= todayIso;

        // Avoid adding duplicate grade for the same date
        const alreadyHasGradeOnDate = (student.specialDates || []).some(
          (sd) => sd.type === "grade" && sd.date === manualDate,
        );
        if (alreadyHasGradeOnDate) {
          toast.error("Já existe um grau registrado nessa data.");
        } else {
          await updateStudent({
            ...student,
            degrees: isFutureOrToday ? student.degrees + 1 : student.degrees,
            specialDates: [
              ...student.specialDates,
              {
                date: manualDate,
                type: "grade",
                notes: manualNotes.trim() || undefined,
              },
            ],
          });
          toast.success("Grau adicionado com sucesso.");
        }
      } else {
        const graduationNoteMetadata = `BELT:${manualBelt}`;
        const fullNotes = manualNotes.trim()
          ? `${graduationNoteMetadata}|${manualNotes.trim()}`
          : graduationNoteMetadata;

        const newProgram =
          student.program === "GBK" && manualBelt === "Blue"
            ? "GB1"
            : student.program;

        await updateStudent({
          ...student,
          belt: manualBelt,
          degrees: 0,
          program: calculateProgram(newProgram, manualBelt, 0),
          lastGraduationDate: manualDate,
          specialDates: [
            ...student.specialDates,
            {
              date: manualDate,
              type: "graduation",
              notes: fullNotes,
            },
          ],
        });
        toast.success(`Faixa atualizada para ${BELT_NAMES_PT[manualBelt]}.`);
      }

      resetManualForm();
    } catch (error) {
      console.error("Erro ao salvar marcação manual:", error);
      toast.error("Não foi possível salvar a marcação.");
    }
  };

  const handleRemoveSpecialDate = async (specialDateId?: string) => {
    if (!specialDateId) return;
    await removeSpecialDate(studentId, specialDateId);
    toast.success("Evento removido do histórico.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
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
              {displayStudent.degrees}
            </div>
            <div className="text-xs text-gray-500">Graus</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
              <GraduationCap size={18} className="text-[#D10A11]" />
              Adicionar Presença, Grau ou Faixa
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Preencha a data e selecione o tipo de evento. Não é mais preciso
              clicar na ficha.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => setManualAction("attendance")}
              className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                manualAction === "attendance"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Adicionar Presença
            </button>
            <button
              type="button"
              onClick={() => setManualAction("grade")}
              className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                manualAction === "grade"
                  ? "bg-[#003087] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Adicionar Grau
            </button>
            <button
              type="button"
              onClick={() => {
                setManualAction("graduation");
                setManualBelt(graduationBeltOptions[0] || "Blue");
              }}
              className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                manualAction === "graduation"
                  ? "bg-[#D10A11] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Adicionar Faixa
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Data
            </label>
            <input
              type="date"
              value={manualDate}
              onChange={(e) => setManualDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
            />
          </div>

          {manualAction === "graduation" && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Nova faixa
              </label>
              <select
                value={manualBelt}
                onChange={(e) => setManualBelt(e.target.value as BeltColor)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D10A11] focus:outline-none text-sm"
              >
                {graduationBeltOptions.map((belt) => (
                  <option key={belt} value={belt}>
                    {BELT_NAMES_PT[belt]}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetManualForm}
              className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium text-sm"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={handleManualSubmit}
              className="flex-1 px-5 py-2.5 rounded-xl font-black text-sm shadow-lg transition-all bg-[#D10A11] hover:bg-red-700 text-white"
            >
              Salvar
            </button>
          </div>
        </div>

        <AttendanceCard
          student={displayStudent}
          attendanceHistory={filteredAttendance}
          year={year}
          adminMode={false}
          historyBeltOptions={beltHistory.map((segment) => ({
            key: segment.key,
            belt: segment.belt,
            label: segment.label,
          }))}
          selectedHistoryBeltKey={selectedHistoryKey}
          onSelectHistoryBelt={setSelectedHistoryKey}
        />
      </div>

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
                    onClick={() => handleRemoveSpecialDate(sd.id || sd._id)}
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
    </div>
  );
};
