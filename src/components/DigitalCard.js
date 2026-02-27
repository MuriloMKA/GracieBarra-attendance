import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SIZES, BELTS, getCardColor } from "../constants/theme";

const DigitalCard = ({ user, attendances = [] }) => {
  const { name, belt, degrees, lastGraduation, nextGraduation } = user;
  const cardColor = getCardColor(belt, degrees, belt === "GBK");
  const beltInfo = BELTS[belt] || BELTS.BRANCA;

  // Calcula o progresso (simula 40 aulas necessárias para graduação)
  const totalClassesForGraduation = 40;
  const currentClasses = attendances.filter(
    (a) => a.status === "confirmed",
  ).length;
  const progress = Math.min(
    (currentClasses / totalClassesForGraduation) * 100,
    100,
  );

  // Renderiza os pontos de presença (máximo 40)
  const renderAttendanceDots = () => {
    const dots = [];
    const maxDots = 40;

    for (let i = 0; i < maxDots; i++) {
      const isMarked = i < currentClasses;
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            isMarked ? styles.dotMarked : styles.dotEmpty,
            { backgroundColor: isMarked ? COLORS.black : "transparent" },
          ]}
        />,
      );
    }

    return dots;
  };

  // Renderiza os graus da faixa
  const renderBeltDegrees = () => {
    const degreeDots = [];
    for (let i = 0; i < beltInfo.maxDegrees; i++) {
      degreeDots.push(
        <View
          key={i}
          style={[styles.degreeDot, i < degrees && styles.degreeDotFilled]}
        />,
      );
    }
    return degreeDots;
  };

  const isLightCard = belt === "BRANCA" || belt === "GBK";

  return (
    <View style={styles.container}>
      {/* Frente do Cartão */}
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={[styles.gbText, !isLightCard && styles.textWhite]}>
            GRACIE BARRA
          </Text>
        </View>

        {/* Nome do Aluno */}
        <View style={styles.nameContainer}>
          <Text style={[styles.studentName, !isLightCard && styles.textWhite]}>
            {name.toUpperCase()}
          </Text>
        </View>

        {/* Faixa e Graus */}
        <View style={styles.beltContainer}>
          <View style={styles.beltInfo}>
            <Text style={[styles.beltLabel, !isLightCard && styles.textWhite]}>
              FAIXA
            </Text>
            <Text style={[styles.beltName, !isLightCard && styles.textWhite]}>
              {beltInfo.name.toUpperCase()}
            </Text>
          </View>
          <View style={styles.degreesContainer}>{renderBeltDegrees()}</View>
        </View>

        {/* Grid de Presença */}
        <View style={styles.attendanceGrid}>
          <Text
            style={[styles.attendanceTitle, !isLightCard && styles.textWhite]}
          >
            Presenças: {currentClasses}/{totalClassesForGraduation}
          </Text>
          <View style={styles.dotsContainer}>{renderAttendanceDots()}</View>
        </View>

        {/* Barra de Progresso */}
        <View style={styles.progressContainer}>
          <Text
            style={[styles.progressLabel, !isLightCard && styles.textWhite]}
          >
            Progresso para próxima graduação
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={[styles.progressText, !isLightCard && styles.textWhite]}>
            {progress.toFixed(0)}%
          </Text>
        </View>

        {/* Datas de Graduação */}
        <View style={styles.datesContainer}>
          <View style={styles.dateItem}>
            <Text style={[styles.dateLabel, !isLightCard && styles.textWhite]}>
              Última Graduação
            </Text>
            <Text style={[styles.dateValue, !isLightCard && styles.textWhite]}>
              {lastGraduation
                ? new Date(lastGraduation).toLocaleDateString("pt-BR")
                : "N/A"}
            </Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={[styles.dateLabel, !isLightCard && styles.textWhite]}>
              Próxima Estimativa
            </Text>
            <Text style={[styles.dateValue, !isLightCard && styles.textWhite]}>
              {nextGraduation
                ? new Date(nextGraduation).toLocaleDateString("pt-BR")
                : "N/A"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.md,
  },
  card: {
    borderRadius: SIZES.cardRadius,
    padding: SIZES.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: SIZES.md,
    paddingBottom: SIZES.md,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  gbText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: 2,
  },
  textWhite: {
    color: COLORS.white,
  },
  nameContainer: {
    marginBottom: SIZES.md,
  },
  studentName: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
  },
  beltContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.lg,
    paddingVertical: SIZES.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  beltInfo: {
    flex: 1,
  },
  beltLabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  beltName: {
    fontSize: SIZES.h4,
    fontWeight: "bold",
    color: COLORS.text,
  },
  degreesContainer: {
    flexDirection: "row",
    gap: 6,
  },
  degreeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  degreeDotFilled: {
    backgroundColor: COLORS.primary,
  },
  attendanceGrid: {
    marginBottom: SIZES.lg,
  },
  attendanceTitle: {
    fontSize: SIZES.caption,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  dotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
  },
  dotMarked: {
    backgroundColor: COLORS.black,
  },
  dotEmpty: {
    backgroundColor: "transparent",
  },
  progressContainer: {
    marginBottom: SIZES.md,
  },
  progressLabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: SIZES.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.success,
  },
  progressText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    textAlign: "right",
  },
  datesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  dateValue: {
    fontSize: SIZES.caption,
    fontWeight: "600",
    color: COLORS.text,
  },
});

export default DigitalCard;
