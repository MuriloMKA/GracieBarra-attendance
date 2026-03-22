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
  const [isStarting, setIsStarting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const mapCameraError = (err: any): string => {
    const message = `${err?.message || ""}`.toLowerCase();
    const name = err?.name;

    if (!window.isSecureContext) {
      return "A camera so funciona em contexto seguro (HTTPS).";
    }

    if (
      name === "NotAllowedError" ||
      name === "PermissionDeniedError" ||
      message.includes("permission")
    ) {
      return "Permissao negada. Toque em permitir camera no navegador/app e tente novamente.";
    }

    if (
      name === "NotFoundError" ||
      name === "DevicesNotFoundError" ||
      message.includes("requested device not found")
    ) {
      return "Nenhuma camera foi encontrada neste dispositivo.";
    }

    if (name === "NotReadableError" || name === "TrackStartError") {
      return "A camera esta sendo usada por outro app. Feche outros apps e tente novamente.";
    }

    return err?.message || "Erro ao acessar camera.";
  };

  const handleDecoded = async (decodedText: string) => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
    } catch (stopError) {
      console.error("Error stopping scanner after success:", stopError);
    }
    setIsScanning(false);
    onScanSuccess(decodedText);
  };

  const startScanner = async () => {
    setError("");
    setIsStarting(true);
    setIsScanning(false);

    try {
      if (!window.isSecureContext) {
        throw new Error("Contexto inseguro: use HTTPS para liberar camera.");
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      const scanner = scannerRef.current;
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      const cameras = await Html5Qrcode.getCameras();

      if (cameras.length === 0) {
        throw new Error("Nenhuma camera detectada.");
      }

      const backCamera = cameras.find((cam) =>
        /back|rear|traseira|environment/i.test(cam.label),
      );

      const cameraToUse = backCamera?.id || cameras[0].id;

      await scanner.start(cameraToUse, config, handleDecoded, () => {
        // Ignora erros de leitura continua
      });

      setIsScanning(true);
    } catch (err: any) {
      console.error("Camera error:", err);
      setError(mapCameraError(err));
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    // Nao inicia automaticamente para evitar bloqueio de permissao em alguns celulares.

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current
          .stop()
          .catch((err) => console.error("Error stopping scanner:", err));
      }
    };
  }, []);

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
                  Se for navegador, confirme HTTPS e permissao de camera nas
                  configuracoes do site.
                </div>
                <button
                  onClick={startScanner}
                  className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                >
                  Tentar novamente
                </button>
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
                  {isScanning
                    ? "Escaneando..."
                    : isStarting
                      ? "Iniciando camera..."
                      : "Toque em Ativar camera"}
                </div>
                {!isScanning && !isStarting && (
                  <button
                    onClick={startScanner}
                    className="mt-3 px-4 py-2 bg-[#003087] text-white rounded-lg font-semibold text-sm hover:bg-blue-900"
                  >
                    Ativar camera
                  </button>
                )}
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
