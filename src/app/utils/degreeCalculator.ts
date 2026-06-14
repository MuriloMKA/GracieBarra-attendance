import { BeltColor, Attendance } from "../context/DataContext";
import { startOfWeek, parseISO, addDays, format } from "date-fns";

const isValidIsoDate = (value?: string | null): value is string => {
  return typeof value === "string" && value.trim().length > 0;
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
  if (!isValidIsoDate(birthDate)) return null;

  const date = parseISO(birthDate);
  if (Number.isNaN(date.getTime())) return null;

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

const countCompletedTrainings = (
  attendanceRecords: Attendance[],
  lastGraduationDate?: string,
): number => {
  let records = attendanceRecords.filter((a) => a.confirmed);

  if (isValidIsoDate(lastGraduationDate)) {
    const graduationDate = parseISO(lastGraduationDate);
    const nextDayStart = addDays(graduationDate, 1);
    records = records.filter((a) => parseISO(a.date) >= nextDayStart);
  }

  const map = new Map<string, number>();
  records.forEach((a) => {
    const d = parseISO(a.date);
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // ignore weekends
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
  lastGraduationDate: string
): number => {
  let validAttendances = attendanceRecords.filter((a) => a.confirmed);

  if (isValidIsoDate(lastGraduationDate)) {
    const graduationDate = parseISO(lastGraduationDate);
    const nextDayStart = addDays(graduationDate, 1);
    validAttendances = validAttendances.filter(
      (a) => parseISO(a.date) >= nextDayStart
    );
  }

  // Agrupa treinos por semana
  const weekMap = new Map<string, Set<string>>();

  validAttendances.forEach((attendance) => {
    const attendanceDate = parseISO(attendance.date);
    const dayOfWeek = attendanceDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // ignore weekends
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
): number => {
  return countCompletedTrainings(attendanceRecords, lastGraduationDate);
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
  );

  const progressRemaining = progressRequired - progressCompleted;

  if (progressRemaining <= 0) {
    return "Pronto para graduação!";
  }

  const addBusinessDays = (date: Date, businessDays: number) => {
    let currentDate = new Date(date);
    let remainingDays = Math.max(0, businessDays);

    // Determine allowed class days based on resolved program
    const resolvedProg = program === "GBK" || program === "GBKIDS" || program === "GBKJUVENIL"
      ? resolveGbkProgram(program, birthDate)
      : program;
    const validDays: Set<number> =
      resolvedProg === "GBKIDS"
        ? new Set([1, 3])         // Mon, Wed only
        : resolvedProg === "GBKJUVENIL"
          ? new Set([1, 2, 3, 4]) // Mon–Thu only
          : new Set([1, 2, 3, 4, 5]); // Mon–Fri (adults)

    while (remainingDays > 0) {
      currentDate = addDays(currentDate, 1);
      if (validDays.has(currentDate.getDay())) {
        remainingDays -= 1;
      }
    }

    return currentDate;
  };

  const estimatedDate = addBusinessDays(new Date(), Math.ceil(progressRemaining));

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
  );
  const estimatedDate = calculateNextDegreeDate(
    attendanceRecords,
    lastGraduationDate,
    belt,
    currentDegree,
    program,
    birthDate,
  );

  const progressPercentage = weeksRequired
    ? Math.min(100, Math.round((weeksCompleted / weeksRequired) * 100))
    : 0;

  const isReadyForGraduation = weeksRequired ? weeksCompleted >= weeksRequired : false;

  return {
    weeksRequired,
    weeksCompleted: Math.floor(weeksCompleted * 10) / 10, // Arredonda para 1 casa decimal
    weeksRemaining: weeksRequired ? Math.max(0, weeksRequired - weeksCompleted) : null,
    progressPercentage,
    estimatedDate,
    isReadyForGraduation,
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
