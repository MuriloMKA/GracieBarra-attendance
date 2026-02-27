// Cores da identidade visual Gracie Barra
export const COLORS = {
  // Cores principais GB
  primary: "#E31E24", // Vermelho GB
  primaryDark: "#B71C1C",
  white: "#FFFFFF",
  black: "#000000",

  // Cores de destaque
  accent: "#1E88E5", // Azul
  accentLight: "#42A5F5",

  // Cores dos cartões por graduação
  cardGBK: "#4CAF50", // Verde - Kids
  cardWhiteBelt: "#81D4FA", // Azul Claro - Faixa Branca (0-2 graus)
  cardBlueBelt: "#1976D2", // Azul Escuro - Branca (3-4) até Azul
  cardAdvanced: "#212121", // Preto - Azul até Preta

  // Cores de UI
  background: "#F5F5F5",
  surface: "#FFFFFF",
  text: "#212121",
  textSecondary: "#757575",
  border: "#E0E0E0",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",

  // Status
  pending: "#FFC107",
  confirmed: "#4CAF50",
};

export const GRADIENTS = {
  primary: [COLORS.primary, COLORS.primaryDark],
  card: [COLORS.white, "#F8F9FA"],
};

// Faixas e seus respectivos graus
export const BELTS = {
  GBK: { name: "GBK Kids", color: COLORS.cardGBK, maxDegrees: 4 },
  BRANCA: { name: "Branca", color: "#FFFFFF", maxDegrees: 4 },
  AZUL: { name: "Azul", color: "#1976D2", maxDegrees: 4 },
  ROXA: { name: "Roxa", color: "#7B1FA2", maxDegrees: 4 },
  MARROM: { name: "Marrom", color: "#5D4037", maxDegrees: 4 },
  PRETA: { name: "Preta", color: "#000000", maxDegrees: 10 },
};

// Função para determinar a cor do cartão baseado na faixa e graus
export const getCardColor = (belt, degrees, isKid = false) => {
  if (isKid && belt === "GBK") return COLORS.cardGBK;

  if (belt === "BRANCA") {
    return degrees <= 2 ? COLORS.cardWhiteBelt : COLORS.cardBlueBelt;
  }

  if (
    belt === "AZUL" ||
    belt === "ROXA" ||
    belt === "MARROM" ||
    belt === "PRETA"
  ) {
    return COLORS.cardAdvanced;
  }

  return COLORS.cardWhiteBelt;
};

export const FONTS = {
  regular: "System",
  medium: "System",
  bold: "System",
};

export const SIZES = {
  // Espaçamentos
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,

  // Font sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  caption: 14,
  small: 12,

  // Componentes
  buttonHeight: 48,
  inputHeight: 48,
  borderRadius: 8,
  cardRadius: 12,
};
