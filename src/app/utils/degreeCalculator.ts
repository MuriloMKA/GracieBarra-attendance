import { BeltColor, Attendance } from "../context/DataContext";
import { startOfWeek, parseISO, addDays, format, parse } from "date-fns";

/**
 * REGRAS DE GRADUAÇÃO (graus)
 *
 * Adultos e GBK Juvenil contam por SEMANAS de treino:
 * - Semana = domingo a sábado.
 * - 2 treinos ou mais na semana = 1 semana (treinar mais não conta mais semana).
 * - 1 treino na semana = meia semana (0,5). As metades se somam: 0,5 + 0,5 = 1.
 * - Duas aulas no mesmo dia contam como 2 treinos (máximo 2 por dia).
 * - 1 mês = 4 semanas completas.
 *
 * GBK Kids continua contando por TREINOS: 8 treinos por grau.
 *
 * Só contam presenças confirmadas, nos dias de aula do programa, a partir do
 * dia seguinte à última graduação.
 */

export type ProgressUnit = "semanas" | "treinos";

const MAX_TRAININGS_PER_DAY = 2;

// Semanas necessárias para cada grau. Índice = grau atual (0 → para o 1º grau).
const ADULT_WEEKS_REQUIRED: Partial<Record<BeltColor, number[]>> = {
  White: [4, 4, 8, 16], // 1º e 2º: 1 mês | 3º: 2 meses | 4º: 4 meses
  Blue: [16, 20, 20, 20], // 1º: 4 meses | 2º ao 4º: 5 meses
  Purple: [12, 12, 16, 16], // 1º e 2º: 3 meses | 3º e 4º: 4 meses
  Brown: [12, 12, 16, 16], // 1º e 2º: 3 meses | 3º e 4º: 4 meses
  Black: [156, 156, 156, 260, 260, 260], // 1º ao 3º: 3 anos | 4º ao 6º: 5 anos
};

const GBK_KIDS_TRAININGS_PER_DEGREE = 8;
const GBK_JUVENIL_WEEKS_PER_DEGREE = 4; // 1 mês por grau

const isValidIsoDate = (value?: string | null): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const parseFlexibleDate = (value?: string | null): Date | null => {
  if (!isValidIsoDate(value)) return null;

  const trimmed = value.trim();
  const isoDate = parseISO(trimmed);
  if (!Number.isNaN(isoDate.getTime())) return isoDate;

  const brazilianDate = parse(trimmed, "dd/MM/yyyy", new Date());
  if (!Number.isNaN(brazilianDate.getTime())) return brazilianDate;

  const fallbackDate = new Date(trimmed);
  if (!Number.isNaN(fallbackDate.getTime())) return fallbackDate;

  return null;
};

const toDateOnlyString = (value?: string | null): string | null => {
  if (!isValidIsoDate(value)) return null;

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parsed = parseFlexibleDate(trimmed);
  if (!parsed) return null;
  return format(parsed, "yyyy-MM-dd");
};

/**
 * Dia (YYYY-MM-DD) de uma presença no fuso local do navegador.
 * As presenças são salvas em UTC (toISOString); um check-in às 21h+ no Brasil
 * fica gravado como o dia seguinte em UTC. Usar `date.slice(0, 10)` faz o
 * contador divergir da ficha (que desenha as bolinhas pelo dia local).
 */
export const getAttendanceDayKey = (value: string): string => {
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 10);
  return format(parsed, "yyyy-MM-dd");
};

const calculateAge = (birthDate?: string): number | null => {
  const date = parseFlexibleDate(birthDate);
  if (!date) return null;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }

  return age;
};

const isGbkProgram = (program?: string): boolean =>
  program === "GBK" || program === "GBKIDS" || program === "GBKJUVENIL";

const resolveGbkProgram = (
  program?: string,
  birthDate?: string,
): "GBKIDS" | "GBKJUVENIL" => {
  if (program === "GBKIDS" || program === "GBKJUVENIL") {
    return program;
  }

  const age = calculateAge(birthDate);
  return age !== null && age <= 7 ? "GBKIDS" : "GBKJUVENIL";
};

const getValidTrainingDays = (
  program?: string,
  birthDate?: string,
): Set<number> => {
  const resolvedProg = isGbkProgram(program)
    ? resolveGbkProgram(program, birthDate)
    : program;

  if (resolvedProg === "GBKIDS") return new Set([1, 3]); // Mon, Wed
  if (resolvedProg === "GBKJUVENIL") return new Set([1, 2, 3, 4]); // Mon-Thu
  return new Set([1, 2, 3, 4, 5]); // Mon-Fri (adults)
};

