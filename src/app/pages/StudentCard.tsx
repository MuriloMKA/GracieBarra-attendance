import React from "react";
import { Link } from "react-router";
import { useData } from "../context/DataContext";
import { AttendanceCard } from "../components/AttendanceCard";
import { ArrowLeft, Info } from "lucide-react";

export const StudentCard: React.FC = () => {
  const { currentUser, students, attendance } = useData();

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
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
          <strong>Pontos vermelhos</strong> = datas de graduação ou novo grau
          marcadas pelo professor. O professor pode marcar datas especiais
          diretamente no seu cartão.
        </div>
      </div>

      <AttendanceCard
        student={student}
        attendanceHistory={myAttendance}
        year={new Date().getFullYear()}
      />
    </div>
  );
};
