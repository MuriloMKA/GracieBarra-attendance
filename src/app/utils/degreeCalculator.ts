import { BeltColor, Attendance } from "../context/DataContext";
import { startOfWeek, endOfWeek, parseISO, differenceInWeeks, addWeeks, format } from "date-fns";

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
    case "YellowWhite": // 4 brancos + 4 vermelhos + 3 laranja
    case "Yellow":
    case "YellowBlack":
    case "OrangeWhite": // 4 brancos + 4 vermelhos + 3 verde
    case "Orange":
    case "OrangeBlack":
    case "GreenWhite": // 4 brancos + 4 vermelhos + 3 azul
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
  if (belt === "Black" && currentDegree >= 6) return null;

  const nextDegree = currentDegree + 1;

  // Faixa Branca
  if (belt === "White") {
    if (nextDegree === 1) return 4; // 1 mês
    if (nextDegree === 2) return 4; // 1 mês
    if (nextDegree === 3) return 8; // 2 meses
    if (nextDegree === 4) return 16; // 4 meses
  }

  // Faixa Azul
  if (belt === "Blue") {
    if (nextDegree === 1) return 16; // 4 meses
    if (nextDegree === 2) return 20; // 5 meses
    if (nextDegree === 3) return 20; // 5 meses
    if (nextDegree === 4) return 20; // 5 meses
  }

  // Faixa Roxa
  if (belt === "Purple") {
    if (nextDegree === 1) return 12; // 3 meses
    if (nextDegree === 2) return 12; // 3 meses
    if (nextDegree === 3) return 16; // 4 meses
    if (nextDegree === 4) return 16; // 4 meses
  }

  // Faixa Marrom
  if (belt === "Brown") {
    if (nextDegree === 1) return 12; // 3 meses
    if (nextDegree === 2) return 12; // 3 meses
    if (nextDegree === 3) return 16; // 4 meses
    if (nextDegree === 4) return 16; // 4 meses
  }

  // Faixa Preta
  if (belt === "Black") {
    if (nextDegree === 1) return 156; // 3 anos
    if (nextDegree === 2) return 156; // 3 anos
    if (nextDegree === 3) return 156; // 3 anos
    if (nextDegree === 4) return 260; // 5 anos
    if (nextDegree === 5) return 260; // 5 anos
    if (nextDegree === 6) return 260; // 5 anos
  }

  return null;
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
  const weeksRequired = getWeeksRequiredForNextDegree(belt, currentDegree, program);
  if (!weeksRequired) return null;

  const weeksCompleted = calculateCompletedWeeks(
    attendanceRecords,
    lastGraduationDate
  );

  const weeksRemaining = weeksRequired - weeksCompleted;

  // Se já completou as semanas necessárias
  if (weeksRemaining <= 0) {
    return "Pronto para graduação!";
  }

  // Calcula quantas semanas reais passaram desde a última graduação
  const graduationDate = parseISO(lastGraduationDate);
  const now = new Date();
  const realWeeksPassed = differenceInWeeks(now, graduationDate);

  // Calcula a taxa de progresso (semanas completas / semanas reais)
  const progressRate = realWeeksPassed > 0 ? weeksCompleted / realWeeksPassed : 0;

  // Se não há progresso (sem treinos), não pode estimar
  if (progressRate <= 0) {
    return "Sem previsão (sem treinos recentes)";
  }

  // Estima quantas semanas reais serão necessárias para completar as semanas restantes
  const realWeeksNeeded = weeksRemaining / progressRate;

  // Adiciona as semanas estimadas à data atual
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
  const weeksCompleted = calculateCompletedWeeks(
    attendanceRecords,
    lastGraduationDate
  );
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