/**
 * Retorna o número máximo de graus para cada faixa GBK
 */
const getMaxDegreesForGBK = (belt: BeltColor): number => {
  switch (belt) {
    case "White": // 4 brancos + 1 vermelho
    case "GreyWhite": // 4 brancos + 1 vermelho
      return 5;

    case "Grey": // 4 brancos + 4 vermelhos + 3 amarelos
    case "GreyBlack":
    case "YellowWhite": // 4 brancos + 4 vermelhos + 3 laranjas
    case "Yellow":
    case "YellowBlack":
    case "OrangeWhite": // 4 brancos + 4 vermelhos + 3 verdes
    case "Orange":
    case "OrangeBlack":
    case "GreenWhite": // 4 brancos + 4 vermelhos + 3 azuis
    case "Green":
    case "GreenBlack":
      return 11;

    default:
      return 4;
  }
};

/**
 * Quanto falta para o próximo grau e em qual unidade (semanas ou treinos).
 * Retorna null quando não há próximo grau (precisa trocar de faixa).
 */
export const getDegreeRequirement = (
  belt: BeltColor,
  currentDegree: number,
  program?: string,
  birthDate?: string,
): { required: number; unit: ProgressUnit } | null => {
  const degree = Math.max(0, Math.floor(Number(currentDegree) || 0));

  if (isGbkProgram(program)) {
    if (degree >= getMaxDegreesForGBK(belt)) return null;
    return resolveGbkProgram(program, birthDate) === "GBKIDS"
      ? { required: GBK_KIDS_TRAININGS_PER_DEGREE, unit: "treinos" }
      : { required: GBK_JUVENIL_WEEKS_PER_DEGREE, unit: "semanas" };
  }

  const required = ADULT_WEEKS_REQUIRED[belt]?.[degree];
  return required ? { required, unit: "semanas" } : null;
};

/**
 * Retorna o requisito (semanas, ou treinos no GBK Kids) para o próximo grau.
 */
export const getWeeksRequiredForNextDegree = (
  belt: BeltColor,
  currentDegree: number,
  program?: string,
  birthDate?: string,
): number | null => {
  return (
    getDegreeRequirement(belt, currentDegree, program, birthDate)?.required ??
    null
  );
};

/**
 * Treinos válidos por dia (YYYY-MM-DD → 1 ou 2): só confirmados, só nos dias
 * de aula do programa, no máximo 2 por dia e, se houver data de corte,
 * só depois do dia da última graduação (o próprio dia não conta).
 */
const countTrainingsByDay = (
  attendanceRecords: Attendance[],
  program?: string,
  birthDate?: string,
  lastGraduationDate?: string,
): Map<string, number> => {
  const validDays = getValidTrainingDays(program, birthDate);
  const cutoffDateOnly = toDateOnlyString(lastGraduationDate);
  const byDay = new Map<string, number>();

  attendanceRecords.forEach((a) => {
    if (!a.confirmed) return;
    const date = parseISO(a.date);
    if (Number.isNaN(date.getTime())) return;
    if (!validDays.has(date.getDay())) return;

    const dayKey = getAttendanceDayKey(a.date);
    if (cutoffDateOnly && dayKey <= cutoffDateOnly) return;

    const current = byDay.get(dayKey) || 0;
    if (current < MAX_TRAININGS_PER_DAY) byDay.set(dayKey, current + 1);
  });

  return byDay;
};

const sumTrainings = (byDay: Map<string, number>): number => {
  let total = 0;
  byDay.forEach((count) => (total += count));
  return total;
};

/** 1 treino na semana = 0,5 | 2 ou mais = 1 (semana de domingo a sábado). */
const sumWeeks = (byDay: Map<string, number>): number => {
  const trainingsByWeek = new Map<string, number>();
  byDay.forEach((count, dayKey) => {
    const weekKey = format(
      startOfWeek(parseISO(dayKey), { weekStartsOn: 0 }),
      "yyyy-MM-dd",
    );
    trainingsByWeek.set(weekKey, (trainingsByWeek.get(weekKey) || 0) + count);
  });

  let totalWeeks = 0;
  trainingsByWeek.forEach((trainings) => {
    totalWeeks += trainings >= 2 ? 1 : trainings === 1 ? 0.5 : 0;
  });
  return totalWeeks;
};

