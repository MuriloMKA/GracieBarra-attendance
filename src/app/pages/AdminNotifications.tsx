import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Bell,
  Megaphone,
  Send,
  Clock3,
  MessageCircleMore,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "../components/ui/confirm-dialog";
import { notificationService } from "../services/api";

export const AdminNotifications: React.FC = () => {
  const [title, setTitle] = useState("Aviso da Gracie Barra");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<any | null>(
    null,
  );
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  const loadRecentNotifications = async () => {
    try {
      const data = await notificationService.getRecent(5);
      setRecentNotifications(data);
    } catch (error) {
      console.error("Erro ao carregar notificacoes recentes:", error);
    }
  };

  useEffect(() => {
    loadRecentNotifications();
  }, []);

  const handleCreateNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Preencha titulo e mensagem para publicar a notificacao.");
      return;
    }

    try {
      setLoading(true);
      await notificationService.create({
        title: title.trim(),
        message: message.trim(),
        audience: "students",
      });

      toast.success("Notificacao publicada com sucesso.");
      setMessage("");
      await loadRecentNotifications();
    } catch (error: any) {
      console.error("Erro ao enviar notificacao:", error);
      toast.error(
        error.response?.data?.error || "Erro ao publicar notificacao.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!notificationToDelete) {
      return;
    }

    try {
      setLoading(true);
      await notificationService.delete(id);
      toast.success("Notificação encerrada com sucesso.");
      setNotificationToDelete(null);
      await loadRecentNotifications();
    } catch (error: any) {
      console.error("Erro ao excluir notificacao:", error);
      toast.error(
        error.response?.data?.error || "Erro ao excluir notificacao.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin"
          className="flex items-center gap-2 text-gray-500 hover:text-[#D10A11] transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="w-12 h-12 rounded-full bg-[#003087] text-white flex items-center justify-center">
          <Megaphone size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Notificações internas
          </h1>
          <p className="text-sm text-gray-500">
            Publique avisos para os alunos e veja as mensagens recentes no mural
            do sistema.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="font-black text-gray-900 flex items-center gap-2">
          <Bell size={18} className="text-[#D10A11]" />
          Publicar aviso para alunos
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
          onClick={handleCreateNotification}
          disabled={loading}
          className="px-5 py-2.5 bg-[#D10A11] hover:bg-red-700 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send size={16} />
          Publicar notificação
        </button>
      </div>

      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 p-6">
        <h2 className="font-black text-gray-900 flex items-center gap-2 mb-2">
          <MessageCircleMore size={18} className="text-[#003087]" />
          Últimas publicações
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          Essas mensagens aparecem no mural dos alunos nos últimos avisos.
        </p>
        <div className="space-y-3">
          {recentNotifications.length === 0 ? (
            <div className="text-sm text-gray-500">
              Nenhuma notificação publicada ainda.
            </div>
          ) : (
            recentNotifications.map((item) => (
              <div
                key={item._id || item.id}
                className="bg-white rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {item.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                      <Clock3 size={12} />
                      {item.createdByName || "Professor"}
                    </div>
                  </div>
                  <span className="text-[11px] uppercase font-bold text-[#003087] bg-blue-50 rounded-full px-2 py-1">
                    {item.audience === "students" ? "Alunos" : item.audience}
                  </span>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setNotificationToDelete(item)}
                    className="text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    Encerrar / excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!notificationToDelete}
        title="Encerrar notificação"
        description="Essa notificação será removida do mural e deixará de aparecer para os alunos."
        confirmText="Encerrar / excluir"
        danger
        loading={loading}
        onOpenChange={(open) => {
          if (!open && !loading) setNotificationToDelete(null);
        }}
        onConfirm={() =>
          handleDeleteNotification(
            notificationToDelete?._id || notificationToDelete?.id,
          )
        }
      />
    </div>
  );
};
