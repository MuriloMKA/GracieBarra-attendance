import React, { useRef } from "react";
import { useData } from "../context/DataContext";
import { QRCodeCanvas } from "qrcode.react";
import { Printer } from "lucide-react";

export const PrintQRCodes: React.FC = () => {
  const { students } = useData();

  // Ordenar alunos em ordem alfabética para facilitar a organização
  const sortedStudents = [...students].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error("Erro ao imprimir:", e);
      alert(
        "O seu navegador não suporta a função de impressão direta. Por favor, pressione Ctrl + P (ou Cmd + P) no teclado para imprimir.",
      );
    }
  };

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-area, #print-area * {
              visibility: visible;
            }
            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: A4;
              margin: 1cm;
            }
          }
        `}
      </style>

      <div className="p-4 no-print flex flex-col items-center">
        <h1 className="text-2xl font-bold text-[#003087] mb-4">
          Impressão de QR Codes em Lote
        </h1>
        <p className="text-gray-600 mb-6 text-center max-w-lg">
          Esta página foi feita para imprimir etiquetas de QR Code de todos os
          alunos. Use o botão abaixo para gerar o formato A4 contendo apenas os
          dados do aluno e o código.
        </p>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-[#D10A11] text-white rounded-lg font-bold shadow hover:bg-red-700 transition"
        >
          <Printer size={20} />
          Imprimir Todos ({sortedStudents.length})
        </button>
        <p className="text-xs text-gray-400 mt-3">
          Se o botão não funcionar, pressione <strong>Ctrl + P</strong>{" "}
          (Windows) ou <strong>Cmd + P</strong> (Mac).
        </p>
      </div>

      {/* Área de impressão */}
      <div
        id="print-area"
        className="w-full bg-white print:bg-white text-black p-4"
      >
        <div className="grid grid-cols-4 gap-6 print:grid-cols-4 print:gap-4 justify-items-center">
          {sortedStudents.map((student) => {
            const studentId =
              student.id || student._id || student.name.replace(/\s+/g, "-");
            const qrData = JSON.stringify({
              studentId: studentId,
              name: student.name,
              program: student.program,
            });

            return (
              <div
                key={studentId}
                className="flex flex-col items-center p-3 border border-gray-300 rounded-lg w-full max-w-[160px] text-center"
                style={{ pageBreakInside: "avoid" }}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">
                  GRACIE BARRA
                </div>
                <QRCodeCanvas
                  value={qrData}
                  size={100}
                  level="H"
                  includeMargin={false}
                />
                <div className="mt-2 font-bold text-xs uppercase leading-tight line-clamp-2">
                  {student.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
