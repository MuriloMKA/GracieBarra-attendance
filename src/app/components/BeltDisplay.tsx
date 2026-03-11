import React from "react";
import { BeltColor, Program } from "../context/DataContext";

interface BeltDisplayProps {
  belt: BeltColor;
  degrees: number;
  program?: Program;
  size?: "sm" | "md" | "lg";
}

export const BELT_COLORS: Record<BeltColor, string> = {
  White: "#FFFFFF",
  GreyWhite: "#D1D5DB",
  Grey: "#9CA3AF",
  GreyBlack: "#6B7280",
  YellowWhite: "#FEF3C7",
  Yellow: "#EAB308",
  YellowBlack: "#CA8A04",
  OrangeWhite: "#FED7AA",
  Orange: "#F97316",
  OrangeBlack: "#EA580C",
  GreenWhite: "#BBF7D0",
  Green: "#22C55E",
  GreenBlack: "#15803D",
  Blue: "#2563EB",
  Purple: "#9333EA",
  Brown: "#92400E",
  Black: "#111827",
};

export const BELT_NAMES_PT: Record<BeltColor, string> = {
  White: "Faixa Branca",
  GreyWhite: "Faixa Cinza e Branca",
  Grey: "Faixa Cinza",
  GreyBlack: "Faixa Cinza e Preta",
  YellowWhite: "Faixa Amarela e Branca",
  Yellow: "Faixa Amarela",
  YellowBlack: "Faixa Amarela e Preta",
  OrangeWhite: "Faixa Laranja e Branca",
  Orange: "Faixa Laranja",
  OrangeBlack: "Faixa Laranja e Preta",
  GreenWhite: "Faixa Verde e Branca",
  Green: "Faixa Verde",
  GreenBlack: "Faixa Verde e Preta",
  Blue: "Faixa Azul",
  Purple: "Faixa Roxa",
  Brown: "Faixa Marrom",
  Black: "Faixa Preta",
};

// Função para calcular idade em anos
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Função para calcular o programa correto baseado na faixa e grau
export function calculateProgram(
  program: Program,
  belt: BeltColor,
  degrees: number,
): Program {
  // Se for GBK (crianças/adolescentes), mantém GBK
  if (program === "GBK") return "GBK";

  // Adultos: calcula baseado na faixa e grau
  if (belt === "White" && degrees <= 3) return "GB1";
  if (belt === "White" && degrees === 4) return "GB2";
  // Faixa azul em diante = GB3
  if (
    belt === "Blue" ||
    belt === "Purple" ||
    belt === "Brown" ||
    belt === "Black"
  )
    return "GB3";

  // Faixas cinza, amarela, laranja, verde são do GBK
  if (
    belt === "Grey" ||
    belt === "Yellow" ||
    belt === "Orange" ||
    belt === "Green"
  )
    return "GBK";

  // Fallback
  return program;
}