/** Presenças dos últimos `weeksWindow` × 7 dias (até hoje), já filtradas. */
const getRecentTrainingsByDay = (
  attendanceRecords: Attendance[],
  program?: string,
  birthDate?: string,
  weeksWindow = 4,
): Map<string, number> => {
  const today = new Date();
  const todayKey = format(today, "yyyy-MM-dd");
  const windowStartKey = format(
    addDays(today, -(weeksWindow * 7) + 1),
    "yyyy-MM-dd",
  );

  const byDay = countTrainingsByDay(attendanceRecords, program, birthDate);
  const recent = new Map<string, number>();
  byDay.forEach((count, dayKey) => {
    if (dayKey >= windowStartKey && dayKey <= todayKey) recent.set(dayKey, count);
  });
  return recent;
};

const calculateRecentWeeklyAverageTrainings = (
  attendanceRecords: Attendance[],
  program?: string,
  birthDate?: string,
  weeksWindow = 4,
): number => {
  const recent = getRecentTrainingsByDay(
    attendanceRecords,
    program,
    birthDate,
    weeksWindow,
  );
  return sumTrainings(recent) / weeksWindow;
};

/** Média de semanas completadas por semana nas últimas `weeksWindow` semanas (0 a 1). */
const calculateRecentWeeklyAverageWeeks = (
  attendanceRecords: Attendance[],
  program?: string,
  birthDate?: string,
  weeksWindow = 4,
): number => {
  const recent = getRecentTrainingsByDay(
    attendanceRecords,
    program,
    birthDate,
    weeksWindow,
  );
  return Math.min(1, sumWeeks(recent) / weeksWindow);
};

/**
 * Conta quantas semanas de treino o aluno acumulou desde a última graduação.
 *
 * Regra:
 * - 1 treino na semana = 0.5 semana
 * - 2 treinos na semana = 1 semana (podem ser 2 aulas no mesmo dia)
 * - 3+ treinos na semana = 1 semana (não conta mais que isso)
 */
export const calculateCompletedWeeks = (
  attendanceRecords: Attendance[],
  lastGraduationDate: string,
  program?: string,
  birthDate?: string,
): number => {
  return sumWeeks(
    countTrainingsByDay(
      attendanceRecords,
      program,
      birthDate,
      lastGraduationDate,
    ),
  );
};

/** Total de treinos desde a última graduação (máximo 2 por dia). */
export const calculateCompletedTrainings = (
  attendanceRecords: Attendance[],
  lastGraduationDate: string,
  program?: string,
  birthDate?: string,
): number => {
  return sumTrainings(
    countTrainingsByDay(
      attendanceRecords,
      program,
      birthDate,
      lastGraduationDate,
    ),
  );
};

const calculateCompletedProgress = (
  unit: ProgressUnit,
  attendanceRecords: Attendance[],
  lastGraduationDate: string,
  program?: string,
  birthDate?: string,
): number => {
  return unit === "semanas"
    ? calculateCompletedWeeks(attendanceRecords, lastGraduationDate, program, birthDate)
    : calculateCompletedTrainings(attendanceRecords, lastGraduationDate, program, birthDate);
};

/**
 * Mínimo de treinos que ainda faltam. Em semanas, cada treino vale no máximo
 * meia semana, então faltar 1 semana = faltar pelo menos 2 treinos.
 */
const getTrainingsRemaining = (unit: ProgressUnit, remaining: number): number => {
  if (remaining <= 0) return 0;
  return unit === "semanas" ? Math.ceil(remaining * 2) : Math.ceil(remaining);
};

/** "3,5" | "4" — semanas podem ter meia semana. */
export const formatProgressValue = (value: number): string => {
  const rounded = Math.floor(value * 10) / 10;
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace(".", ",");
};

/** "1 semana" | "3,5 semanas" | "1 treino" | "8 treinos" */
export const formatProgressAmount = (
  value: number,
  unit: ProgressUnit,
): string => {
  const singular = value > 0 && value < 2;
  const label =
    unit === "semanas"
      ? singular ? "semana" : "semanas"
      : singular ? "treino" : "treinos";
  return `${formatProgressValue(value)} ${label}`;
};

/**
 * Calcula a data estimada do próximo grau baseado no histórico de frequência
 */
