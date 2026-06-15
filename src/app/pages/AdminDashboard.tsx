import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { useData, JJClass, Student, BeltColor } from "../context/DataContext";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Users,
  CheckSquare,
  Award,
  ArrowRight,
  Shield,
  QrCode,
  Check,
  TrendingUp,
  AlertCircle,
  Bell,
  X,
  Eye,
  EyeOff,
  ScanLine,
} from "lucide-react";
import { toast } from "sonner";
import {
  BELT_NAMES_PT,
  calculateProgram,
  getDegreeDisplayLabel,
  getNextDegreeDisplayLabel,
} from "../components/BeltDisplay";
import { getDegreeProgress } from "../utils/degreeCalculator";
import { QRScanner } from "../components/QRScanner";

interface StudentReadyForDegree extends Student {
  weeksCompleted: number;
  weeksRequired: number;
  nextDegree: number;
  confirmedAttendances: number;
  progressUnit?: "treinos";
}

interface AbsentStudent extends Student {
  lastAttendanceDate: string | null;
  daysAbsent: number;
}

export const AdminDashboard: React.FC = () => {
  const { currentUser, students, attendance, classes, checkIn, refreshData } = useData();

  const [showScanner, setShowScanner] = useState(false);
  const [showConfirmedModal, setShowConfirmedModal] = useState(false);
  const [showGraduationsModal, setShowGraduationsModal] = useState(false);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [pendingDegreeStudent, setPendingDegreeStudent] = useState<StudentReadyForDegree | null>(null);
  const [confirmingDegree, setConfirmingDegree] = useState(false);
  const [showTotalCount, setShowTotalCount] = useState(() => {
    if (typeof window === "undefined") return true;

    const storedValue = window.localStorage.getItem(
      "gb_admin_dashboard_show_total_count",
    );

    return storedValue === null ? true : storedValue === "true";
  });
  const scannerCooldowns = useRef<Map<string, number>>(new Map());
  const barcodeBufferRef = useRef<string>("");
  const barcodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleScanSuccessRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      "gb_admin_dashboard_show_total_count",
      String(showTotalCount),
    );
  }, [showTotalCount]);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator === "undefined" || !("vibrate" in navigator)) {
      return false;
    }

    return navigator.vibrate(pattern);
  }, []);

  const activeStudents = useMemo(
    () => students.filter((student) => student.active !== false),
    [students],
  );

  const studentsReadyForDegree = useMemo<StudentReadyForDegree[]>(() => {
    const readyStudents: StudentReadyForDegree[] = [];

    activeStudents.forEach((student) => {
      const studentAttendance = attendance.filter(
        (entry) =>
          entry.confirmed &&
          (entry.studentId === student.id ||
            (entry.studentId as any)?._id === student.id ||
            (entry.studentId as any)?.id === student.id),
      );

      const degreeProgress = getDegreeProgress(
        studentAttendance,
        student.lastGraduationDate,
        student.belt,
        student.degrees,
        student.program,
        student.birthDate,
      );

      const required = degreeProgress.weeksRequired;

      if (!required) return;

      const weeksCompleted = degreeProgress.weeksCompleted;

      if (weeksCompleted >= required) {
        readyStudents.push({
          ...student,
          weeksCompleted: Math.floor(weeksCompleted * 10) / 10,
          weeksRequired: required,
          nextDegree: student.degrees + 1,
          confirmedAttendances: studentAttendance.length,
          progressUnit: "treinos",
        });
      }
    });

    return readyStudents;
  }, [attendance, activeStudents]);

  const absentStudents = useMemo<AbsentStudent[]>(() => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    return activeStudents
      .map((student) => {
        const studentId = student.id || student._id;
        const confirmedAttendances = attendance
          .filter((entry) => {
            if (!entry.confirmed) return false;
            const entryStudentId =
              (entry.studentId as any)?._id || entry.studentId;
            return entryStudentId === studentId;
          })
          .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

        const lastAttendanceDate = confirmedAttendances[0]?.date || null;
        const lastAttendanceStart = lastAttendanceDate
          ? new Date(
              parseISO(lastAttendanceDate).getFullYear(),
              parseISO(lastAttendanceDate).getMonth(),
              parseISO(lastAttendanceDate).getDate(),
            )
          : null;
        const daysAbsent = lastAttendanceStart
          ? Math.floor(
              (todayStart.getTime() - lastAttendanceStart.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : Number.POSITIVE_INFINITY;

        return {
          ...student,
          lastAttendanceDate,
          daysAbsent,
        };
      })
      .filter((student) => student.daysAbsent > 15)
      .sort((a, b) => b.daysAbsent - a.daysAbsent);
  }, [attendance, activeStudents]);

  const activeStudentIds = new Set(
    activeStudents.map((student) => student.id || student._id),
  );

  const confirmedToday = attendance.filter((a) => {
    if (!a.confirmed) return false;
    const attendanceStudentId = (a.studentId as any)?._id || a.studentId;
    if (!activeStudentIds.has(attendanceStudentId)) return false;
    const d = parseISO(a.date);
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }).length;

  const confirmedTodayList = useMemo(() => {
    const today = new Date();
    return attendance
      .filter((a) => {
        if (!a.confirmed) return false;
        const attendanceStudentId = (a.studentId as any)?._id || a.studentId;
        if (!activeStudentIds.has(attendanceStudentId)) return false;
        const d = parseISO(a.date);
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      })
      .map((a) => {
        const student = activeStudents.find(
          (s) =>
            (s.id || s._id) === a.studentId ||
            (a.studentId as any)?._id === (s.id || s._id),
        );
        return {
          id: a._id || a.id,
          name: student
            ? student.name
            : (a as any).name || "Aluno desconhecido",
          className: (a as any).className || (a as any).classId || "-",
          time: (a as any).classTime || a.date?.slice(11, 16) || "-",
        };
      });
  }, [attendance, activeStudents, activeStudentIds]);

  const graduationEvents = useMemo(() => {
    const events: Array<{ name: string; date: string; notes?: string }> = [];
    activeStudents.forEach((s) => {
      (s.specialDates || [])
        .filter((sd) => sd.type === "graduation")
        .forEach((sd) =>
          events.push({ name: s.name, date: sd.date, notes: sd.notes }),
        );
    });
    // sort desc
    events.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    return events;
  }, [activeStudents]);

  const formatGraduationNote = (notes?: string) => {
    if (!notes) return null;

    const parts = notes
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean);

    const beltToken = parts.find((part) => part.startsWith("BELT:"));
    const beltValue = beltToken?.split(":")[1] as BeltColor | undefined;
    const beltLabel = beltValue ? BELT_NAMES_PT[beltValue] : null;

    const extraNotes = parts.filter(
      (part) => !part.startsWith("BELT:") && !part.startsWith("TRACK:"),
    );

    return {
      beltLabel,
      extraText: extraNotes.length > 0 ? extraNotes.join(" • ") : null,
    };
  };

  const absentStudentsCount = absentStudents.length;

  // Aulas disponíveis hoje
  const today = new Date();
  const todayClasses = classes.filter((c) =>
    c.daysOfWeek.includes(today.getDay()),
  );

  const handleScanSuccess = useCallback((decodedText: string) => {
    try {
      const studentData = JSON.parse(decodedText);
      const studentId = studentData.studentId;

      if (!studentId) {
        toast.error(`Leitura inválida: sem studentId. Conteúdo: ${decodedText.slice(0, 60)}`);
        return;
      }

      const now = Date.now();
      const lastScan = scannerCooldowns.current.get(studentId) || 0;
      if (now - lastScan < 5000) {
        // Ignora leituras repetidas do mesmo aluno por 5 segundos
        return;
      }

      const student = students.find((s) => (s.id || s._id) === studentId);

      if (!student) {
        toast.error("Aluno não encontrado!");
        return;
      }

      vibrate([80, 40, 120]);

      scannerCooldowns.current.set(studentId, now);

      const todayStr = today.toISOString().split("T")[0];
      const alreadyConfirmed = attendance.some(
        (a) =>
          a.studentId === studentId &&
          a.classId === "manual-scan" &&
          a.confirmed &&
          a.date.startsWith(todayStr),
      );

      if (alreadyConfirmed) {
        toast.info(`Presença já confirmada para ${student.name} hoje!`);
        // Even if already confirmed, check if ready for degree
        const readyEntry = studentsReadyForDegree.find(
          (s) => (s.id || s._id) === studentId,
        );
        if (readyEntry) {
          setPendingDegreeStudent(readyEntry);
        }
        return;
      }

      const currentTime = format(now, "HH:mm");

      // Check degree readiness inline using current attendance + this new training
      const studentCurrentAttendance = attendance.filter((a) => {
        const sid = (a.studentId as any)?._id || (a.studentId as any)?.id || a.studentId;
        return sid === studentId && a.confirmed;
      });
      const simulatedAttendance = [
        ...studentCurrentAttendance,
        {
          studentId,
          confirmed: true,
          date: new Date().toISOString(),
          classId: "manual-scan",
          className: "Presença via QR Code",
          classTime: currentTime,
        } as any,
      ];
      const degreeProgressAfter = getDegreeProgress(
        simulatedAttendance,
        student.lastGraduationDate,
        student.belt,
        student.degrees,
        student.program,
        student.birthDate,
      );
      const isReadyAfterThisScan =
        degreeProgressAfter.weeksRequired !== null &&
        degreeProgressAfter.weeksCompleted >= (degreeProgressAfter.weeksRequired || Infinity);

      const wasAlreadyReady = studentsReadyForDegree.some(
        (s) => (s.id || s._id) === studentId,
      );

      // Adiciona presença confirmada diretamente
      checkIn(
        studentId,
        "manual-scan",
        "Presença via QR Code",
        currentTime,
        true, // Já confirmado
      ).then(async () => {
        toast.success(
          `Check-in de ${student.name} concluído às ${currentTime}!`,
        );

        // Show degree confirmation modal if student is (or just became) ready
        if (isReadyAfterThisScan || wasAlreadyReady) {
          const readyEntry = studentsReadyForDegree.find(
            (s) => (s.id || s._id) === studentId,
          );
          setPendingDegreeStudent(
            readyEntry || {
              ...student,
              weeksCompleted: degreeProgressAfter.weeksCompleted,
              weeksRequired: degreeProgressAfter.weeksRequired || 0,
              nextDegree: student.degrees + 1,
              confirmedAttendances: simulatedAttendance.length,
              progressUnit: "treinos",
            } as StudentReadyForDegree,
          );
        }
      });
    } catch (error) {
      toast.error("QR Code inválido!");
    }
  }, [students, attendance, studentsReadyForDegree, checkIn, today, vibrate]);

  // Keep ref in sync so the keyboard listener always calls the latest version
  useEffect(() => {
    handleScanSuccessRef.current = handleScanSuccess;
  }, [handleScanSuccess]);

  // Physical barcode/QR scanner keyboard listener
  // USB barcode scanners act as keyboards: they type the content very fast, then press Enter/CR
  useEffect(() => {
    const SCANNER_TIMEOUT_MS = 200; // increased to 200ms to handle slower scanners

    const flushBuffer = () => {
      const buffer = barcodeBufferRef.current;
      barcodeBufferRef.current = "";
      if (barcodeTimerRef.current) {
        clearTimeout(barcodeTimerRef.current);
        barcodeTimerRef.current = null;
      }
      if (buffer.length < 5) return;

      // Try to parse as JSON first (our QR format: {"studentId":"xxx"})
      // Fallback: treat raw string as studentId directly
      let payload: string;
      try {
        JSON.parse(buffer);
        payload = buffer;
      } catch {
        // Scanner may have stripped { or " — try wrapping as studentId
        payload = JSON.stringify({ studentId: buffer.trim() });
      }

      handleScanSuccessRef.current(payload);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Enter OR CR (\r) fires end-of-scan
      if (e.key === "Enter" || e.key === "\r") {
        flushBuffer();
      } else if (e.key.length === 1) {
        barcodeBufferRef.current += e.key;
        if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
        // Auto-flush after timeout in case scanner doesn't send Enter
        barcodeTimerRef.current = setTimeout(flushBuffer, SCANNER_TIMEOUT_MS);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
    };
  }, []);

  const handleConfirmDegree = async (student: StudentReadyForDegree) => {
    try {
      setConfirmingDegree(true);
      const token = localStorage.getItem("gb_auth_token");
      const studentId = student._id || student.id;
      const res = await fetch(`/api/students/${studentId}/confirm-degree`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ notes: "Confirmado pelo professor via leitura QR" }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(`Grau de ${student.name} confirmado!`);
      setPendingDegreeStudent(null);
      await refreshData();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao confirmar grau");
    } finally {
      setConfirmingDegree(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center overflow-hidden border-2 border-gray-200">
            <img
              src="/images/logo.png"
              alt="Gracie Barra Logo"
              className="w-full h-full object-cover scale-110"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Shield size={24} className="text-[#D10A11]" />
              Painel do Professor
            </h1>
            <p className="text-gray-500 mt-1">
              Bem-vindo, {currentUser?.name} —{" "}
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmados Hoje Modal */}
      {showConfirmedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-xl p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Confirmados Hoje</h3>
              <button
                onClick={() => setShowConfirmedModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X />
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {confirmedTodayList.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Nenhuma presença confirmada hoje.
                </div>
              ) : (
                confirmedTodayList.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.className}</div>
                    </div>
                    <div className="text-sm text-gray-600">{c.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Graduações Modal */}
      {showGraduationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Graduações</h3>
              <button
                onClick={() => setShowGraduationsModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X />
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {graduationEvents.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Nenhuma graduação registrada.
                </div>
              ) : (
                graduationEvents.map((g, idx) => (
                  <div
                    key={`${g.name}-${idx}`}
                    className="flex items-center justify-between gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 truncate">
                        {g.name}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {formatGraduationNote(g.notes)?.beltLabel && (
                          <span className="inline-flex items-center rounded-full bg-[#003087]/10 px-2.5 py-1 text-[11px] font-bold text-[#003087]">
                            {formatGraduationNote(g.notes)?.beltLabel}
                          </span>
                        )}
                        {formatGraduationNote(g.notes)?.extraText && (
                          <span className="text-xs text-gray-500">
                            {formatGraduationNote(g.notes)?.extraText}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600 whitespace-nowrap">
                      {g.date
                        ? format(parseISO(g.date), "dd/MM/yyyy")
                        : "Sem data"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ausentes Há Mais de 15 Dias Modal */}
      {showAbsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Ausentes Há Mais de 15 Dias</h3>
              <button
                onClick={() => setShowAbsentModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X />
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {absentStudents.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Nenhum aluno com mais de 15 dias sem vir.
                </div>
              ) : (
                absentStudents.map((student) => (
                  <div
                    key={student._id || student.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium truncate">{student.name}</div>
                      <div className="text-xs text-gray-500">
                        Última presença:{" "}
                        {student.lastAttendanceDate
                          ? format(
                              parseISO(student.lastAttendanceDate),
                              "dd/MM/yyyy",
                            )
                          : "Sem registros"}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {Number.isFinite(student.daysAbsent)
                        ? `${student.daysAbsent} dias`
                        : "Sem registros"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Users size={20} className="text-[#003087]" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Alunos
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-3xl font-black text-gray-900">
              {showTotalCount ? activeStudents.length : "•••"}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTotalCount((value) => !value);
              }}
              className="text-gray-500 hover:text-gray-900 transition-colors"
              aria-label={
                showTotalCount ? "Ocultar quantidade" : "Mostrar quantidade"
              }
              title={
                showTotalCount ? "Ocultar quantidade" : "Mostrar quantidade"
              }
            >
              {showTotalCount ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">
            Alunos ativos
          </div>
        </div>
        <div
          onClick={() => setShowConfirmedModal(true)}
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-2">
            <CheckSquare size={20} className="text-green-600" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Confirmados Hoje
            </span>
          </div>
          <div className="text-3xl font-black text-green-600">
            {confirmedToday}
          </div>
        </div>
        <div
          onClick={() => setShowGraduationsModal(true)}
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-2">
            <Award size={20} className="text-[#D10A11]" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Graduações
            </span>
          </div>
          <div className="text-3xl font-black text-[#D10A11]">
            {students.reduce(
              (acc, s) =>
                acc +
                s.specialDates.filter((sd) => sd.type === "graduation").length,
              0,
            )}
          </div>
        </div>
        <div
          onClick={() => setShowAbsentModal(true)}
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle size={20} className="text-amber-600" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Ausentes +15 Dias
            </span>
          </div>
          <div className="text-3xl font-black text-amber-600">
            {absentStudentsCount}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/admin/students"
          className="bg-[#003087] hover:bg-blue-900 text-white rounded-xl p-5 flex items-center justify-between group transition-all shadow-lg"
        >
          <div>
            <div className="font-black text-lg">Gerenciar Alunos</div>
            <div className="text-blue-200 text-sm mt-1">
              Ver lista, editar faixa, grau e informações
            </div>
          </div>
          <ArrowRight
            size={24}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>

        <Link
          to="/admin/classes"
          className="bg-[#D10A11] hover:bg-red-700 text-white rounded-xl p-5 flex items-center justify-between group transition-all shadow-lg"
        >
          <div>
            <div className="font-black text-lg">Gerenciar Aulas</div>
            <div className="text-red-200 text-sm mt-1">
              Configurar horários e dias das aulas
            </div>
          </div>
          <ArrowRight
            size={24}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>

        <Link
          to="/admin/notifications"
          className="bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl p-5 flex items-center justify-between group transition-all shadow-lg"
        >
          <div>
            <div className="font-black text-lg flex items-center gap-2">
              <Bell size={18} />
              Notificacoes
            </div>
            <div className="text-amber-100 text-sm mt-1">
              Enviar push para todos os usuarios
            </div>
          </div>
          <ArrowRight
            size={24}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {/* Alunos Prontos para Receber Grau */}
      {studentsReadyForDegree.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-amber-500 rounded-full">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-lg flex items-center gap-2">
                <AlertCircle size={20} className="text-amber-600" />
                Alunos Prontos para Receber Grau
              </h2>
              <p className="text-amber-700 text-sm">
                {studentsReadyForDegree.length}{" "}
                {studentsReadyForDegree.length === 1
                  ? "aluno completou"
                  : "alunos completaram"}{" "}
                os requisitos para o próximo grau
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {studentsReadyForDegree.map((student) => (
              <div
                key={student._id}
                className="bg-white rounded-lg border border-amber-200 p-4 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-[#003087] text-white flex items-center justify-center font-black shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 truncate">
                        {student.name}
                      </div>
                      {(() => {
                        const progressUnit = student.progressUnit || "treinos";
                        const completed = Math.round(
                          student.weeksCompleted,
                        ).toString();
                        const required = String(
                          Math.round(student.weeksRequired),
                        );

                        return (
                          <div className="text-xs text-gray-600">
                            {BELT_NAMES_PT[student.belt]}{" "}
                            {getDegreeDisplayLabel(
                              student.program,
                              student.belt,
                              student.degrees,
                            )}{" "}
                            →{" "}
                            {getNextDegreeDisplayLabel(
                              student.program,
                              student.belt,
                              student.degrees,
                            )}
                            <div className="text-xs text-amber-600 font-medium mt-1">
                              {completed} de {required} {progressUnit}{" "}
                              completados
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      Pronto!
                    </div>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        try {
                          const token = localStorage.getItem("gb_auth_token");
                          const res = await fetch(
                            `/api/students/${student._id}/confirm-degree`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: token ? `Bearer ${token}` : "",
                              },
                              body: JSON.stringify({
                                notes: "Confirmado pelo professor via painel",
                              }),
                            },
                          );
                          if (!res.ok) throw new Error(await res.text());
                          toast.success("Grau confirmado com sucesso");
                          await refreshData();
                        } catch (err) {
                          console.error(err);
                          toast.error("Erro ao confirmar grau");
                        }
                      }}
                      className="px-3 py-1 rounded-md bg-[#D10A11] text-white text-xs font-bold hover:opacity-90"
                      title="Confirmar Grau"
                    >
                      Confirmar Grau
                    </button>
                    <ArrowRight
                      size={16}
                      className="text-gray-400 group-hover:text-[#D10A11] group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-amber-100 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>💡 Dica:</strong> A presença já confirmada não confirma o
              grau automaticamente. Use o botão de confirmação de grau para
              registrar o grau quando desejar.
            </p>
          </div>
        </div>
      )}

      {/* Confirmar Presença via QR Code */}
      <div>
        <h2 className="font-black text-gray-900 text-lg mb-4 flex items-center gap-2">
          <QrCode size={20} className="text-[#D10A11]" />
          Leitor de QR Code
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Camera scanner */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-center max-w-sm mx-auto">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#D10A11]/10 rounded-full mb-3">
                  <QrCode size={28} className="text-[#D10A11]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Câmera (Celular)</h3>
                <p className="text-gray-500 text-sm">
                  Aponte a câmera para os QR Codes dos alunos.
                </p>
              </div>
              <button
                onClick={() => setShowScanner(true)}
                className="w-full py-3 bg-[#D10A11] hover:bg-red-700 text-white rounded-xl font-black shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <QrCode size={18} />
                Iniciar Câmera
              </button>
            </div>
          </div>

          {/* Physical scanner (USB/Bluetooth HID) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-center max-w-sm mx-auto">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-3">
                  <ScanLine size={28} className="text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Leitor Físico (USB/BT)</h3>
                <p className="text-gray-500 text-sm">
                  Conecte seu leitor de código de barras ou QR Code. Ele funciona automaticamente — basta apontar para o código do aluno.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Ativo e aguardando leitura
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Degree Confirmation Modal - shown when scanning a student ready for degree */}
      {pendingDegreeStudent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Award size={24} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-black text-lg">Grau Disponível!</div>
                  <div className="text-amber-100 text-sm">
                    {pendingDegreeStudent.name}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-gray-700 text-sm mb-1">
                Este aluno completou os requisitos para receber o{" "}
                <strong>
                  {getNextDegreeDisplayLabel(
                    pendingDegreeStudent.program,
                    pendingDegreeStudent.belt,
                    pendingDegreeStudent.degrees,
                  )}
                </strong>{" "}
                ({BELT_NAMES_PT[pendingDegreeStudent.belt]}).
              </p>
              <p className="text-gray-500 text-xs mb-5">
                {Math.round(pendingDegreeStudent.weeksCompleted)} de{" "}
                {Math.round(pendingDegreeStudent.weeksRequired)} treinos completados.
                Deseja confirmar o grau agora?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPendingDegreeStudent(null)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-colors"
                >
                  Agora não
                </button>
                <button
                  onClick={() => handleConfirmDegree(pendingDegreeStudent)}
                  disabled={confirmingDegree}
                  className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-sm shadow transition-colors disabled:opacity-60"
                >
                  {confirmingDegree ? "Confirmando..." : "Confirmar Grau"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
