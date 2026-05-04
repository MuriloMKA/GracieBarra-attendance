import React, { useMemo, useState } from "react";
import { Link } from "react-router";
import { useData, BeltColor } from "../context/DataContext";
import { AttendanceCard } from "../components/AttendanceCard";
import { BELT_NAMES_PT } from "../components/BeltDisplay";
import { ArrowLeft, Info } from "lucide-react";
import { parseISO, format } from "date-fns";

const extractBeltFromNotes = (notes?: string): BeltColor | null => {
  if (!notes) return null;
  const match = notes.match(/BELT:([A-Za-z]+)/);
  if (!match) return null;
  const belt = match[1] as BeltColor;
  if (BELT_NAMES_PT[belt]) return belt;
  return null;
};

const getPreviousBelt = (
  belt: BeltColor,
  program: string,
): BeltColor | undefined => {
  const GBK_BELTS: BeltColor[] = ["White", "Grey", "Yellow", "Orange", "Green"];
  const ADULT_BELTS: BeltColor[] = [
    "White",
    "Blue",
    "Purple",
    "Brown",
    "Black",
  ];
  const orderedBelts = program === "GBK" ? GBK_BELTS : ADULT_BELTS;
  const currentIndex = orderedBelts.indexOf(belt);
  if (currentIndex <= 0) return undefined;
  return orderedBelts[currentIndex - 1];
};

const withDayBefore = (isoDate: string): string => {
  const date = parseISO(isoDate);
  date.setDate(date.getDate() - 1);
  return format(date, "yyyy-MM-dd");
};

interface BeltHistorySegment {
  key: string;
  belt: BeltColor;
  startDate: string | null;
  endDate: string | null;
  label: string;
}

export const StudentCard: React.FC = () => {
  const { currentUser, students, attendance } = useData();
  const [selectedHistoryKey, setSelectedHistoryKey] = useState<
    string | undefined
  >(undefined);

  const student = students.find(
    (s) => (s.id || s._id) === currentUser?.studentId,
  );
  if (!student)
    return (
      <div className="p-8 text-center text-gray-500">Aluno não encontrado.</div>
    );

  const myAttendance = attendance.filter(
    (a) => a.studentId === (student.id || student._id),
  );

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

  const isDateInSelectedHistory = (dateInput: string): boolean => {
    if (!selectedHistoryKey) return true;
    const activeHistory = beltHistory.find(
      (segment) => segment.key === selectedHistoryKey,
    );
    if (!activeHistory) return true;

    const date = dateInput.slice(0, 10);
    if (activeHistory.startDate && date < activeHistory.startDate) return false;
    if (activeHistory.endDate && date > activeHistory.endDate) return false;
    return true;
  };

  const filteredAttendance = myAttendance.filter((a) =>
    isDateInSelectedHistory(a.date),
  );

  const activeHistory =
    selectedHistoryKey &&
    beltHistory.find((segment) => segment.key === selectedHistoryKey);

  const displayStudent = activeHistory
    ? {
        ...student,
        belt: activeHistory.belt,
        specialDates: student.specialDates.filter((sd) =>
          isDateInSelectedHistory(sd.date),
        ),
      }
    : student;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/student"
          className="flex items-center gap-2 text-gray-500 hover:text-[#D10A11] transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} />
          Voltar ao Início
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-black text-gray-900">
            Meu Cartão de Frequência
          </h1>
          <p className="text-gray-500 text-sm">
            Ano {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <Info size={18} className="text-[#003087] mt-0.5 shrink-0" />
        <div className="text-sm text-[#003087]">
          <strong>Pontos pretos</strong> = aulas que você participou.{" "}
          <strong>Pontos vermelhos</strong> = datas de graduação (nova faixa).{" "}
          <strong>X azul</strong> = grau confirmado automaticamente.{" "}
          <strong>Pontos verdes</strong> = previsão do próximo grau.
        </div>
      </div>

      <AttendanceCard
        student={displayStudent}
        attendanceHistory={filteredAttendance}
        year={new Date().getFullYear()}
        compact
        historyBeltOptions={beltHistory.map((segment) => ({
          key: segment.key,
          belt: segment.belt,
          label: segment.label,
        }))}
        selectedHistoryBeltKey={selectedHistoryKey}
        onSelectHistoryBelt={setSelectedHistoryKey}
      />
    </div>
  );
};
