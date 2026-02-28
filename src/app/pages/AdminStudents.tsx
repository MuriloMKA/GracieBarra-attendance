import React, { useState } from 'react';
import { Link } from 'react-router';
import { useData, Student, BeltColor, Program } from '../context/DataContext';
import { format, parseISO } from 'date-fns';
import { Search, Edit2, CreditCard, X, UserPlus, Check, ArrowLeft } from 'lucide-react';
import { BeltDisplay, BELT_NAMES_PT } from '../components/BeltDisplay';
import { toast } from 'sonner';

const BELT_OPTIONS: BeltColor[] = ['White', 'Grey', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Brown', 'Black'];
const PROGRAM_OPTIONS: Program[] = ['GBK', 'GB1', 'GB2', 'GB3'];

const BELT_COLORS_CSS: Record<BeltColor, { bg: string; text: string }> = {
  White: { bg: 'bg-gray-100', text: 'text-gray-800' },
  Grey: { bg: 'bg-gray-200', text: 'text-gray-800' },
  Yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Orange: { bg: 'bg-orange-100', text: 'text-orange-800' },
  Green: { bg: 'bg-green-100', text: 'text-green-800' },
  Blue: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Purple: { bg: 'bg-purple-100', text: 'text-purple-800' },
  Brown: { bg: 'bg-amber-100', text: 'text-amber-900' },
  Black: { bg: 'bg-gray-900', text: 'text-white' },
};

export const AdminStudents: React.FC = () => {
  const { students, attendance, updateStudent, addStudent } = useData();
  const [search, setSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: '',
    email: '',
    program: 'GB1',
    belt: 'White',
    degrees: 0,
    lastGraduationDate: new Date().toISOString().split('T')[0],
    nextDegreeDate: '',
    birthDate: '',
    specialDates: [],
  });

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.belt.toLowerCase().includes(search.toLowerCase())
  );

  const getStudentAttendance = (id: string) =>
    attendance.filter(a => a.studentId === id && a.confirmed).length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateStudent(editingStudent);
      toast.success(`${editingStudent.name} atualizado com sucesso!`);
      setEditingStudent(null);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) return;
    addStudent(newStudent as Omit<Student, 'id'>, newStudent.email!, 'aluno123');
    toast.success(`${newStudent.name} cadastrado com sucesso! Senha padrão: aluno123`);
    setShowAddModal(false);
    setNewStudent({
      name: '', email: '', program: 'GB1', belt: 'White', degrees: 0,
      lastGraduationDate: new Date().toISOString().split('T')[0],
      nextDegreeDate: '', birthDate: '', specialDates: [],
    });
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
            <h1 className="text-2xl font-black text-gray-900">Gerenciar Alunos</h1>
            <p className="text-gray-500 text-sm">{students.length} alunos cadastrados</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#D10A11] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all"
        >
          <UserPlus size={18} />
          Novo Aluno
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, email ou faixa..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Aluno</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Programa</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Faixa</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Graus</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Última Grad.</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Aulas Conf.</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(student => {
                const colors = BELT_COLORS_CSS[student.belt];
                return (
                  <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#003087] text-white flex items-center justify-center font-black text-sm shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${student.program === 'GBK' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {student.program}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${colors.bg} ${colors.text}`}>
                        {BELT_NAMES_PT[student.belt]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 items-center">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-5 rounded-sm ${i < student.degrees ? 'bg-[#D10A11]' : 'bg-gray-200'}`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">({student.degrees})</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600">
                        {format(parseISO(student.lastGraduationDate), 'dd/MM/yyyy')}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm font-bold text-[#003087]">
                        {getStudentAttendance(student.id)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingStudent({ ...student })}
                          className="p-2 text-[#003087] hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editar aluno"
                        >
                          <Edit2 size={16} />
                        </button>
                        <Link
                          to={`/admin/students/${student.id}/card`}
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
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-500">Nenhum aluno encontrado.</div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditingStudent(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900">Editar Aluno</h2>
              <button onClick={() => setEditingStudent(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Preview Belt */}
            <div className="mb-5 p-3 bg-gray-50 rounded-xl">
              <BeltDisplay belt={editingStudent.belt} degrees={editingStudent.degrees} program={editingStudent.program} size="md" />
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.name}
                    onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingStudent.email}
                    onChange={e => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Programa</label>
                  <select
                    value={editingStudent.program}
                    onChange={e => setEditingStudent({ ...editingStudent, program: e.target.value as Program })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm bg-white"
                  >
                    {PROGRAM_OPTIONS.map(p => (
                      <option key={p} value={p}>{p === 'GBK' ? 'GBK — Crianças' : p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Faixa Atual</label>
                  <select
                    value={editingStudent.belt}
                    onChange={e => setEditingStudent({ ...editingStudent, belt: e.target.value as BeltColor })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm bg-white"
                  >
                    {BELT_OPTIONS.map(b => (
                      <option key={b} value={b}>{BELT_NAMES_PT[b]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Graus na Faixa: <span className="text-[#D10A11]">{editingStudent.degrees}</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={4}
                    value={editingStudent.degrees}
                    onChange={e => setEditingStudent({ ...editingStudent, degrees: parseInt(e.target.value) })}
                    className="w-full accent-[#D10A11]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    {[0, 1, 2, 3, 4].map(n => <span key={n}>{n}</span>)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={editingStudent.birthDate}
                    onChange={e => setEditingStudent({ ...editingStudent, birthDate: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Data da Última Graduação</label>
                  <input
                    type="date"
                    value={editingStudent.lastGraduationDate}
                    onChange={e => setEditingStudent({ ...editingStudent, lastGraduationDate: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Próximo Grau Estimado</label>
                  <input
                    type="date"
                    value={editingStudent.nextDegreeDate}
                    onChange={e => setEditingStudent({ ...editingStudent, nextDegreeDate: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
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
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900">Cadastrar Novo Aluno</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">A senha padrão será <strong>aluno123</strong>. O aluno pode solicitar alteração.</p>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newStudent.email}
                    onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Programa</label>
                  <select
                    value={newStudent.program}
                    onChange={e => setNewStudent({ ...newStudent, program: e.target.value as Program })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm bg-white"
                  >
                    {PROGRAM_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Faixa</label>
                  <select
                    value={newStudent.belt}
                    onChange={e => setNewStudent({ ...newStudent, belt: e.target.value as BeltColor })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm bg-white"
                  >
                    {BELT_OPTIONS.map(b => <option key={b} value={b}>{BELT_NAMES_PT[b]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Graus: {newStudent.degrees}</label>
                  <input
                    type="range" min={0} max={4}
                    value={newStudent.degrees}
                    onChange={e => setNewStudent({ ...newStudent, degrees: parseInt(e.target.value) })}
                    className="w-full accent-[#D10A11]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={newStudent.birthDate}
                    onChange={e => setNewStudent({ ...newStudent, birthDate: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Data da Última Graduação</label>
                  <input
                    type="date"
                    value={newStudent.lastGraduationDate}
                    onChange={e => setNewStudent({ ...newStudent, lastGraduationDate: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Próximo Grau Estimado</label>
                  <input
                    type="date"
                    value={newStudent.nextDegreeDate}
                    onChange={e => setNewStudent({ ...newStudent, nextDegreeDate: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-[#D10A11] hover:bg-red-700 text-white rounded-lg font-black text-sm shadow-lg flex items-center gap-2">
                  <UserPlus size={16} />
                  Cadastrar Aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
