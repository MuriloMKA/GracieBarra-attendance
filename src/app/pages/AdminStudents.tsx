import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useData, Student, BeltColor, Program } from "../context/DataContext";
import { format, parseISO } from "date-fns";
import {
  Search,
  CreditCard,
  X,
  UserPlus,
  Check,
  ArrowLeft,
  TrendingUp,
  Printer,
  Trash2,
} from "lucide-react";
import {
  BeltDisplay,
  BELT_NAMES_PT,
  getDegreeDisplayLabel,
  getNextDegreeDisplayLabel,
  calculateProgram,
} from "../components/BeltDisplay";
import { StudentQRCode } from "../components/StudentQRCode";
import { Switch } from "../components/ui/switch";
import { ConfirmDialog } from "../components/ui/confirm-dialog";
import { toast } from "sonner";
import { getDegreeProgress } from "../utils/degreeCalculator";

// GBK (Crianças/Adolescentes) - 13 faixas progressivas
const GBK_BELT_OPTIONS: BeltColor[] = [
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

// Programas adultos - 5 faixas principais
const ADULT_BELT_OPTIONS: BeltColor[] = [
  "White",
  "Blue",
  "Purple",
  "Brown",
  "Black",
];

const PROGRAM_OPTIONS: Array<{ value: Program; label: string }> = [
  { value: "GBK", label: "GBK (legado)" },
  { value: "GBKIDS", label: "GBK Kids" },
  { value: "GBKJUVENIL", label: "GBK Juvenil" },
  { value: "GB1", label: "GB1" },
  { value: "GB2", label: "GB2" },
  { value: "GB3", label: "GB3" },
];

// Função que retorna as faixas corretas baseado no programa
const getBeltOptionsForProgram = (program: Program): BeltColor[] => {
  return program.startsWith("GBK") ? GBK_BELT_OPTIONS : ADULT_BELT_OPTIONS;
};

// Função que retorna o número máximo de graus baseado no programa e faixa
const getMaxDegreesForBelt = (program: Program, belt: BeltColor): number => {
  // Adultos: máximo 4 graus (exceto faixa preta que tem até 6)
  if (!program.startsWith("GBK")) {
    return belt === "Black" ? 6 : 4;
  }

  // GBK - Crianças (cada grau = 1 mês de treino)
  switch (belt) {
    case "White": // 4 brancos + 1 vermelho
    case "GreyWhite": // 4 brancos + 1 vermelho
      return 5;

    case "Grey": // 4 brancos + 4 vermelhos + 3 pretos
    case "GreyBlack": // 4 brancos + 4 vermelhos + 3 pretos
    case "YellowWhite": // 4 brancos + 4 vermelhos + 3 pretos
    case "Yellow": // 4 brancos + 4 vermelhos + 3 pretos
    case "YellowBlack": // 4 brancos + 4 vermelhos + 3 pretos
    case "OrangeWhite": // 4 brancos + 4 vermelhos + 3 pretos
    case "Orange": // 4 brancos + 4 vermelhos + 3 pretos
    case "OrangeBlack": // 4 brancos + 4 vermelhos + 3 pretos
    case "GreenWhite": // 4 brancos + 4 vermelhos + 3 pretos
    case "Green": // 4 brancos + 4 vermelhos + 3 pretos
    case "GreenBlack": // 4 brancos + 4 vermelhos + 3 pretos
      return 11;

    default:
      return 4;
  }
};

const normalizeProgram = (
  program: Program,
  belt: BeltColor,
  degrees: number,
  birthDate?: string,
): Program => {
  return calculateProgram(program, belt, degrees, birthDate);
};

const getProgramLabel = (program: Program): string => {
  if (program === "GBKIDS") return "GBK Kids";
  if (program === "GBKJUVENIL") return "GBK Juvenil";
  return program;
};

const BELT_COLORS_CSS: Record<BeltColor, { bg: string; text: string }> = {
  White: { bg: "bg-gray-100", text: "text-gray-800" },
  GreyWhite: { bg: "bg-gray-200", text: "text-gray-700" },
  Grey: { bg: "bg-gray-300", text: "text-gray-800" },
  GreyBlack: { bg: "bg-gray-400", text: "text-gray-900" },
  YellowWhite: { bg: "bg-yellow-50", text: "text-yellow-800" },
  Yellow: { bg: "bg-yellow-100", text: "text-yellow-800" },
  YellowBlack: { bg: "bg-yellow-200", text: "text-yellow-900" },
  OrangeWhite: { bg: "bg-orange-50", text: "text-orange-800" },
  Orange: { bg: "bg-orange-100", text: "text-orange-800" },
  OrangeBlack: { bg: "bg-orange-200", text: "text-orange-900" },
  GreenWhite: { bg: "bg-green-50", text: "text-green-800" },
  Green: { bg: "bg-green-100", text: "text-green-800" },
  GreenBlack: { bg: "bg-green-200", text: "text-green-900" },
  Blue: { bg: "bg-blue-100", text: "text-blue-800" },
  Purple: { bg: "bg-purple-100", text: "text-purple-800" },
  Brown: { bg: "bg-amber-100", text: "text-amber-900" },
  Black: { bg: "bg-gray-900", text: "text-white" },
};

const getBirthDatePassword = (birthDate?: string) => {
  if (!birthDate) return "";
  const value = birthDate.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}${month}${year}`;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${day}${month}${year}`;
  }
  return value.replace(/\D/g, "").slice(0, 8);
};