export const calculateNextDegreeDate = (
  attendanceRecords: Attendance[],
  lastGraduationDate: string,
  belt: BeltColor,
  currentDegree: number,
  program?: string,
  birthDate?: string
): string | null => {
  const requirement = getDegreeRequirement(
    belt,
    currentDegree,
    program,
    birthDate,
  );
  if (!requirement) return null;

  const validAttendances = attendanceRecords.filter((a) => a.confirmed);
  if (validAttendances.length === 0) return "Sem previsão (sem treinos)";

  const progressCompleted = calculateCompletedProgress(
    requirement.unit,
    attendanceRecords,
    lastGraduationDate,
    program,
    birthDate,
  );

  const progressRemaining = requirement.required - progressCompleted;

  if (progressRemaining <= 0) {
    return "Pronto para graduação!";
  }

  const validDays = getValidTrainingDays(program, birthDate);
  // Ritmo recente na mesma unidade do requisito (semanas/semana ou treinos/semana)
  const recentWeeklyRate =
    requirement.unit === "semanas"
      ? calculateRecentWeeklyAverageWeeks(attendanceRecords, program, birthDate, 4)
      : calculateRecentWeeklyAverageTrainings(attendanceRecords, program, birthDate, 4);

  if (recentWeeklyRate <= 0) {
    return "Sem previsão (frequência insuficiente)";
  }

  const progressPerValidDay = recentWeeklyRate / Math.max(1, validDays.size);

  let estimatedDate = new Date();
  let projectedProgress = 0;
  let guard = 0;
  while (projectedProgress < progressRemaining && guard < 3650) {
    guard += 1;
    estimatedDate = addDays(estimatedDate, 1);
    if (validDays.has(estimatedDate.getDay())) {
      projectedProgress += progressPerValidDay;
    }
  }

  return format(estimatedDate, "dd/MM/yyyy");
};

/**
 * Retorna informações completas sobre o progresso do aluno.
 * `weeksRequired`/`weeksCompleted` estão na unidade de `progressUnit`
 * (semanas para adultos e GBK Juvenil, treinos para GBK Kids).
 */
export const getDegreeProgress = (
  attendanceRecords: Attendance[],
  lastGraduationDate: string,
  belt: BeltColor,
  currentDegree: number,
  program?: string,
  birthDate?: string,
) => {
  const requirement = getDegreeRequirement(
    belt,
    currentDegree,
    program,
    birthDate,
  );
  const progressUnit: ProgressUnit = requirement?.unit ?? "semanas";
  const weeksRequired = requirement?.required ?? null;
  const weeksCompleted = calculateCompletedProgress(
    progressUnit,
    attendanceRecords,
    lastGraduationDate,
    program,
    birthDate,
  );
  const estimatedDate = calculateNextDegreeDate(
    attendanceRecords,
    lastGraduationDate,
    belt,
    currentDegree,
    program,
    birthDate,
  );
  const recentWeeklyAverage = calculateRecentWeeklyAverageTrainings(
    attendanceRecords,
    program,
    birthDate,
    4,
  );

  const progressPercentage = weeksRequired
    ? Math.min(100, Math.round((weeksCompleted / weeksRequired) * 100))
    : 0;

  const isReadyForGraduation = weeksRequired ? weeksCompleted >= weeksRequired : false;
  const weeksRemaining = weeksRequired
    ? Math.max(0, weeksRequired - weeksCompleted)
    : null;
  const trainingsRemaining =
    weeksRemaining === null ? null : getTrainingsRemaining(progressUnit, weeksRemaining);

  // Penúltimo: falta exatamente 1 treino (já está na fila do próximo grau)
  const isPenultimate =
    weeksRequired !== null &&
    !isReadyForGraduation &&
    weeksCompleted > 0 &&
    trainingsRemaining === 1;

  return {
    weeksRequired,
    weeksCompleted: Math.floor(weeksCompleted * 10) / 10, // Arredonda para 1 casa decimal
    weeksRemaining,
    trainingsRemaining,
    progressPercentage,
    estimatedDate,
    recentWeeklyAverage: Math.floor(recentWeeklyAverage * 10) / 10,
    isReadyForGraduation,
    isPenultimate,
    nextDegree: currentDegree + 1,
    progressUnit,
  };
};

/**
 * Retorna a data exata (YYYY-MM-DD) prevista para o próximo grau
 * Se o aluno já está pronto, retorna a data de hoje
 */
export const getNextDegreeDate = (
  attendanceRecords: Attendance[],
  lastGraduationDate: string,
  belt: BeltColor,
  currentDegree: number,
  program?: string,
  birthDate?: string,
): string | null => {
  const progress = getDegreeProgress(
    attendanceRecords,
    lastGraduationDate,
    belt,
    currentDegree,
    program,
    birthDate,
  );

  // Se já está pronto, retorna hoje
  if (progress.isReadyForGraduation) {
    return format(new Date(), "yyyy-MM-dd");
  }

  // Se não há previsão ou não tem requisito para o próximo grau
  if (!progress.weeksRequired || !progress.estimatedDate || typeof progress.estimatedDate !== 'string') {
    return null;
  }

  // Converte a data estimada DD/MM/YYYY para YYYY-MM-DD
  const parts = progress.estimatedDate.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  return null;
};