export function getCardStyle(
  program: Program,
  belt: BeltColor,
  degrees: number,
  birthDate?: string,
) {
  // GBK para crianças e adolescentes (até 15 anos)
  if (program === "GBK") {
    // Calcular idade se birthDate estiver disponível
    const age = birthDate ? calculateAge(birthDate) : null;

    // Mini Campeões: 2 a 7 anos (ficha azul clara)
    if (age !== null && age >= 2 && age <= 7) {
      return {
        outerBg: "bg-gradient-to-r from-blue-300 to-blue-400",
        outerBorder: "border-blue-400",
        innerBg: "bg-blue-50",
        textPrimary: "text-white",
        textSecondary: "text-blue-100",
        gridHeaderBg: "bg-blue-400",
        label: "CARTÃO DE FREQUÊNCIA — MINI CAMPEÕES",
        programLabel: "GBK",
      };
    }

    // Juvenil: 8 a 15 anos (ficha verde clara)
    if (age !== null && age >= 8 && age <= 15) {
      return {
        outerBg: "bg-gradient-to-r from-green-300 to-green-400",
        outerBorder: "border-green-400",
        innerBg: "bg-green-50",
        textPrimary: "text-white",
        textSecondary: "text-green-100",
        gridHeaderBg: "bg-green-500",
        label: "CARTÃO DE FREQUÊNCIA — JUVENIL",
        programLabel: "GBK",
      };
    }

    // Fallback para GBK sem idade definida (usa verde por padrão)
    return {
      outerBg: "bg-gradient-to-r from-green-300 to-green-400",
      outerBorder: "border-green-400",
      innerBg: "bg-green-50",
      textPrimary: "text-white",
      textSecondary: "text-green-100",
      gridHeaderBg: "bg-green-500",
      label: "CARTÃO DE FREQUÊNCIA — JUVENIL",
      programLabel: "GBK",
    };
  }

  // GB1 - FUNDAMENTAL: Faixa branca 0-3 graus
  if (belt === "White" && degrees <= 3) {
    return {
      outerBg: "bg-blue-600",
      outerBorder: "border-blue-800",
      innerBg: "bg-blue-50",
      textPrimary: "text-white",
      textSecondary: "text-blue-100",
      gridHeaderBg: "bg-blue-700",
      label: "CARTÃO DE FREQUÊNCIA — FUNDAMENTAL",
      programLabel: "GB1",
    };
  }

  // GB2 - AVANÇADO: Faixa branca 4 graus
  if (belt === "White" && degrees === 4) {
    return {
      outerBg: "bg-purple-900",
      outerBorder: "border-purple-950",
      innerBg: "bg-purple-50",
      textPrimary: "text-white",
      textSecondary: "text-purple-200",
      gridHeaderBg: "bg-purple-800",
      label: "CARTÃO DE FREQUÊNCIA — AVANÇADO",
      programLabel: "GB2",
    };
  }

  // GB3: Faixa azul em diante (cartão preto)
  return {
    outerBg: "bg-gray-900",
    outerBorder: "border-gray-950",
    innerBg: "bg-gray-50",
    textPrimary: "text-white",
    textSecondary: "text-gray-300",
    gridHeaderBg: "bg-gray-800",
    label: "CARTÃO DE FREQUÊNCIA — GB3",
    programLabel: "GB3",
  };
}

// Retorna o nome da cor do grau para faixas GBK
const getGBKDegreeColorName = (
  belt: BeltColor,
  degreeIndex: number,
): string => {
  // White e GreyWhite: 4 brancos + 1 vermelho
  if (belt === "White" || belt === "GreyWhite") {
    if (degreeIndex < 4) return "branco";
    return "vermelho";
  }

  // Grey e GreyBlack: 4 brancos + 4 vermelhos + 3 amarelos
  if (belt === "Grey" || belt === "GreyBlack") {
    if (degreeIndex < 4) return "branco";
    if (degreeIndex < 8) return "vermelho";
    return "amarelo";
  }

  // YellowWhite, Yellow, YellowBlack: 4 brancos + 4 vermelhos + 3 laranja
  if (belt === "YellowWhite" || belt === "Yellow" || belt === "YellowBlack") {
    if (degreeIndex < 4) return "branco";
    if (degreeIndex < 8) return "vermelho";
    return "laranja";
  }

  // OrangeWhite, Orange, OrangeBlack: 4 brancos + 4 vermelhos + 3 verde
  if (belt === "OrangeWhite" || belt === "Orange" || belt === "OrangeBlack") {
    if (degreeIndex < 4) return "branco";
    if (degreeIndex < 8) return "vermelho";
    return "verde";
  }

  // GreenWhite, Green, GreenBlack: 4 brancos + 4 vermelhos + 3 azul
  if (belt === "GreenWhite" || belt === "Green" || belt === "GreenBlack") {
    if (degreeIndex < 4) return "branco";
    if (degreeIndex < 8) return "vermelho";
    return "azul";
  }

  return "";
};

