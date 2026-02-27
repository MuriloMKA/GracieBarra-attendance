import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { COLORS, SIZES } from "../constants/theme";
import DigitalCard from "../components/DigitalCard";
import Button from "../components/Button";

const StudentProfileScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();

  // Mock de presenças confirmadas
  const [attendances] = useState([
    { id: 1, date: "2026-02-01", status: "confirmed" },
    { id: 2, date: "2026-02-03", status: "confirmed" },
    { id: 3, date: "2026-02-05", status: "confirmed" },
    { id: 4, date: "2026-02-08", status: "confirmed" },
    { id: 5, date: "2026-02-10", status: "confirmed" },
    { id: 6, date: "2026-02-12", status: "confirmed" },
    { id: 7, date: "2026-02-15", status: "confirmed" },
    { id: 8, date: "2026-02-17", status: "confirmed" },
    { id: 9, date: "2026-02-19", status: "confirmed" },
    { id: 10, date: "2026-02-22", status: "confirmed" },
    { id: 11, date: "2026-02-24", status: "confirmed" },
    { id: 12, date: "2026-02-26", status: "confirmed" },
  ]);

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair do aplicativo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: signOut, style: "destructive" },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Meu Perfil</Text>
      </View>

      {/* Cartão Digital */}
      <DigitalCard user={user} attendances={attendances} />

      {/* Informações do Aluno */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informações</Text>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Nome Completo</Text>
          <Text style={styles.infoValue}>{user?.name}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Data de Nascimento</Text>
          <Text style={styles.infoValue}>
            {user?.birthDate
              ? new Date(user.birthDate).toLocaleDateString("pt-BR")
              : "N/A"}
          </Text>
        </View>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Estatísticas</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{attendances.length}</Text>
            <Text style={styles.statLabel}>Aulas este mês</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.max(0, 40 - attendances.length)}
            </Text>
            <Text style={styles.statLabel}>Para graduação</Text>
          </View>
        </View>
      </View>

      {/* Botão de Logout */}
      <View style={styles.actions}>
        <Button title="Sair" onPress={handleLogout} variant="outline" />
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SIZES.lg,
    paddingTop: SIZES.xxl,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: "bold",
    color: COLORS.white,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    margin: SIZES.md,
    padding: SIZES.lg,
    borderRadius: SIZES.cardRadius,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  infoItem: {
    marginBottom: SIZES.md,
  },
  infoLabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  infoValue: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: "500",
  },
  statsSection: {
    backgroundColor: COLORS.white,
    margin: SIZES.md,
    marginTop: 0,
    padding: SIZES.lg,
    borderRadius: SIZES.cardRadius,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: "row",
    gap: SIZES.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
  },
  statValue: {
    fontSize: SIZES.h1,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  actions: {
    padding: SIZES.lg,
  },
  footer: {
    height: SIZES.lg,
  },
});

export default StudentProfileScreen;
