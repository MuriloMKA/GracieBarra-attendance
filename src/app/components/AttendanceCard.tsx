import React, { useMemo } from "react";
import { format, parseISO, getMonth, getDate, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Student, Attendance, SpecialDate } from "../context/DataContext";
import { getCardStyle, BELT_COLORS, BELT_NAMES_PT } from "./BeltDisplay";

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
  onCellClick?: (date: string, existingType?: "graduation" | "grade") => void;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  student,
  attendanceHistory,
  year = new Date().getFullYear(),
  adminMode = false,
  onCellClick,
}) => {
  const style = getCardStyle(student.program, student.belt, student.degrees);

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
    const map = new Map<string, SpecialDate>();
    student.specialDates.forEach((sd) => {
      if (sd.date.startsWith(String(year))) {
        map.set(sd.date, sd);
      }
    });
    return map;
  }, [student.specialDates, year]);

  const beltColor = BELT_COLORS[student.belt];

  const graduationDates = student.specialDates
    .filter((sd) => sd.type === "graduation")
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-2xl w-full border-4 ${style.outerBorder}`}
      style={{
        backgroundColor: beltColor === "#FFFFFF" ? "#0EA5E9" : undefined,
      }}
    >
      <div className={`${style.outerBg}`}>
        {/* Card Header */}
        <div className="px-4 pt-4 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-1.5 h-14 w-14 flex items-center justify-center shrink-0 shadow-md">
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
                  <div className="bg-white/20 px-3 py-0.5 rounded text-white text-sm font-bold min-w-[180px]">
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
                          className={`h-4 w-4 rounded-sm border ${isCurrent ? "ring-2 ring-white ring-offset-1" : "opacity-60"}`}
                          style={{
                            backgroundColor: colors[b],
                            borderColor: b === "White" ? "#9CA3AF" : colors[b],
                          }}
                          title={b}
                        />
                      );
                    })}
                    <span className="text-white text-xs font-bold ml-1">
                      {student.degrees}°
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Program label + Graduation dates */}
          <div className="flex flex-col items-end gap-2">
            <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-right">
              <div
                className={`text-[10px] font-bold uppercase tracking-widest ${style.textSecondary} mb-1`}
              >
                Data da Última
                <br />
                Graduação
              </div>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded text-gray-800 text-xs font-medium px-2 py-0.5 mb-0.5 min-w-[100px] text-center"
                >
                  {graduationDates[i] ? (
                    format(parseISO(graduationDates[i].date), "dd/MM/yyyy")
                  ) : (
                    <span className="text-gray-300">——</span>
                  )}
                </div>
              ))}
            </div>
            <div
              className={`text-2xl font-black tracking-wider ${style.textPrimary}`}
            >
              GB
              {student.program === "GBK"
                ? "[K]"
                : student.program.replace("GB", "")}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="px-2 pb-3">
          <div className="bg-white rounded-xl shadow-inner overflow-hidden">
            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse"
                style={{ minWidth: 720 }}
              >
                <thead>
                  <tr className={`${style.gridHeaderBg} text-white`}>
                    <th className="text-left px-3 py-1.5 text-xs font-bold border-r border-white/20 w-24">
                      Mês
                    </th>
                    {Array.from({ length: 31 }, (_, i) => (
                      <th
                        key={i}
                        className="text-center text-[9px] font-bold border-r border-white/10 last:border-r-0 px-0 py-1.5 w-6"
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
                        <td className="px-3 py-1 text-[11px] font-bold text-gray-700 border-r border-gray-200 uppercase tracking-wider whitespace-nowrap">
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
                              className={`border-r border-gray-200 last:border-r-0 h-7 text-center align-middle relative
                                ${!isValidDay ? "bg-gray-100" : ""}
                                ${adminMode && isValidDay ? "cursor-pointer hover:bg-yellow-50" : ""}
                              `}
                              onClick={() => {
                                if (adminMode && isValidDay && onCellClick) {
                                  onCellClick(dateKey, specialDate?.type);
                                }
                              }}
                              title={
                                isAttended
                                  ? `Presença: ${day}/${monthIdx + 1}`
                                  : specialDate?.type === "graduation"
                                    ? `Graduação: ${day}/${monthIdx + 1}`
                                    : specialDate?.type === "grade"
                                      ? `Novo Grau: ${day}/${monthIdx + 1}`
                                      : adminMode && isValidDay
                                        ? "Clique para marcar"
                                        : ""
                              }
                            >
                              {/* Special date takes priority visually, attendance shown as smaller ring */}
                              {specialDate ? (
                                <div className="relative flex items-center justify-center">
                                  <div
                                    className={`w-3.5 h-3.5 rounded-full shadow-sm ${specialDate.type === "graduation" ? "bg-red-600 ring-1 ring-red-800" : "bg-red-500"}`}
                                  />
                                  {isAttended && (
                                    <div className="absolute w-5 h-5 rounded-full border-2 border-gray-400 opacity-30" />
                                  )}
                                </div>
                              ) : isAttended ? (
                                <div className="w-3 h-3 rounded-full bg-gray-900 mx-auto shadow-sm" />
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
          className={`px-4 pb-3 flex flex-wrap gap-4 text-xs font-medium ${style.textSecondary}`}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-900 border border-white/50" />
            <span>Presença confirmada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-600 border border-white/50" />
            <span>Graduação / Novo grau</span>
          </div>
          {adminMode && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border border-yellow-400 bg-yellow-50" />
              <span>Clique em um dia para marcar</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
