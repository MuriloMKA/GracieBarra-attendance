import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, AlertCircle } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onClose,
}) => {
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        // Tenta primeiro com a câmera traseira, depois qualquer câmera
        try {
          await scanner.start(
            { facingMode: "environment" }, // Câmera traseira
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              scanner.stop();
              onScanSuccess(decodedText);
            },
            (errorMessage) => {
              // Ignora erros de scan contínuo
            },
          );
        } catch (envError) {
          // Se falhar com environment, tenta com qualquer câmera
          await scanner.start(
            { facingMode: "user" }, // Câmera frontal
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              scanner.stop();
              onScanSuccess(decodedText);
            },
            (errorMessage) => {
              // Ignora erros de scan contínuo
            },
          );
        }

        setIsScanning(true);
      } catch (err: any) {
        console.error("Camera error:", err);

        let errorMsg = "Erro ao acessar câmera.";

        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          errorMsg =
            "Permissão negada. Permita o acesso à câmera nas configurações do aplicativo.";
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          errorMsg = "Nenhuma câmera encontrada no dispositivo.";
        } else if (
          err.name === "NotReadableError" ||
          err.name === "TrackStartError"
        ) {
          errorMsg =
            "Câmera está sendo usada por outro aplicativo. Feche outros apps que usam a câmera.";
        } else if (err.name === "OverconstrainedError") {
          errorMsg =
            "Câmera não atende aos requisitos. Tente usar outro dispositivo.";
        } else if (err.name === "TypeError") {
          errorMsg = "Configuração inválida. Tente reiniciar o aplicativo.";
        } else if (err.message) {
          errorMsg = err.message;
        }

        setError(errorMsg);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current
          .stop()
          .catch((err) => console.error("Error stopping scanner:", err));
      }
    };
  }, [onScanSuccess]);

  const handleClose = () => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().then(() => onClose());
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Camera size={20} className="text-[#D10A11]" />
            <h3 className="font-black text-gray-900">Escanear QR Code</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="p-5">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-red-900 text-sm mb-1">
                  Erro ao acessar câmera
                </div>
                <div className="text-red-700 text-xs">{error}</div>
                <div className="text-red-600 text-xs mt-2">
                  Verifique se você permitiu acesso à câmera nas configurações
                  do dispositivo.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div
                id="qr-reader"
                className="rounded-xl overflow-hidden border-4 border-[#003087]"
              />
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-600 mb-2">
                  Posicione o QR Code dentro da área marcada
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {isScanning ? "Escaneando..." : "Iniciando câmera..."}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="w-full py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
