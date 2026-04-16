import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, QrCode } from "lucide-react";

interface StudentQRCodeProps {
  student: {
    id?: string;
    _id?: string;
    name: string;
    belt: string;
    program: string;
  };
  size?: "sm" | "md" | "lg";
}

export const StudentQRCode: React.FC<StudentQRCodeProps> = ({
  student,
  size = "md",
}) => {
  const qrSize = size === "sm" ? 150 : size === "md" ? 200 : 250;
  const studentId =
    student.id || student._id || student.name.replace(/\s+/g, "-");

  const qrData = JSON.stringify({
    studentId: studentId,
    name: student.name,
    belt: student.belt,
    program: student.program,
  });

  const handleDownload = () => {
    const qrCanvas = document.getElementById(
      `qr-code-${studentId}`,
    ) as HTMLCanvasElement | null;
    if (!qrCanvas) return;

    const exportCanvas = document.createElement("canvas");
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    exportCanvas.width = qrSize + 100;
    exportCanvas.height = qrSize + 150;

    // Fundo branco
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Titulo
    ctx.fillStyle = "#1F2937";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GRACIE BARRA MARAJOARA", exportCanvas.width / 2, 30);

    // Nome do aluno
    ctx.font = "bold 16px Arial";
    ctx.fillText(student.name, exportCanvas.width / 2, 55);

    // QR Code
    ctx.drawImage(qrCanvas, 50, 70, qrSize, qrSize);

    // Instrucoes
    ctx.fillStyle = "#6B7280";
    ctx.font = "12px Arial";
    ctx.fillText(
      "Apresente ao professor para confirmar presenca",
      exportCanvas.width / 2,
      qrSize + 95,
    );

    const downloadLink = document.createElement("a");
    downloadLink.download = `qrcode-${student.name.replace(/\s+/g, "-")}.png`;
    downloadLink.href = exportCanvas.toDataURL("image/png");
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-[#003087]/10 to-[#D10A11]/10 rounded-xl border-2 border-dashed border-[#003087]/30">
      <div className="flex items-center gap-2 mb-3">
        <QrCode size={20} className="text-[#003087]" />
        <h3 className="font-bold text-gray-900 text-sm">QR Code de Presença</h3>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-lg mb-3 flex flex-col items-center gap-3">
        <QRCodeCanvas
          id={`qr-code-${studentId}`}
          value={qrData}
          size={qrSize}
          level="H"
          includeMargin={true}
        />
        <div className="text-center">
          <p className="text-sm font-bold text-gray-900">{student.name}</p>
          <p className="text-xs text-gray-500">{student.belt}</p>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 bg-[#D10A11] hover:bg-red-700 text-white rounded-lg font-bold text-sm shadow-md transition-all"
      >
        <Download size={16} />
        Baixar QR Code para Impressão
      </button>

      <p className="text-xs text-gray-500 mt-2 text-center">
        Cole este QR Code na ficha física do aluno
      </p>
    </div>
  );
};