export const AdminStudents: React.FC = () => {
  const { students, attendance, updateStudent, addStudent } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const normalizeString = (v?: string) =>
    (v || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | "all"
  >("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editReturnTo, setEditReturnTo] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newlyCreatedStudent, setNewlyCreatedStudent] =
    useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: "",
    email: "",
    program: "GB1",
    belt: "White",
    degrees: 0,
    lastGraduationDate: new Date().toISOString().split("T")[0],
    nextDegreeDate: "",
    birthDate: "",
    specialDates: [],
  });

  const formatGraduationDate = (date?: string) => {
    if (!date) return "Sem data";
    return format(parseISO(date), "dd/MM/yyyy");
  };

  const visibleStudents = students.filter((s) => {
    if (statusFilter === "active" && s.active === false) return false;
    if (statusFilter === "inactive" && s.active !== false) return false;

    const q = normalizeString(search);
    return (
      normalizeString(s.name).includes(q) ||
      normalizeString(s.email).includes(q) ||
      normalizeString(s.belt).includes(q)
    );
  });
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(visibleStudents.length / pageSize));
  const currentPageStudents = visibleStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get("edit");
    const returnTo = params.get("returnTo");
    if (!editId) return;

    const studentToEdit = students.find(
      (s) => (s.id || s._id) === editId,
    );
    if (!studentToEdit) return;

    setEditingStudent({ ...studentToEdit });
    setEditReturnTo(returnTo || null);

    params.delete("edit");
    params.delete("returnTo");
    const nextSearch = params.toString();
    navigate(
      {
        pathname: "/admin/students",
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true },
    );
  }, [location.search, navigate, students]);

  const closeEditModal = useCallback(() => {
    setEditingStudent(null);

    if (editReturnTo) {
      navigate(editReturnTo, { replace: true });
      setEditReturnTo(null);
    }
  }, [editReturnTo, navigate]);

  const getStudentAttendance = (id: string) => {
    const map = new Map<string, number>();
    attendance.forEach((a) => {
      const sid = (a.studentId as any)?._id || (a.studentId as any)?.id || a.studentId;
      if (sid !== id || !a.confirmed) return;
      const d = new Date(a.date);
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) {
        const key = a.date.slice(0, 10);
        const cur = map.get(key) || 0;
        if (cur < 2) map.set(key, cur + 1);
      }
    });
    let total = 0;
    map.forEach((c) => (total += c));
    return total;
  };

  const activeStudentsCount = students.filter(
    (student) => student.active !== false,
  ).length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      const normalizedProgram = normalizeProgram(
        editingStudent.program,
        editingStudent.belt,
        editingStudent.degrees,
        editingStudent.birthDate,
      );
      const normalizedStudent = {
        ...editingStudent,
        program: normalizedProgram,
      };

      await updateStudent(normalizedStudent);
      toast.success(`${normalizedStudent.name} atualizado com sucesso!`);
      closeEditModal();
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) return;
    const birthDatePassword = getBirthDatePassword(newStudent.birthDate);
    if (!birthDatePassword) {
      toast.error("Informe a data de nascimento para gerar a senha.");
      return;
    }

    const normalizedProgram = normalizeProgram(
      (newStudent.program as Program) || "GB1",
      ((newStudent.belt as BeltColor) || "White") as BeltColor,
      newStudent.degrees || 0,
      newStudent.birthDate,
    );

    addStudent(
      { ...newStudent, program: normalizedProgram } as Omit<Student, "id">,
      newStudent.email!,
      birthDatePassword,
    );

    // Busca o aluno recém-criado
    setTimeout(() => {
      const createdStudent = students.find((s) => s.email === newStudent.email);
      if (createdStudent) {
        setNewlyCreatedStudent(createdStudent);
      }
    }, 500);

    toast.success(
      `${newStudent.name} cadastrado com sucesso! Senha padrão: data de nascimento (ddmmaaaa)`,
    );
    setShowAddModal(false);
    setNewStudent({
      name: "",
      email: "",
      program: "GB1",
      belt: "White",
      degrees: 0,
      lastGraduationDate: new Date().toISOString().split("T")[0],
      nextDegreeDate: "",
      birthDate: "",
      specialDates: [],
    });
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      setDeletingStudent(true);
      await updateStudent({
        ...studentToDelete,
        active: false,
      });
      toast.success(`${studentToDelete.name} foi inativado com sucesso.`);
      setStudentToDelete(null);
      closeEditModal();
    } catch (error) {
      console.error("Erro ao inativar aluno:", error);
      toast.error("Não foi possível inativar o aluno.");
    } finally {
      setDeletingStudent(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-gray-500 hover:text-[#D10A11] transition-colors text-sm font-medium"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Gerenciar Alunos
            </h1>
            <p className="text-gray-500 text-sm">
              {activeStudentsCount} ativos · {students.length} cadastrados
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/students/print-qrcodes"
            className="flex items-center gap-2 bg-[#003087] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow transition-all"
          >
            <Printer size={18} />
            Imprimir QR Codes
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#D10A11] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all"
          >
            <UserPlus size={18} />
            Novo Aluno
          </button>
        </div>
      </div>
      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, email ou faixa..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "active", label: "Ativos" },
          { key: "inactive", label: "Inativos" },
          { key: "all", label: "Todos" },
        ].map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setStatusFilter(filter.key as any)}
            className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
              statusFilter === filter.key
                ? "bg-[#003087] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Aluno
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Programa
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Faixa
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Graus
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Última Grad.
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Aulas Conf.
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentPageStudents.map((student) => {
                const colors = BELT_COLORS_CSS[student.belt];
                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-blue-50/30 transition-colors ${student.active === false ? "opacity-60 bg-gray-50" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#003087] text-white flex items-center justify-center font-black text-sm shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">
                            {student.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${student.program.startsWith("GBK") ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                      >
                        {getProgramLabel(student.program)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${colors.bg} ${colors.text}`}
                      >
                        {BELT_NAMES_PT[student.belt]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-gray-700">
                        {getDegreeDisplayLabel(
                          student.program,
                          student.belt,
                          student.degrees,
                        ) || "Sem grau"}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600">
                        {formatGraduationDate(student.lastGraduationDate)}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm font-bold text-[#003087]">
                        {getStudentAttendance(
                          (student.id || student._id) as string,
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center gap-2 mr-2">
                          <span
                            className={`text-[11px] font-bold uppercase ${student.active === false ? "text-gray-500" : "text-green-700"}`}
                          >
                            {student.active === false ? "Inativo" : "Ativo"}
                          </span>
                          <Switch
                            checked={student.active !== false}
                            onCheckedChange={async (checked) => {
                              try {
                                await updateStudent({
                                  ...student,
                                  active: checked,
                                });
                                toast.success(
                                  checked
                                    ? `${student.name} reativado com sucesso!`
                                    : `${student.name} inativado com sucesso!`,
                                );
                              } catch (error) {
                                console.error(
                                  "Erro ao alternar status do aluno:",
                                  error,
                                );
                              }
                            }}
                          />
                        </div>
                        <Link
                          to={`/admin/students/${student.id || student._id}/card`}
                          className="p-2 text-[#D10A11] hover:bg-red-100 rounded-lg transition-colors"
                          title="Ver cartão de frequência"
                        >
                          <CreditCard size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visibleStudents.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              Nenhum aluno encontrado.
            </div>
          )}
        </div>
      </div>

      {visibleStudents.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3">
          <p className="text-sm text-gray-500">
            Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
            {Math.min(currentPage * pageSize, visibleStudents.length)} de{" "}
            {visibleStudents.length} alunos
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-2 rounded-lg bg-gray-100 text-sm font-bold text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingStudent &&
        (() => {
          const studentIdMatch = (editingStudent.id ||
            editingStudent._id) as string;
          const studentAttendance = attendance.filter(
            (a) =>
              a.studentId === studentIdMatch ||
              (a.studentId as any)?._id === studentIdMatch ||
              (a.studentId as any)?.id === studentIdMatch,
          );
          const degreeProgress = getDegreeProgress(
            studentAttendance,
            editingStudent.lastGraduationDate,
            editingStudent.belt,
            editingStudent.degrees,
            editingStudent.program,
            editingStudent.birthDate,
          );
          const progressUnit = degreeProgress.progressUnit || "treinos";
          const progressValue = Math.round(
            degreeProgress.weeksCompleted,
          ).toString();
          const progressRequiredValue = String(
            Math.round(degreeProgress.weeksRequired || 0),
          );

          return (
            <div
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
              onClick={closeEditModal}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-black text-gray-900">
                    Editar Aluno
                  </h2>
                  <button
                    onClick={closeEditModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Preview Belt */}
                <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                  <BeltDisplay
                    belt={editingStudent.belt}
                    degrees={editingStudent.degrees}
                    program={editingStudent.program}
                    size="md"
                  />
                </div>

                {/* QR Code do Aluno */}
                <div className="mb-4">
                  <StudentQRCode student={editingStudent} size="md" />
                </div>

                {/* Progresso do Próximo Grau */}
                {degreeProgress.weeksRequired !== null && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={14} className="text-[#003087]" />
                      <span className="text-xs font-bold text-gray-700">
                        Progresso{" "}
                        {getNextDegreeDisplayLabel(
                          editingStudent.program,
                          editingStudent.belt,
                          editingStudent.degrees,
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className={`h-full rounded-full ${
                          degreeProgress.isReadyForGraduation
                            ? "bg-green-500"
                            : "bg-[#003087]"
                        }`}
                        style={{
                          width: `${degreeProgress.progressPercentage}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        {progressValue} / {progressRequiredValue} {progressUnit}
                      </span>
                      <span className="font-bold">
                        {degreeProgress.estimatedDate}
                      </span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={editingStudent.name}
                        onChange={(e) =>
                          setEditingStudent({
                            ...editingStudent,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={editingStudent.email}
                        onChange={(e) =>
                          setEditingStudent({
                            ...editingStudent,
                            email: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Programa
                      </label>
                      <select
                        value={editingStudent.program}
                        onChange={(e) => {
                          const newProgram = e.target.value as Program;
                          const availableBelts =
                            getBeltOptionsForProgram(newProgram);
                          // Se a faixa atual não está disponível no novo programa, reseta para White
                          const newBelt = availableBelts.includes(
                            editingStudent.belt,
                          )
                            ? editingStudent.belt
                            : "White";
                          // Verifica se os graus atuais excedem o máximo no novo programa/faixa
                          const maxDegrees = getMaxDegreesForBelt(
                            newProgram,
                            newBelt,
                          );
                          const newDegrees =
                            editingStudent.degrees > maxDegrees
                              ? 0
                              : editingStudent.degrees;
                          const normalizedProgram = normalizeProgram(
                            newProgram,
                            newBelt,
                            newDegrees,
                            editingStudent.birthDate,
                          );
                          setEditingStudent({
                            ...editingStudent,
                            program: normalizedProgram,
                            belt: newBelt,
                            degrees: newDegrees,
                          });
                        }}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm bg-white"
                      >
                        {PROGRAM_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Faixa Atual
                      </label>
                      <select
                        value={editingStudent.belt}
                        onChange={(e) => {
                          const newBelt = e.target.value as BeltColor;
                          // Verifica se os graus atuais excedem o máximo na nova faixa
                          const maxDegrees = getMaxDegreesForBelt(
                            editingStudent.program,
                            newBelt,
                          );
                          const newDegrees =
                            editingStudent.degrees > maxDegrees
                              ? 0
                              : editingStudent.degrees;
                          const normalizedProgram = normalizeProgram(
                            editingStudent.program,
                            newBelt,
                            newDegrees,
                            editingStudent.birthDate,
                          );
                          setEditingStudent({
                            ...editingStudent,
                            belt: newBelt,
                            degrees: newDegrees,
                            program: normalizedProgram,
                          });
                        }}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm bg-white"
                      >
                        {getBeltOptionsForProgram(editingStudent.program).map(
                          (b) => (
                            <option key={b} value={b}>
                              {BELT_NAMES_PT[b]}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Graus na Faixa:{" "}
                        <span className="text-[#D10A11]">
                          {getDegreeDisplayLabel(
                            editingStudent.program,
                            editingStudent.belt,
                            editingStudent.degrees,
                          ) || "Sem grau"}
                        </span>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={getMaxDegreesForBelt(
                          editingStudent.program,
                          editingStudent.belt,
                        )}
                        value={editingStudent.degrees}
                        onChange={(e) => {
                          const newDegrees = parseInt(e.target.value);
                          const normalizedProgram = normalizeProgram(
                            editingStudent.program,
                            editingStudent.belt,
                            newDegrees,
                          );
                          setEditingStudent({
                            ...editingStudent,
                            degrees: newDegrees,
                            program: normalizedProgram,
                          });
                        }}
                        className="w-full accent-[#D10A11]"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        {Array.from({
                          length:
                            getMaxDegreesForBelt(
                              editingStudent.program,
                              editingStudent.belt,
                            ) + 1,
                        }).map((_, n) => (
                          <span key={n}>{n}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        value={editingStudent.birthDate}
                        onChange={(e) =>
                          setEditingStudent({
                            ...editingStudent,
                            birthDate: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Data da Última Graduação
                      </label>
                      <input
                        type="date"
                        value={editingStudent.lastGraduationDate}
                        onChange={(e) =>
                          setEditingStudent({
                            ...editingStudent,
                            lastGraduationDate: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setStudentToDelete(editingStudent)}
                      className="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-bold text-sm flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Deletar aluno
                    </button>
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#003087] hover:bg-blue-900 text-white rounded-lg font-black text-sm shadow-lg transition-all flex items-center gap-2"
                    >
                      <Check size={16} />
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

      <ConfirmDialog
        open={!!studentToDelete}
        title="Deletar aluno"
        description="Esse aluno será inativado e deixará de aparecer na listagem. Os dados continuam salvos no banco."
        confirmText="Deletar aluno"
        danger
        loading={deletingStudent}
        onOpenChange={(open) => {
          if (!open && !deletingStudent) setStudentToDelete(null);
        }}
        onConfirm={handleDeleteStudent}
      />

      {/* Add Student Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-gray-900">
                Cadastrar Novo Aluno
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              A senha padrão será a data de nascimento no formato
              <strong> ddmmaaaa</strong>. O aluno pode solicitar alteração.
            </p>

            {/* Info sobre regras de programa */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <strong>Regras de Programa:</strong> GB1 = Faixa branca 1-2 graus
              • GB2 = Faixa branca 3-4 graus • GB3 = Faixa azul em diante • GBK
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, name: e.target.value })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newStudent.email}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, email: e.target.value })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Programa
                  </label>
                  <select
                    value={newStudent.program}
                    onChange={(e) => {
                      const newProgram = e.target.value as Program;
                      const availableBelts =
                        getBeltOptionsForProgram(newProgram);
                      // Se a faixa atual não está disponível no novo programa, reseta para White
                      const newBelt = availableBelts.includes(
                        newStudent.belt as BeltColor,
                      )
                        ? newStudent.belt
                        : "White";
                      // Verifica se os graus atuais excedem o máximo no novo programa/faixa
                      const maxDegrees = getMaxDegreesForBelt(
                        newProgram,
                        newBelt as BeltColor,
                      );
                      const newDegrees =
                        (newStudent.degrees || 0) > maxDegrees
                          ? 0
                          : newStudent.degrees;
                      const normalizedProgram = normalizeProgram(
                        newProgram,
                        (newBelt as BeltColor) || "White",
                        newDegrees || 0,
                        newStudent.birthDate,
                      );
                      setNewStudent({
                        ...newStudent,
                        program: normalizedProgram,
                        belt: newBelt,
                        degrees: newDegrees,
                      });
                    }}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm bg-white"
                  >
                    {PROGRAM_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Faixa
                  </label>
                  <select
                    value={newStudent.belt}
                    onChange={(e) => {
                      const newBelt = e.target.value as BeltColor;
                      // Verifica se os graus atuais excedem o máximo na nova faixa
                      const maxDegrees = getMaxDegreesForBelt(
                        newStudent.program || "GB1",
                        newBelt,
                      );
                      const newDegrees =
                        (newStudent.degrees || 0) > maxDegrees
                          ? 0
                          : newStudent.degrees;
                      const normalizedProgram = normalizeProgram(
                        (newStudent.program as Program) || "GB1",
                        newBelt,
                        newDegrees || 0,
                        newStudent.birthDate,
                      );
                      setNewStudent({
                        ...newStudent,
                        belt: newBelt,
                        degrees: newDegrees,
                        program: normalizedProgram,
                      });
                    }}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm bg-white"
                  >
                    {getBeltOptionsForProgram(newStudent.program || "GB1").map(
                      (b) => (
                        <option key={b} value={b}>
                          {BELT_NAMES_PT[b]}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Graus:{" "}
                    {getDegreeDisplayLabel(
                      (newStudent.program as Program) || "GB1",
                      ((newStudent.belt as BeltColor) || "White") as BeltColor,
                      newStudent.degrees || 0,
                    ) || "Sem grau"}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={getMaxDegreesForBelt(
                      newStudent.program || "GB1",
                      (newStudent.belt as BeltColor) || "White",
                    )}
                    value={newStudent.degrees}
                    onChange={(e) => {
                      const newDegrees = parseInt(e.target.value);
                      const normalizedProgram = normalizeProgram(
                        (newStudent.program as Program) || "GB1",
                        ((newStudent.belt as BeltColor) ||
                          "White") as BeltColor,
                        newDegrees,
                        newStudent.birthDate,
                      );
                      setNewStudent({
                        ...newStudent,
                        degrees: newDegrees,
                        program: normalizedProgram,
                      });
                    }}
                    className="w-full accent-[#D10A11]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    {Array.from({
                      length:
                        getMaxDegreesForBelt(
                          newStudent.program || "GB1",
                          (newStudent.belt as BeltColor) || "White",
                        ) + 1,
                    }).map((_, n) => (
                      <span key={n}>{n}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    required
                    value={newStudent.birthDate}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        birthDate: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Data da Última Graduação
                  </label>
                  <input
                    type="date"
                    value={newStudent.lastGraduationDate}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        lastGraduationDate: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#D10A11] hover:bg-red-700 text-white rounded-lg font-black text-sm shadow-lg flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  Cadastrar Aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal - After Student Creation */}
      {newlyCreatedStudent && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setNewlyCreatedStudent(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-gray-900">
                ✅ Aluno Cadastrado!
              </h2>
              <button
                onClick={() => setNewlyCreatedStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="text-sm text-green-900">
                <div className="font-bold mb-1">{newlyCreatedStudent.name}</div>
                <div className="text-xs">{newlyCreatedStudent.email}</div>
                <div className="text-xs mt-2 font-semibold">
                  Senha padrão: data de nascimento (ddmmaaaa)
                </div>
              </div>
            </div>

            <StudentQRCode student={newlyCreatedStudent} size="md" />

            <button
              onClick={() => setNewlyCreatedStudent(null)}
              className="w-full mt-4 py-2.5 bg-[#003087] hover:bg-blue-900 text-white rounded-lg font-bold text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
