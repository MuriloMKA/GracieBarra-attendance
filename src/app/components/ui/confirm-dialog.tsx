import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = true,
  loading = false,
  onConfirm,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border border-gray-200 bg-white p-0 shadow-2xl">
        <div className="p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-black text-gray-900">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-gray-600">
              {description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 gap-3 sm:gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100"
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                danger
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#003087] hover:bg-blue-900"
              }`}
            >
              {loading ? "Processando..." : confirmText}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
