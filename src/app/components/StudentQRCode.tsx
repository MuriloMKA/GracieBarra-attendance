import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, QrCode } from "lucide-react";
import { Student } from "../context/DataContext";

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
  const studentId = (student.id || student._id) as string;

  const qrData = JSON.stringify({
    studentId: studentId,
    name: student.name,
    belt: student.belt,
    program: student.program,
  });

  const handleDownload = () => {
    const svg = document.getElementById(`qr-code-${studentId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = qrSize + 100;
    canvas.height = qrSize + 150;

    img.onload = () => {
      // Fundo branco
      ctx!.fillStyle = "#FFFFFF";
      ctx!.fillRect(0, 0, canvas.width, canvas.height);

      // Título
      ctx!.fillStyle = "#1F2937";
      ctx!.font = "bold 18px Arial";
      ctx!.textAlign = "center";
      ctx!.fillText("GRACIE BARRA MARAJOARA", canvas.width / 2, 30);

      // Nome do aluno
      ctx!.font = "bold 16px Arial";
      ctx!.fillText(student.name, canvas.width / 2, 55);

      // QR Code
      ctx!.drawImage(img, 50, 70, qrSize, qrSize);

      // Instruções
      ctx!.fillStyle = "#6B7280";
      ctx!.font = "12px Arial";
      ctx!.fillText(
        "Apresente ao professor para confirmar presença",
        canvas.width / 2,
        qrSize + 95,
      );

      // Download
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qrcode-${student.name.replace(/\s+/g, "-")}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-[#003087]/10 to-[#D10A11]/10 rounded-xl border-2 border-dashed border-[#003087]/30">
      <div className="flex items-center gap-2 mb-3">
        <QrCode size={20} className="text-[#003087]" />
        <h3 className="font-bold text-gray-900 text-sm">QR Code de Presença</h3>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-lg mb-3">
        <QRCodeSVG
          id={`qr-code-${studentId}`}
          value={qrData}
          size={qrSize}
          level="H"
          includeMargin={true}
        />
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
