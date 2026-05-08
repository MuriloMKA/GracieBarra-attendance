import { BeltColor, Attendance } from "../context/DataContext";
import { startOfWeek, endOfWeek, parseISO, differenceInWeeks, addWeeks, format } from "date-fns";

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

const countCompletedTrainings = (
  attendanceRecords: Attendance[],
  lastGraduationDate?: string,
): number => {
  if (!isValidIsoDate(lastGraduationDate)) {
    return 0;
  }

  const graduationDate = parseISO(lastGraduationDate);
  return attendanceRecords.filter(
    (a) => a.confirmed && parseISO(a.date) >= graduationDate,
  ).length;
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
  program?: string
): number | null => {
  // GBK (Crianças/Adolescentes) - TODOS os graus levam 1 mês (4 semanas)
  if (program === "GBK") {
    const maxDegrees = getMaxDegreesForGBK(belt);
    if (currentDegree >= maxDegrees) return null;
    return 4; // 1 mês = 4 semanas
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
  if (!isValidIsoDate(lastGraduationDate)) {
    return 0;
  }

  const graduationDate = parseISO(lastGraduationDate);
  const now = new Date();

  // Filtra apenas presenças confirmadas após a última graduação
  const validAttendances = attendanceRecords.filter(
    (a) => a.confirmed && parseISO(a.date) >= graduationDate
  );

  // Agrupa treinos por semana
  const weekMap = new Map<string, number>();

  validAttendances.forEach((attendance) => {
    const attendanceDate = parseISO(attendance.date);
    const weekStart = startOfWeek(attendanceDate, { weekStartsOn: 0 }); // Domingo = 0
    const weekKey = weekStart.toISOString();

    const currentCount = weekMap.get(weekKey) || 0;
    weekMap.set(weekKey, currentCount + 1);
  });

  // Calcula semanas completas
  let totalWeeks = 0;
  weekMap.forEach((daysInWeek) => {
    if (daysInWeek === 1) {
      totalWeeks += 0.5;
    } else if (daysInWeek >= 2) {
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
  program?: string
): string | null => {
  if (!isValidIsoDate(lastGraduationDate)) {
    return null;
  }

  const isGBK = program === "GBK";
  const progressRequired = getWeeksRequiredForNextDegree(belt, currentDegree, program);
  if (!progressRequired) return null;

  const progressCompleted = isGBK
    ? calculateCompletedWeeks(attendanceRecords, lastGraduationDate)
    : calculateCompletedTrainings(attendanceRecords, lastGraduationDate);

  const progressRemaining = progressRequired - progressCompleted;

  if (progressRemaining <= 0) {
    return "Pronto para graduação!";
  }

  const graduationDate = parseISO(lastGraduationDate);
  const now = new Date();
  const realWeeksPassed = differenceInWeeks(now, graduationDate);
  const progressRate = realWeeksPassed > 0 ? progressCompleted / realWeeksPassed : 0;

  if (progressRate <= 0) {
    return "Sem previsão (sem treinos recentes)";
  }

  const realWeeksNeeded = progressRemaining / progressRate;
  const estimatedDate = addWeeks(now, Math.ceil(realWeeksNeeded));

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
  program?: string
) => {
  const weeksRequired = getWeeksRequiredForNextDegree(belt, currentDegree, program);
  const isGBK = program === "GBK";
  const weeksCompleted = isGBK
    ? calculateCompletedWeeks(attendanceRecords, lastGraduationDate)
    : calculateCompletedTrainings(attendanceRecords, lastGraduationDate);
  const estimatedDate = calculateNextDegreeDate(
    attendanceRecords,
    lastGraduationDate,
    belt,
    currentDegree,
    program
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
    progressUnit: isGBK ? "semanas" : "treinos",
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
  program?: string
): string | null => {
  const progress = getDegreeProgress(
    attendanceRecords,
    lastGraduationDate,
    belt,
    currentDegree,
    program
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
