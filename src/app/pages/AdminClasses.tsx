import React, { useState } from "react";
import { Link } from "react-router";
import { useData, Class } from "../context/DataContext";
import {
  ArrowLeft,
  Clock,
  Edit2,
  Trash2,
  Plus,
  X,
  Calendar,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

const CLASS_TYPES = [
  { value: "GBKIDS", label: "GBKIDS (até 6 anos)", program: "GBK" },
  { value: "JUVENIL", label: "Juvenil (7-15 anos)", program: "GBK" },
  { value: "GB1", label: "GB1 Fundamental", program: "GB1" },
  { value: "GB2", label: "GB2 Avançado", program: "GB2" },
  { value: "GB3", label: "GB3", program: "GB3" },
  { value: "ADULTO", label: "Adulto (Todas as faixas)", program: "ALL_ADULT" },
  { value: "OPEN_MAT", label: "Open Mat", program: "OPEN" },
];

export const AdminClasses: React.FC = () => {
  const { classes, updateClass, addClass, deleteClass } = useData();
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClass, setNewClass] = useState<Partial<Class>>({
    name: "",
    time: "",
    instructor: "Professor",
    daysOfWeek: [],
    ageGroup: "",
    program: "",
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateClass(editingClass);
      toast.success("Aula atualizada com sucesso!");
      setEditingClass(null);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.name || !newClass.time || newClass.daysOfWeek?.length === 0) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }
    addClass(newClass as Omit<Class, "id">);
    toast.success("Aula adicionada com sucesso!");
    setShowAddModal(false);
    setNewClass({
      name: "",
      time: "",
      instructor: "Professor",
      daysOfWeek: [],
      ageGroup: "",
      program: "",
    });
  };

  const handleDelete = (classId: string, className: string) => {
    if (
      window.confirm(`Tem certeza que deseja excluir a aula "${className}"?`)
    ) {
      deleteClass(classId);
      toast.success("Aula excluída com sucesso!");
    }
  };

  const toggleDay = (
    dayValue: number,
    currentDays: number[],
    setter: (days: number[]) => void,
  ) => {
    if (currentDays.includes(dayValue)) {
      setter(currentDays.filter((d) => d !== dayValue));
    } else {
      setter([...currentDays, dayValue].sort());
    }
  };

  const formatDaysOfWeek = (days: number[]) => {
    return days
      .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label)
      .join(", ");
  };

  const sortedClasses = [...classes].sort((a, b) => {
    const timeA = a.time.split(":").map(Number);
    const timeB = b.time.split(":").map(Number);
    return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
  });

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
              Gerenciar Aulas
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Configure horários e dias das aulas
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#D10A11] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all"
        >
          <Plus size={18} />
          Nova Aula
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
        <strong>Dica:</strong> Configure os horários das aulas para que os
        alunos possam ver as aulas disponíveis no dia e confirmar presença.
      </div>

      {/* Classes List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Aula
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Dias da Semana
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedClasses.map((cls) => (
                <tr
                  key={cls.id || cls._id}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="font-bold text-gray-900 text-sm">
                      {cls.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {cls.instructor}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock size={14} className="text-[#D10A11]" />
                      {cls.time}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-gray-600">
                      {formatDaysOfWeek(cls.daysOfWeek)}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700">
                      {cls.ageGroup || cls.program || "Geral"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingClass({ ...cls })}
                        className="p-2 text-[#003087] hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar aula"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete((cls.id || cls._id) as string, cls.name)
                        }
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir aula"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {classes.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              <Users size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Nenhuma aula cadastrada</p>
              <p className="text-sm mt-1">
                Clique em "Nova Aula" para adicionar a primeira aula
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingClass && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setEditingClass(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-gray-900 text-xl">Editar Aula</h3>
              <button
                onClick={() => setEditingClass(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Nome da Aula *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingClass.name}
                    onChange={(e) =>
                      setEditingClass({ ...editingClass, name: e.target.value })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                    placeholder="Ex: Jiu-Jitsu Juvenil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Horário *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingClass.time}
                    onChange={(e) =>
                      setEditingClass({ ...editingClass, time: e.target.value })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                    placeholder="Ex: 18:00-19:00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Instrutor
                </label>
                <input
                  type="text"
                  value={editingClass.instructor}
                  onChange={(e) =>
                    setEditingClass({
                      ...editingClass,
                      instructor: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                  placeholder="Nome do instrutor"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Faixa Etária
                  </label>
                  <select
                    value={editingClass.ageGroup || ""}
                    onChange={(e) =>
                      setEditingClass({
                        ...editingClass,
                        ageGroup: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm bg-white"
                  >
                    <option value="">Selecione...</option>
                    {CLASS_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Programa
                  </label>
                  <input
                    type="text"
                    value={editingClass.program || ""}
                    onChange={(e) =>
                      setEditingClass({
                        ...editingClass,
                        program: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                    placeholder="Ex: GBK, GB1, GB2, GB3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Dias da Semana *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() =>
                        toggleDay(day.value, editingClass.daysOfWeek, (days) =>
                          setEditingClass({
                            ...editingClass,
                            daysOfWeek: days,
                          }),
                        )
                      }
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        editingClass.daysOfWeek.includes(day.value)
                          ? "bg-[#003087] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="flex-1 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#D10A11] hover:bg-red-700 text-white rounded-xl font-black text-sm shadow-lg"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
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
              <h3 className="font-black text-gray-900 text-xl">
                Adicionar Nova Aula
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Nome da Aula *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClass.name}
                    onChange={(e) =>
                      setNewClass({ ...newClass, name: e.target.value })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                    placeholder="Ex: Jiu-Jitsu GBKIDS"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Horário *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClass.time}
                    onChange={(e) =>
                      setNewClass({ ...newClass, time: e.target.value })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                    placeholder="Ex: 18:00-19:00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Instrutor
                </label>
                <input
                  type="text"
                  value={newClass.instructor}
                  onChange={(e) =>
                    setNewClass({ ...newClass, instructor: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                  placeholder="Nome do instrutor"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Faixa Etária
                  </label>
                  <select
                    value={newClass.ageGroup || ""}
                    onChange={(e) =>
                      setNewClass({ ...newClass, ageGroup: e.target.value })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm bg-white"
                  >
                    <option value="">Selecione...</option>
                    {CLASS_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Programa
                  </label>
                  <input
                    type="text"
                    value={newClass.program || ""}
                    onChange={(e) =>
                      setNewClass({ ...newClass, program: e.target.value })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
                    placeholder="Ex: GBK, GB1, GB2, GB3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Dias da Semana *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() =>
                        toggleDay(
                          day.value,
                          newClass.daysOfWeek || [],
                          (days) =>
                            setNewClass({ ...newClass, daysOfWeek: days }),
                        )
                      }
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        (newClass.daysOfWeek || []).includes(day.value)
                          ? "bg-[#003087] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#D10A11] hover:bg-red-700 text-white rounded-xl font-black text-sm shadow-lg"
                >
                  Adicionar Aula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
