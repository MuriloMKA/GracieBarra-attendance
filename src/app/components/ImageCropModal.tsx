import React, { useCallback, useMemo, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ImageCropModalProps {
  open: boolean;
  title?: string;
  imageSrc: string | null;
  onCancel: () => void;
  onConfirm: (dataUrl: string) => Promise<void> | void;
}

const MAX_COMPRESSED_BYTES = 450_000;

const estimateDataUrlBytes = (dataUrl: string) => {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
};

const createImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Falha ao abrir imagem"));
    image.src = src;
  });

const renderCroppedDataUrl = async (
  imageSrc: string,
  croppedAreaPixels: Area,
): Promise<string> => {
  const image = await createImage(imageSrc);
  const side = Math.max(
    1,
    Math.min(croppedAreaPixels.width, croppedAreaPixels.height),
  );

  const sourceX = Math.max(
    0,
    Math.round(croppedAreaPixels.x + (croppedAreaPixels.width - side) / 2),
  );
  const sourceY = Math.max(
    0,
    Math.round(croppedAreaPixels.y + (croppedAreaPixels.height - side) / 2),
  );

  const maxOutput = 420;
  const outputSize = Math.max(180, Math.min(maxOutput, side));

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Falha ao preparar imagem");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    side,
    side,
    0,
    0,
    outputSize,
    outputSize,
  );

  const attempts = [0.86, 0.78, 0.7, 0.62, 0.56];
  let best = "";

  for (const quality of attempts) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    best = dataUrl;
    if (estimateDataUrlBytes(dataUrl) <= MAX_COMPRESSED_BYTES) {
      return dataUrl;
    }
  }

  return best;
};

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  open,
  title = "Ajustar imagem",
  imageSrc,
  onCancel,
  onConfirm,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(
    () => Boolean(open && imageSrc && croppedAreaPixels && !saving),
    [croppedAreaPixels, imageSrc, open, saving],
  );

  const handleCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const resetAndCancel = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onCancel();
  };

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const cropped = await renderCroppedDataUrl(imageSrc, croppedAreaPixels);
      await onConfirm(cropped);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    } finally {
      setSaving(false);
    }
  };

  if (!open || !imageSrc) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4"
      onClick={resetAndCancel}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-black text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Arraste para enquadrar, use zoom e confirme para salvar.
          </p>
        </div>

        <div className="relative h-[360px] bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            objectFit="horizontal-cover"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="px-4 py-3 border-t border-gray-200 space-y-3">
          <div className="flex items-center gap-3">
            <ZoomOut size={16} className="text-gray-500" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[#003087]"
            />
            <ZoomIn size={16} className="text-gray-500" />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetAndCancel}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-3 py-1.5 rounded-lg bg-[#003087] text-white text-xs font-bold hover:bg-blue-900 disabled:opacity-50"
              disabled={!canSave}
            >
              {saving ? "Salvando..." : "Usar foto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
