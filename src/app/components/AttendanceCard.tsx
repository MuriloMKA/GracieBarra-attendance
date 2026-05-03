import React, { useMemo } from "react";
import { format, parseISO, getMonth, getDate, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BeltColor,
  Student,
  Attendance,
  SpecialDate,
} from "../context/DataContext";
import {
  getCardStyle,
  BELT_COLORS,
  BELT_NAMES_PT,
  getDegreeDisplayLabel,
  getNextDegreeDisplayLabel,
  calculateProgram,
} from "./BeltDisplay";
import { getNextDegreeDate } from "../utils/degreeCalculator";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const MONTHS_SHORT = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
];

interface AttendanceCardProps {
  student: Student;
  attendanceHistory: Attendance[];
  year?: number;
  /** If true, admin can click on cells to toggle special dates */
  adminMode?: boolean;
  /** Compact visualization for read-only student mode */
  compact?: boolean;
  historyBeltOptions?: Array<{
    key: string;
    belt: BeltColor;
    label: string;
  }>;
  selectedHistoryBeltKey?: string;
  onSelectHistoryBelt?: (key: string) => void;
  onCellClick?: (date: string, existingType?: "graduation") => void;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  student,
  attendanceHistory,
  year = new Date().getFullYear(),
  adminMode = false,
  compact = false,
  historyBeltOptions,
  selectedHistoryBeltKey,
  onSelectHistoryBelt,
  onCellClick,
}) => {
  const isCompact = compact && !adminMode;

  const actualProgram = calculateProgram(
    student.program,
    student.belt,
    student.degrees,
  );

  const style = getCardStyle(
    actualProgram,
    student.belt,
    student.degrees,
    student.birthDate,
  );

  // Build attendance set: "YYYY-MM-DD" → 'attended'
  const attendedDates = useMemo(() => {
    const set = new Set<string>();
    attendanceHistory.forEach((a) => {
      if (a.confirmed && getYear(parseISO(a.date)) === year) {
        const d = parseISO(a.date);
        const key = `${year}-${String(getMonth(d) + 1).padStart(2, "0")}-${String(getDate(d)).padStart(2, "0")}`;
        set.add(key);
      }
    });
    return set;
  }, [attendanceHistory, year]);

  // Build special dates map: "YYYY-MM-DD" → SpecialDate
  const specialDatesMap = useMemo(() => {
    const map = new Map<
      string,
      SpecialDate | { type: "nextDegree"; date: string; notes?: string }
    >();

    // Adiciona datas especiais existentes (graduações e graus confirmados)
    student.specialDates.forEach((sd) => {
      if (sd.date.startsWith(String(year))) {
        map.set(sd.date, sd);
      }
    });

    // Calcula e adiciona a data prevista do próximo grau
    const nextDegreeDate = getNextDegreeDate(
      attendanceHistory,
      student.lastGraduationDate,
      student.belt,
      student.degrees,
      student.program,
    );

    // Se a data prevista é deste ano e não conflita com graduação já marcada
    if (nextDegreeDate && nextDegreeDate.startsWith(String(year))) {
      // Só adiciona se não houver uma graduação já marcada nesta data
      if (!map.has(nextDegreeDate)) {
        map.set(nextDegreeDate, {
          type: "nextDegree",
          date: nextDegreeDate,
          notes: `Próximo grau previsto (${getNextDegreeDisplayLabel(student.program, student.belt, student.degrees)})`,
        });
      }
    }

    return map;
  }, [
    student.specialDates,
    student.lastGraduationDate,
    student.belt,
    student.degrees,
    student.program,
    attendanceHistory,
    year,
  ]);

  const beltColor = BELT_COLORS[student.belt];

  const gradeDates = student.specialDates
    .filter((sd) => sd.type === "grade")
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-2xl w-full border-4 ${style.outerBorder}`}
      style={{
        backgroundColor: beltColor === "#FFFFFF" ? "#0EA5E9" : undefined,
      }}
    >
      <div className={`${style.outerBg}`}>
        {/* Card Header */}
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isCompact ? "px-3 pt-3 pb-2" : "px-4 pt-4 pb-3"}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`bg-white rounded-full flex items-center justify-center shrink-0 shadow-md ${isCompact ? "p-1 h-11 w-11" : "p-1.5 h-14 w-14"}`}
            >
              <svg
                viewBox="0 0 100 100"
                className="h-full w-full"
                fill="currentColor"
              >
                <text
                  x="50"
                  y="60"
                  fontSize="36"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="#0EA5E9"
                >
                  GB
                </text>
              </svg>
            </div>
            <div>
              <div
                className={`text-xs font-bold tracking-widest uppercase ${style.textSecondary}`}
              >
                {style.label}
              </div>
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${style.textSecondary} opacity-80`}
                  >
                    NOME:
                  </span>
                  <div
                    className={`bg-white/20 px-3 py-0.5 rounded text-white font-bold ${isCompact ? "text-xs min-w-[140px]" : "text-sm min-w-[180px]"}`}
                  >
                    {student.name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${style.textSecondary} opacity-80`}
                  >
                    FAIXA:
                  </span>
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded">
                    {/* Belt color boxes */}
                    {[
                      "White",
                      "Grey",
                      "Yellow",
                      "Orange",
                      "Green",
                      "Blue",
                      "Purple",
                      "Brown",
                      "Black",
                    ].map((b, i) => {
                      const colors: Record<string, string> = {
                        White: "#FFFFFF",
                        Grey: "#9CA3AF",
                        Yellow: "#EAB308",
                        Orange: "#F97316",
                        Green: "#22C55E",
                        Blue: "#2563EB",
                        Purple: "#9333EA",
                        Brown: "#92400E",
                        Black: "#111827",
                      };
                      const isCurrent = b === student.belt;
                      return (
                        <div
                          key={b}
                          className={`${isCompact ? "h-3.5 w-3.5" : "h-4 w-4"} rounded-sm border ${isCurrent ? "ring-2 ring-white ring-offset-1" : "opacity-60"}`}
                          style={{
                            backgroundColor: colors[b],
                            borderColor: b === "White" ? "#9CA3AF" : colors[b],
                          }}
                          title={b}
                        />
                      );
                    })}
                    <span
                      className={`text-white font-bold ml-1 ${isCompact ? "text-[10px]" : "text-xs"}`}
                    >
                      {getDegreeDisplayLabel(
                        actualProgram,
                        student.belt,
                        student.degrees,
                      )}
                    </span>
                  </div>
                </div>
                {historyBeltOptions && historyBeltOptions.length > 0 && (
                  <div className="flex items-start gap-2 pt-1 flex-wrap">
                    <span
                      className={`text-xs font-semibold ${style.textSecondary} opacity-80 mt-1`}
                    >
                      HISTÓRICO:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {historyBeltOptions.map((segment) => {
                        const isSelected =
                          segment.key === selectedHistoryBeltKey;

                        return (
                          <button
                            key={segment.key}
                            type="button"
                            onClick={() => onSelectHistoryBelt?.(segment.key)}
                            className={`px-2 py-1 rounded-full border text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "border-white bg-white text-[#003087]"
                                : "border-white/50 text-white hover:bg-white/20"
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border"
                              style={{
                                backgroundColor: BELT_COLORS[segment.belt],
                                borderColor:
                                  segment.belt === "White"
                                    ? "#9CA3AF"
                                    : BELT_COLORS[segment.belt],
                              }}
                            />
                            {segment.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right - Program label + Last grade dates */}
          <div className="flex flex-col items-end gap-2">
            <div
              className={`bg-white/10 border border-white/20 rounded-lg text-right ${isCompact ? "px-2 py-1.5" : "px-3 py-2"}`}
            >
              <div
                className={`text-[10px] font-bold uppercase tracking-widest ${style.textSecondary} mb-1`}
              >
                Data do Último
                <br />
                Grau
              </div>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`bg-white rounded text-gray-800 font-medium px-2 py-0.5 mb-0.5 text-center ${isCompact ? "text-[10px] min-w-[88px]" : "text-xs min-w-[100px]"}`}
                >
                  {gradeDates[i] ? (
                    format(parseISO(gradeDates[i].date), "dd/MM/yyyy")
                  ) : (
                    <span className="text-gray-300">——</span>
                  )}
                </div>
              ))}
            </div>
            <div
              className={`font-black tracking-wider ${style.textPrimary} ${isCompact ? "text-xl" : "text-2xl"}`}
            >
              GB
              {actualProgram === "GBK"
                ? "[K]"
                : actualProgram.replace("GB", "")}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className={isCompact ? "px-1.5 pb-2" : "px-2 pb-3"}>
          <div className="bg-white rounded-xl shadow-inner overflow-hidden">
            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse"
                style={{ minWidth: isCompact ? 620 : 720 }}
              >
                <thead>
                  <tr className={`${style.gridHeaderBg} text-white`}>
                    <th
                      className={`text-left font-bold border-r border-white/20 ${isCompact ? "px-2 py-1 text-[10px] w-16" : "px-3 py-1.5 text-xs w-24"}`}
                    >
                      Mês
                    </th>
                    {Array.from({ length: 31 }, (_, i) => (
                      <th
                        key={i}
                        className={`text-center font-bold border-r border-white/10 last:border-r-0 px-0 ${isCompact ? "text-[8px] py-1 w-5" : "text-[9px] py-1.5 w-6"}`}
                      >
                        {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MONTHS.map((month, monthIdx) => {
                    const daysInMonth = getDaysInMonth(year, monthIdx);
                    return (
                      <tr
                        key={month}
                        className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <td
                          className={`font-bold text-gray-700 border-r border-gray-200 uppercase tracking-wider whitespace-nowrap ${isCompact ? "px-2 py-1 text-[10px]" : "px-3 py-1 text-[11px]"}`}
                        >
                          {MONTHS_SHORT[monthIdx]}
                        </td>
                        {Array.from({ length: 31 }, (_, dayIdx) => {
                          const day = dayIdx + 1;
                          const isValidDay = day <= daysInMonth;
                          const dateKey = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                          const isAttended =
                            isValidDay && attendedDates.has(dateKey);
                          const specialDate = isValidDay
                            ? specialDatesMap.get(dateKey)
                            : undefined;

                          return (
                            <td
                              key={dayIdx}
                              className={`border-r border-gray-200 last:border-r-0 text-center align-middle relative ${isCompact ? "h-6" : "h-7"}
                                ${!isValidDay ? "bg-gray-100" : ""}
                                ${adminMode && isValidDay ? "cursor-pointer hover:bg-yellow-50" : ""}
                              `}
                              onClick={() => {
                                if (adminMode && isValidDay && onCellClick) {
                                  onCellClick(
                                    dateKey,
                                    specialDate?.type === "graduation"
                                      ? "graduation"
                                      : undefined,
                                  );
                                }
                              }}
                              title={
                                isAttended
                                  ? `Presença: ${day}/${monthIdx + 1}`
                                  : specialDate?.type === "graduation"
                                    ? `Graduação: ${day}/${monthIdx + 1}`
                                    : specialDate?.type === "grade"
                                      ? `Grau confirmado: ${day}/${monthIdx + 1}`
                                      : specialDate?.type === "nextDegree"
                                        ? `Próximo grau previsto (${getNextDegreeDisplayLabel(actualProgram, student.belt, student.degrees)}): ${day}/${monthIdx + 1}`
                                        : adminMode && isValidDay
                                          ? "Clique para marcar graduação"
                                          : ""
                              }
                            >
                              {/* Special date takes priority visually, attendance shown as smaller ring */}
                              {specialDate ? (
                                <div className="relative flex items-center justify-center">
                                  {specialDate.type === "grade" ? (
                                    <div
                                      className={`${isCompact ? "w-3.5 h-3.5 text-[9px]" : "w-4 h-4 text-[10px]"} rounded-sm bg-blue-100 border border-blue-600 text-blue-700 font-black flex items-center justify-center leading-none`}
                                    >
                                      X
                                    </div>
                                  ) : (
                                    <div
                                      className={`${isCompact ? "w-3 h-3" : "w-3.5 h-3.5"} rounded-full shadow-sm ${
                                        specialDate.type === "graduation"
                                          ? "bg-red-600 ring-1 ring-red-800"
                                          : "bg-green-500 border-2 border-dashed border-green-600 animate-pulse"
                                      }`}
                                    />
                                  )}
                                  {isAttended && (
                                    <div
                                      className={`absolute rounded-full border-2 border-gray-400 opacity-30 ${isCompact ? "w-4 h-4" : "w-5 h-5"}`}
                                    />
                                  )}
                                </div>
                              ) : isAttended ? (
                                <div
                                  className={`${isCompact ? "w-2.5 h-2.5" : "w-3 h-3"} rounded-full bg-gray-900 mx-auto shadow-sm`}
                                />
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div
          className={`flex flex-wrap font-medium ${style.textSecondary} ${isCompact ? "px-3 pb-2 gap-3 text-[11px]" : "px-4 pb-3 gap-4 text-xs"}`}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-900 border border-white/50" />
            <span>Presença confirmada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-600 border border-white/50" />
            <span>Graduação (nova faixa)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-sm bg-blue-100 border border-blue-600 text-blue-700 font-black text-[10px] flex items-center justify-center leading-none">
              X
            </div>
            <span>Grau confirmado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-dashed border-green-600 animate-pulse" />
            <span>Próximo grau previsto</span>
          </div>
          {adminMode && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border border-yellow-400 bg-yellow-50" />
              <span>Clique para marcar graduação</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