// Retorna as cores dos graus para cada faixa GBK
const getGBKDegreeColors = (
  belt: BeltColor,
  totalDegrees: number,
): string[] => {
  const colors: string[] = [];

  // White e GreyWhite: 4 brancos + 1 vermelho
  if (belt === "White" || belt === "GreyWhite") {
    for (let i = 0; i < totalDegrees; i++) {
      if (i < 4)
        colors.push("#FFFFFF"); // Branco
      else colors.push("#D10A11"); // Vermelho
    }
    return colors;
  }

  // Grey e GreyBlack: 4 brancos + 4 vermelhos + 3 amarelos
  if (belt === "Grey" || belt === "GreyBlack") {
    for (let i = 0; i < totalDegrees; i++) {
      if (i < 4)
        colors.push("#FFFFFF"); // Branco
      else if (i < 8)
        colors.push("#D10A11"); // Vermelho
      else colors.push("#EAB308"); // Amarelo
    }
    return colors;
  }

  // YellowWhite, Yellow, YellowBlack: 4 brancos + 4 vermelhos + 3 laranja
  if (belt === "YellowWhite" || belt === "Yellow" || belt === "YellowBlack") {
    for (let i = 0; i < totalDegrees; i++) {
      if (i < 4)
        colors.push("#FFFFFF"); // Branco
      else if (i < 8)
        colors.push("#D10A11"); // Vermelho
      else colors.push("#F97316"); // Laranja
    }
    return colors;
  }

  // OrangeWhite, Orange, OrangeBlack: 4 brancos + 4 vermelhos + 3 verde
  if (belt === "OrangeWhite" || belt === "Orange" || belt === "OrangeBlack") {
    for (let i = 0; i < totalDegrees; i++) {
      if (i < 4)
        colors.push("#FFFFFF"); // Branco
      else if (i < 8)
        colors.push("#D10A11"); // Vermelho
      else colors.push("#22C55E"); // Verde
    }
    return colors;
  }

  // GreenWhite, Green, GreenBlack: 4 brancos + 4 vermelhos + 3 azul
  if (belt === "GreenWhite" || belt === "Green" || belt === "GreenBlack") {
    for (let i = 0; i < totalDegrees; i++) {
      if (i < 4)
        colors.push("#FFFFFF"); // Branco
      else if (i < 8)
        colors.push("#D10A11"); // Vermelho
      else colors.push("#2563EB"); // Azul
    }
    return colors;
  }

  return colors;
};

export const BeltDisplay: React.FC<BeltDisplayProps> = ({
  belt,
  degrees,
  program = "GB1",
  size = "md",
}) => {
  const beltColor = BELT_COLORS[belt];
  const isLight = belt === "White" || belt === "Yellow" || belt === "Grey";

  const heights = { sm: "h-4", md: "h-6", lg: "h-8" };
  const stripeWidths = { sm: "w-2", md: "w-3", lg: "w-4" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  // Determina quantos slots de grau mostrar e suas cores
  const isGBK = program === "GBK";
  const maxDegrees = isGBK
    ? belt === "White" || belt === "GreyWhite"
      ? 5
      : 11
    : belt === "Black"
      ? 6
      : 4;

  const degreeColors = isGBK ? getGBKDegreeColors(belt, maxDegrees) : [];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex-1 ${heights[size]} rounded-sm flex items-center overflow-hidden border`}
        style={{
          backgroundColor: beltColor,
          borderColor: isLight ? "#9CA3AF" : beltColor,
          minWidth: size === "sm" ? 60 : size === "md" ? 80 : 100,
        }}
      >
        {/* Stripe area on the right */}
        <div className="flex-1" />
        <div className="flex gap-px pr-1">
          {Array.from({ length: maxDegrees }).map((_, i) => {
            const filled = i < degrees;
            const stripeColor =
              isGBK && filled
                ? degreeColors[i]
                : filled
                  ? "#D10A11"
                  : "transparent";
            const needsBorder = !filled || (isGBK && stripeColor === "#FFFFFF");

            return (
              <div
                key={i}
                className={`${stripeWidths[size]} h-full rounded-sm`}
                style={{
                  backgroundColor: stripeColor,
                  border: needsBorder
                    ? `1px solid ${isLight ? "#9CA3AF" : "rgba(255,255,255,0.3)"}`
                    : "none",
                }}
              />
            );
          })}
        </div>
      </div>
      <span className={`${textSizes[size]} font-medium text-gray-700`}>
        {BELT_NAMES_PT[belt]}{" "}
        {degrees > 0 ? (
          isGBK ? (
            <>
              {degrees}° grau{degrees > 1 ? "s" : ""}{" "}
              {getGBKDegreeColorName(belt, degrees - 1)}
            </>
          ) : (
            `${degrees}° grau${degrees > 1 ? "s" : ""}`
          )
        ) : (
          ""
        )}
      </span>
    </div>
  );
};
