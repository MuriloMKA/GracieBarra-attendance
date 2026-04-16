import React, { useEffect, useState } from "react";
import { Bell, Megaphone, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { notificationService } from "../services/api";

export const AdminNotifications: React.FC = () => {
  const [title, setTitle] = useState("Aviso da Gracie Barra");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Preencha titulo e mensagem para enviar a notificacao.");
      return;
    }

    try {
      setLoading(true);
      const response = await notificationService.broadcast(
        title.trim(),
        message.trim(),
      );

      toast.success(
        `Notificacao enviada: ${response.sentCount} sucesso(s), ${response.failedCount} falha(s).`,
      );
      setMessage("");
    } catch (error: any) {
      console.error("Erro ao enviar notificacao:", error);
      toast.error(
        error.response?.data?.error || "Erro ao enviar notificacao push.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNearDegreeCheck = async () => {
    try {
      setLoading(true);
      const response = await notificationService.checkNearDegree();
      toast.success(
        `Analise concluida: ${response.notifiedStudents} aluno(s) notificado(s).`,
      );
    } catch (error: any) {
      console.error("Erro ao executar analise de proximidade de grau:", error);
      toast.error(
        error.response?.data?.error || "Erro ao executar analise automatica.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#003087] text-white flex items-center justify-center">
          <Megaphone size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Notificacoes Push
          </h1>
          <p className="text-sm text-gray-500">
            Envie mensagens para todos os usuarios e rode a analise automatica
            de motivacao.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="font-black text-gray-900 flex items-center gap-2">
          <Bell size={18} className="text-[#D10A11]" />
          Envio Manual para Todos
        </h2>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Titulo
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
            placeholder="Ex: Lembrete de treino de hoje"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Mensagem
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003087] focus:outline-none text-sm"
            placeholder="Escreva aqui a notificacao que deve chegar para todos os alunos..."
          />
        </div>

        <button
          onClick={handleBroadcast}
          disabled={loading}
          className="px-5 py-2.5 bg-[#D10A11] hover:bg-red-700 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send size={16} />
          Enviar Notificacao Push
        </button>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-300 p-6">
        <h2 className="font-black text-gray-900 flex items-center gap-2 mb-2">
          <Sparkles size={18} className="text-amber-600" />
          Motivacao Automatica
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          Analisa os alunos e envia notificacao quando faltarem ate 4 treinos
          para o proximo grau.
        </p>
        <button
          onClick={handleNearDegreeCheck}
          disabled={loading}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Executar Analise Agora
        </button>
      </div>
    </div>
  );
};
