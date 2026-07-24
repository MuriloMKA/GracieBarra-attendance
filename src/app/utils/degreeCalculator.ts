import { BeltColor, Attendance } from "../context/DataContext";
import { startOfWeek, parseISO, addDays, format, parse } from "date-fns";

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

const getAdultTrainingsRequiredForNextDegree = (
  belt: BeltColor,
  currentDegree: number,
): number | null => {
  if (belt === "White") {
    if (currentDegree >= 4) return null;
    return 30;
  }

  if (belt === "Blue") {
    if (currentDegree >= 4) return null;
    return 65;
  }

  if (belt === "Purple") {
    if (currentDegree >= 4) return null;
    return 75;
  }

  if (belt === "Brown") {
    if (currentDegree >= 4) return null;
    return 85;
  }

  if (belt === "Black") {
    if (currentDegree >= 6) return null;
    if (currentDegree < 3) return 156;
    return 260;
  }

  return null;
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

const getGBKTrainingsRequiredForNextDegree = (
  belt: BeltColor,
  currentDegree: number,
  birthDate?: string,
  program?: string,
): number | null => {
  const resolvedProgram = resolveGbkProgram(program, birthDate);
  const trainingsRequired = resolvedProgram === "GBKIDS" ? 8 : 12;

  const maxDegrees = getMaxDegreesForGBK(belt);
  if (currentDegree >= maxDegrees) return null;

  return trainingsRequired;
};

const getValidTrainingDays = (
  program?: string,
  birthDate?: string,
): Set<number> => {
  const resolvedProg =
    program === "GBK" || program === "GBKIDS" || program === "GBKJUVENIL"
      ? resolveGbkProgram(program, birthDate)
      : program;

  if (resolvedProg === "GBKIDS") return new Set([1, 3]); // Mon, Wed
  if (resolvedProg === "GBKJUVENIL") return new Set([1, 2, 3, 4]); // Mon-Thu
  return new Set([1, 2, 3, 4, 5]); // Mon-Fri (adults)
};

const calculateRecentWeeklyAverageTrainings = (
  attendanceRecords: Attendance[],
  program?: string,
  birthDate?: string,
  weeksWindow = 4,
): number => {
  const validDays = getValidTrainingDays(program, birthDate);
  const today = new Date();
  const windowStart = addDays(today, -(weeksWindow * 7) + 1);

  const map = new Map<string, number>();

  attendanceRecords.forEach((a) => {
    if (!a.confirmed) return;

    const date = parseISO(a.date);
    if (Number.isNaN(date.getTime())) return;
    if (date < windowStart || date > today) return;
    if (!validDays.has(date.getDay())) return;

    const dateStr = a.date.slice(0, 10);
    const current = map.get(dateStr) || 0;
    if (current < 2) {
      map.set(dateStr, current + 1);
    }
  });

  let totalTrainings = 0;
  map.forEach((count) => (totalTrainings += count));

  return totalTrainings / weeksWindow;
};

const countCompletedTrainings = (
  attendanceRecords: Attendance[],
  lastGraduationDate?: string,
  program?: string,
  birthDate?: string,
): number => {
  const validDays = getValidTrainingDays(program, birthDate);
  const cutoffDateOnly = toDateOnlyString(lastGraduationDate);

  let records = attendanceRecords.filter((a) => a.confirmed);

  // Do not count the same day of the graduation/degree confirmation.
  if (cutoffDateOnly) {
    records = records.filter((a) => a.date.slice(0, 10) > cutoffDateOnly);
  }

  const map = new Map<string, number>();
  records.forEach((a) => {
    const d = parseISO(a.date);
    if (Number.isNaN(d.getTime())) return;
    const dayOfWeek = d.getDay();
    if (validDays.has(dayOfWeek)) {
      const dateStr = a.date.slice(0, 10);
      const current = map.get(dateStr) || 0;
      if (current < 2) {
        map.set(dateStr, current + 1);
      }
    }
  });

  let total = 0;
  map.forEach((count) => total += count);
  return total;
};

/**
 * Retorna o número máximo de graus para cada faixa GBK
 */
const getMaxDegreesForGBK = (belt: BeltColor): number => {
  switch (belt) {
    case "White": // 4 brancos + 1 vermelho
    case "GreyWhite": // 4 brancos + 1 vermelho
      return 5;
    
    case "Grey": // 4 brancos + 4 vermelhos + 3 pretos
    case "GreyBlack":
    case "YellowWhite": // 4 brancos + 4 vermelhos + 3 pretos
    case "Yellow":
    case "YellowBlack":
    case "OrangeWhite": // 4 brancos + 4 vermelhos + 3 pretos
    case "Orange":
    case "OrangeBlack":
    case "GreenWhite": // 4 brancos + 4 vermelhos + 3 pretos
    case "Green":
    case "GreenBlack":
      return 11;
    
    default:
      return 4;
  }
};

/**
 * Retorna quantas semanas são necessárias para o próximo grau
 * baseado na faixa atual e grau atual do aluno
 */
export const getWeeksRequiredForNextDegree = (
  belt: BeltColor,
  currentDegree: number,
  program?: string,
  birthDate?: string,
): number | null => {
  if (program === "GBK" || program === "GBKIDS" || program === "GBKJUVENIL") {
    return getGBKTrainingsRequiredForNextDegree(
      belt,
      currentDegree,
      birthDate,
      program,
    );
  }

  // ADULTOS
  // Se já tem 4 graus, precisa mudar de faixa (não há 5º grau, exceto na preta)
  if (belt !== "Black" && currentDegree >= 4) return null;
  return getAdultTrainingsRequiredForNextDegree(belt, currentDegree);
};

/**
 * Conta quantas semanas completas de treino o aluno acumulou
 * desde a última graduação.
 * 
 * Regra: 
 * - 1 dia na semana = 0.5 semana
 * - 2 dias na semana = 1 semana
 * - 3+ dias na semana = 1 semana (não conta mais que isso)
 */
export const calculateCompletedWeeks = (
  attendanceRecords: Attendance[],
  lastGraduationDate: string,
  program?: string,
  birthDate?: string,
): number => {
  const validDays = getValidTrainingDays(program, birthDate);
  const cutoffDateOnly = toDateOnlyString(lastGraduationDate);

  let validAttendances = attendanceRecords.filter((a) => a.confirmed);

  // Do not count the same day of the graduation/degree confirmation.
  if (cutoffDateOnly) {
    validAttendances = validAttendances.filter(
      (a) => a.date.slice(0, 10) > cutoffDateOnly,
    );
  }

  // Agrupa treinos por semana
  const weekMap = new Map<string, Set<string>>();

  validAttendances.forEach((attendance) => {
    const attendanceDate = parseISO(attendance.date);
    if (Number.isNaN(attendanceDate.getTime())) return;
    const dayOfWeek = attendanceDate.getDay();
    if (validDays.has(dayOfWeek)) {
      const weekStart = startOfWeek(attendanceDate, { weekStartsOn: 0 }); // Domingo = 0
      const weekKey = weekStart.toISOString();
      const dateStr = attendance.date.slice(0, 10);

      const daysSet = weekMap.get(weekKey) || new Set<string>();
      daysSet.add(dateStr); // Conta apenas dias únicos
      weekMap.set(weekKey, daysSet);
    }
  });

  // Calcula semanas completas
  let totalWeeks = 0;
  weekMap.forEach((daysInWeek) => {
    const daysCount = daysInWeek.size;
    if (daysCount === 1) {
      totalWeeks += 0.5;
    } else if (daysCount >= 2) {
      totalWeeks += 1;
    }
  });

  return totalWeeks;
};

export const calculateCompletedTrainings = (
  attendanceRecords: Attendance[],
  lastGraduationDate: string,
  program?: string,
  birthDate?: string,
): number => {
  return countCompletedTrainings(
    attendanceRecords,
    lastGraduationDate,
    program,
    birthDate,
  );
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
  const progressRequired = getWeeksRequiredForNextDegree(
    belt,
    currentDegree,
    program,
    birthDate,
  );
  if (!progressRequired) return null;

  const validAttendances = attendanceRecords.filter((a) => a.confirmed);
  if (validAttendances.length === 0) return "Sem previsão (sem treinos)";

  const progressCompleted = calculateCompletedTrainings(
    attendanceRecords,
    lastGraduationDate,
    program,
    birthDate,
  );

  const progressRemaining = progressRequired - progressCompleted;

  if (progressRemaining <= 0) {
    return "Pronto para graduação!";
  }

  const validDays = getValidTrainingDays(program, birthDate);
  const recentWeeklyAverage = calculateRecentWeeklyAverageTrainings(
    attendanceRecords,
    program,
    birthDate,
    4,
  );

  if (recentWeeklyAverage <= 0) {
    return "Sem previsão (frequência insuficiente)";
  }

  const progressPerValidDay = recentWeeklyAverage / Math.max(1, validDays.size);
  if (progressPerValidDay <= 0) {
    return "Sem previsão (frequência insuficiente)";
  }

  const addProjectedDays = (date: Date, remainingTrainings: number) => {
    let currentDate = new Date(date);
    let projectedProgress = 0;
    const targetProgress = Math.max(0, remainingTrainings);
    let guard = 0;

    while (projectedProgress < targetProgress && guard < 3650) {
      guard += 1;
      currentDate = addDays(currentDate, 1);
      if (validDays.has(currentDate.getDay())) {
        projectedProgress += progressPerValidDay;
      }
    }

    return currentDate;
  };

  const estimatedDate = addProjectedDays(new Date(), progressRemaining);

  return format(estimatedDate, "dd/MM/yyyy");
};

/**
 * Retorna informações completas sobre o progresso do aluno
 */
export const getDegreeProgress = (
  attendanceRecords: Attendance[],
  lastGraduationDate: string,
  belt: BeltColor,
  currentDegree: number,
  program?: string,
  birthDate?: string,
) => {
  const weeksRequired = getWeeksRequiredForNextDegree(
    belt,
    currentDegree,
    program,
    birthDate,
  );
  const weeksCompleted = calculateCompletedTrainings(
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

  // Penúltimo: concluiu exatamente 1 treino a menos do necessário (já está na fila do próximo grau)
  const isPenultimate =
    weeksRequired !== null &&
    !isReadyForGraduation &&
    weeksCompleted > 0 &&
    weeksRequired - weeksCompleted <= 1;

  return {
    weeksRequired,
    weeksCompleted: Math.floor(weeksCompleted * 10) / 10, // Arredonda para 1 casa decimal
    weeksRemaining: weeksRequired ? Math.max(0, weeksRequired - weeksCompleted) : null,
    progressPercentage,
    estimatedDate,
    recentWeeklyAverage: Math.floor(recentWeeklyAverage * 10) / 10,
    isReadyForGraduation,
    isPenultimate,
    nextDegree: currentDegree + 1,
    progressUnit: "treinos",
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

  // Se não há previsão ou não tem semanas necessárias
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
