import React from "react";
import { parse, parseISO } from "date-fns";
import { BeltColor, Program } from "../context/DataContext";

interface BeltDisplayProps {
  belt: BeltColor;
  degrees: number;
  program?: Program;
  size?: "sm" | "md" | "lg";
}

export const BELT_COLORS: Record<BeltColor, string> = {
  White: "#FFFFFF",
  GreyWhite: "#9CA3AF", // grey base + white stripe
  Grey: "#9CA3AF",
  GreyBlack: "#9CA3AF", // grey base + black stripe
  YellowWhite: "#EAB308", // yellow base + white stripe
  Yellow: "#EAB308",
  YellowBlack: "#EAB308", // yellow base + black stripe
  OrangeWhite: "#F97316", // orange base + white stripe
  Orange: "#F97316",
  OrangeBlack: "#F97316", // orange base + black stripe
  GreenWhite: "#22C55E", // green base + white stripe
  Green: "#22C55E",
  GreenBlack: "#22C55E", // green base + black stripe
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

const getMaxDegreesForGBK = (belt: BeltColor): number => {
  if (belt === "White" || belt === "GreyWhite") return 5;
  return 11;
};

const isGBKBelt = (belt: BeltColor): boolean => {
  return (
    belt === "White" ||
    belt === "GreyWhite" ||
    belt === "Grey" ||
    belt === "GreyBlack" ||
    belt === "YellowWhite" ||
    belt === "Yellow" ||
    belt === "YellowBlack" ||
    belt === "OrangeWhite" ||
    belt === "Orange" ||
    belt === "OrangeBlack" ||
    belt === "GreenWhite" ||
    belt === "Green" ||
    belt === "GreenBlack"
  );
};

const getGBKDegreeStage = (belt: BeltColor, degrees: number) => {
  const maxTotalDegrees = getMaxDegreesForGBK(belt);
  const normalizedDegrees = Math.max(0, Math.min(degrees, maxTotalDegrees));

  if (normalizedDegrees <= 0) {
    return {
      degreeNumber: 0,
      colorName: "",
      colorHex: "transparent",
      maxSlots: belt === "White" || belt === "GreyWhite" ? 1 : 4,
      filledInStage: 0,
    };
  }

  if (normalizedDegrees <= 4) {
    return {
      degreeNumber: normalizedDegrees,
      colorName: "branco",
      colorHex: "#FFFFFF",
      maxSlots: 4,
      filledInStage: normalizedDegrees,
    };
  }

  if (belt === "White" || belt === "GreyWhite") {
    return {
      degreeNumber: 1,
      colorName: "vermelho",
      colorHex: "#D10A11",
      maxSlots: 1,
      filledInStage: 1,
    };
  }

  if (normalizedDegrees <= 8) {
    return {
      degreeNumber: normalizedDegrees - 4,
      colorName: "vermelho",
      colorHex: "#D10A11",
      maxSlots: 4,
      filledInStage: normalizedDegrees - 4,
    };
  }

  return {
    degreeNumber: normalizedDegrees - 8,
    colorName: "preto",
    colorHex: "#111827",
    maxSlots: 3,
    filledInStage: normalizedDegrees - 8,
  };
};

export function getDegreeDisplayLabel(
  program: Program,
  belt: BeltColor,
  degrees: number,
): string {
  if (degrees <= 0) return "";

  if (program.startsWith("GBK")) {
    const stage = getGBKDegreeStage(belt, degrees);
    return `${stage.degreeNumber}° grau${stage.degreeNumber > 1 ? "s" : ""} ${stage.colorName}`;
  }

  return `${degrees}° grau${degrees > 1 ? "s" : ""}`;
}

export function getNextDegreeDisplayLabel(
  program: Program,
  belt: BeltColor,
  currentDegrees: number,
): string {
  if (program.startsWith("GBK")) {
    const maxDegrees = getMaxDegreesForGBK(belt);
    if (currentDegrees >= maxDegrees) return "próxima faixa";
    const nextStage = getGBKDegreeStage(belt, currentDegrees + 1);
    return `${nextStage.degreeNumber}° grau ${nextStage.colorName}`;
  }

  if (belt === "Black" && currentDegrees >= 6) return "próxima faixa";
  if (belt !== "Black" && currentDegrees >= 4) return "próxima faixa";

  const nextDegree = currentDegrees + 1;
  return `${nextDegree}° grau${nextDegree > 1 ? "s" : ""}`;
}

// Função para calcular idade em anos
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const trimmed = birthDate.trim();
  const parsedIso = parseISO(trimmed);
  const parsedBrazilian = parse(trimmed, "dd/MM/yyyy", new Date());
  const birth = !Number.isNaN(parsedIso.getTime())
    ? parsedIso
    : !Number.isNaN(parsedBrazilian.getTime())
      ? parsedBrazilian
      : new Date(trimmed);

  if (Number.isNaN(birth.getTime())) {
    return 0;
  }

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
  birthDate?: string,
): Program {
  if (program === "GBKIDS" || program === "GBKJUVENIL") {
    return program;
  }

  if (program === "GBK") {
    if (birthDate) {
      const age = calculateAge(birthDate);
      return age !== null && age <= 7 ? "GBKIDS" : "GBKJUVENIL";
    }

    return "GBKJUVENIL";
  }

  // Adultos: sequência oficial
  // Faixa branca 1° e 2° grau = GB1
  if (belt === "White" && degrees <= 2) return "GB1";
  // Faixa branca 3° e 4° grau = GB2
  if (belt === "White" && degrees >= 3 && degrees <= 4) return "GB2";
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
  const actualProgram = calculateProgram(program, belt, degrees, birthDate);

  // GBK Kids: ficha azul clara
  if (actualProgram === "GBKIDS") {
    return {
      outerBg: "bg-gradient-to-r from-blue-300 to-blue-400",
      outerBorder: "border-blue-400",
      innerBg: "bg-blue-50",
      textPrimary: "text-white",
      textSecondary: "text-blue-100",
      gridHeaderBg: "bg-blue-400",
      label: "CARTÃO DE FREQUÊNCIA — GBK KIDS",
      programLabel: "GBK KIDS",
    };
  }

  if (actualProgram === "GBKJUVENIL") {
    return {
      outerBg: "bg-gradient-to-r from-green-300 to-green-400",
      outerBorder: "border-green-400",
      innerBg: "bg-green-50",
      textPrimary: "text-white",
      textSecondary: "text-green-100",
      gridHeaderBg: "bg-green-500",
      label: "CARTÃO DE FREQUÊNCIA — GBK JUVENIL",
      programLabel: "GBK JUVENIL",
    };
  }

  if (program === "GBK") {
    return {
      outerBg: "bg-gradient-to-r from-green-300 to-green-400",
      outerBorder: "border-green-400",
      innerBg: "bg-green-50",
      textPrimary: "text-white",
      textSecondary: "text-green-100",
      gridHeaderBg: "bg-green-500",
      label: "CARTÃO DE FREQUÊNCIA — GBK JUVENIL",
      programLabel: "GBK JUVENIL",
    };
  }

  // GB1 - FUNDAMENTAL: Faixa branca 0-2 graus
  if (belt === "White" && degrees <= 2) {
    return {
      outerBg: "bg-blue-600",
      outerBorder: "border-blue-800",
      innerBg: "bg-blue-50",
      textPrimary: "text-white",
      textSecondary: "text-blue-100",
      gridHeaderBg: "bg-blue-700",
      label: "CARTÃO DE FREQUÊNCIA — GB1",
      programLabel: "GB1",
    };
  }

  // GB2 - AVANÇADO: Faixa branca 3-4 graus
  if (belt === "White" && degrees >= 3 && degrees <= 4) {
    return {
      outerBg: "bg-purple-900",
      outerBorder: "border-purple-950",
      innerBg: "bg-purple-50",
      textPrimary: "text-white",
      textSecondary: "text-purple-200",
      gridHeaderBg: "bg-purple-800",
      label: "CARTÃO DE FREQUÊNCIA — GB2",
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

export const BeltDisplay: React.FC<BeltDisplayProps> = ({
  belt,
  degrees,
  program = "GB1",
  size = "md",
}) => {
  const beltColor = BELT_COLORS[belt];
  const isLight =
    belt === "White" ||
    belt === "Yellow" ||
    belt === "YellowWhite" ||
    belt === "YellowBlack" ||
    belt === "Grey" ||
    belt === "GreyWhite" ||
    belt === "GreyBlack";

  const heights = { sm: "h-5", md: "h-7", lg: "h-9" };
  const stripeWidths = { sm: "w-[10px]", md: "w-[14px]", lg: "w-[18px]" };
  const stripeHeights = { sm: "h-4", md: "h-5", lg: "h-6" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  // Determina quantos slots de grau mostrar e suas cores
  const isGBK = program.startsWith("GBK");
  const normalizedDegrees = Math.max(0, degrees);
  const visibleSlots = isGBK ? 4 : belt === "Black" ? 6 : 4;

  // GBK: sobreposição por etapa no mesmo slot.
  // 1-4 brancos, 5-8 vermelhos sobre os brancos, 9-11 pretos sobre os vermelhos.
  const getGBKSlotColor = (slotIndex: number) => {
    const blackFilled = Math.min(Math.max(normalizedDegrees - 8, 0), 3);
    if (slotIndex < blackFilled) return "#111827";

    const redFilled = Math.min(Math.max(normalizedDegrees - 4, 0), 4);
    if (slotIndex < redFilled) return "#D10A11";

    const whiteFilled = Math.min(normalizedDegrees, 4);
    if (slotIndex < whiteFilled) return "#FFFFFF";

    return "transparent";
  };

  const getAdultSlotColor = (slotIndex: number) => {
    if (slotIndex >= Math.min(normalizedDegrees, visibleSlots)) {
      return "transparent";
    }

    // Adulto: faixa branca mantém graus vermelhos para melhor contraste.
    // Da faixa azul em diante, os graus devem ser brancos.
    return belt === "White" ? "#D10A11" : "#FFFFFF";
  };

  // Dual-color belts: XWhite gets a white horizontal stripe, XBlack gets a black stripe
  const dualStripeColor: string | null = (() => {
    const map: Partial<Record<BeltColor, string>> = {
      GreyWhite: "#FFFFFF",
      YellowWhite: "#FFFFFF",
      OrangeWhite: "#FFFFFF",
      GreenWhite: "#FFFFFF",
      GreyBlack: "#111827",
      YellowBlack: "#111827",
      OrangeBlack: "#111827",
      GreenBlack: "#111827",
    };
    return map[belt] ?? null;
  })();

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex-1 ${heights[size]} rounded-sm flex items-center overflow-hidden border relative`}
        style={{
          backgroundColor: beltColor,
          borderColor: isLight ? "#9CA3AF" : beltColor,
          minWidth: size === "sm" ? 60 : size === "md" ? 80 : 100,
        }}
      >
        {/* Horizontal stripe for dual-color belts */}
        {dualStripeColor && (
          <div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none z-10"
            style={{
              height: size === "sm" ? 2 : size === "md" ? 3 : 4,
              backgroundColor: dualStripeColor,
              opacity: dualStripeColor === "#FFFFFF" ? 0.85 : 0.7,
            }}
          />
        )}
        {/* Stripe area on the right */}
        <div className="flex-1" />
        <div className="flex items-center gap-1 pr-1.5">
          {Array.from({ length: visibleSlots }).map((_, i) => {
            const stripeColor = isGBK
              ? getGBKSlotColor(i)
              : getAdultSlotColor(i);
            const slotBorderColor =
              belt === "GreyWhite" || belt === "Grey" || belt === "GreyBlack"
                ? "#6B7280"
                : isLight
                  ? "#9CA3AF"
                  : "rgba(255,255,255,0.35)";

            return (
              <div
                key={i}
                className={`${stripeWidths[size]} ${stripeHeights[size]} rounded-[4px] border`}
                style={{
                  backgroundColor:
                    stripeColor === "transparent" ? "transparent" : stripeColor,
                  borderColor: slotBorderColor,
                  boxSizing: "border-box",
                  boxShadow:
                    stripeColor === "#FFFFFF" &&
                    (belt === "White" || belt === "GreyWhite")
                      ? "0 0 0 1px rgba(255,255,255,0.45) inset"
                      : undefined,
                }}
              ></div>
            );
          })}
        </div>
      </div>
      <span className={`${textSizes[size]} font-medium text-gray-700`}>
        {BELT_NAMES_PT[belt]} {getDegreeDisplayLabel(program, belt, degrees)}
      </span>
    </div>
  );
};
