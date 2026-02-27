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

const AdminHomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  // Mock de check-ins pendentes
  const [pendingCheckins, setPendingCheckins] = useState([
    {
      id: 1,
      studentName: "João Silva",
      studentBelt: "AZUL",
      time: "20:00",
      className: "GB2 Avançado",
      date: new Date().toLocaleDateString("pt-BR"),
    },
    {
      id: 2,
      studentName: "Maria Santos",
      studentBelt: "BRANCA",
      time: "19:00",
      className: "GB1 Fundamental",
      date: new Date().toLocaleDateString("pt-BR"),
    },
    {
      id: 3,
      studentName: "Pedro Costa",
      studentBelt: "ROXA",
      time: "20:00",
      className: "GB2 Avançado",
      date: new Date().toLocaleDateString("pt-BR"),
    },
  ]);

  const [stats] = useState({
    totalStudents: 85,
    todayCheckins: 23,
    pendingCount: pendingCheckins.length,
  });

  const handleConfirmCheckin = (checkinId) => {
    Alert.alert("Confirmar Presença", "Deseja confirmar esta presença?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: () => {
          setPendingCheckins(pendingCheckins.filter((c) => c.id !== checkinId));
          Alert.alert("Sucesso", "Presença confirmada!");
        },
      },
    ]);
  };

  const handleRejectCheckin = (checkinId) => {
    Alert.alert("Rejeitar Presença", "Deseja rejeitar esta presença?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Rejeitar",
        style: "destructive",
        onPress: () => {
          setPendingCheckins(pendingCheckins.filter((c) => c.id !== checkinId));
          Alert.alert("Rejeitado", "Presença rejeitada!");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Painel Administrativo</Text>
        <Text style={styles.subtitle}>Olá, {user?.name?.split(" ")[0]}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalStudents}</Text>
            <Text style={styles.statLabel}>Total de Alunos</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.todayCheckins}</Text>
            <Text style={styles.statLabel}>Check-ins Hoje</Text>
          </View>

          <View style={[styles.statCard, styles.pendingCard]}>
            <Text style={[styles.statValue, styles.pendingValue]}>
              {stats.pendingCount}
            </Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("AdminStudents")}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>Gerenciar Alunos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              Alert.alert("Em breve", "Funcionalidade em desenvolvimento")
            }
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Relatórios</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Check-ins */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check-ins Pendentes</Text>

          {pendingCheckins.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                ✅ Nenhum check-in pendente no momento
              </Text>
            </View>
          ) : (
            pendingCheckins.map((checkin) => (
              <View key={checkin.id} style={styles.checkinCard}>
                <View style={styles.checkinInfo}>
                  <Text style={styles.studentName}>{checkin.studentName}</Text>
                  <View style={styles.checkinDetails}>
                    <Text style={styles.detailText}>
                      Faixa: {checkin.studentBelt}
                    </Text>
                    <Text style={styles.detailText}>•</Text>
                    <Text style={styles.detailText}>
                      {checkin.time} - {checkin.className}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>{checkin.date}</Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.confirmBtn]}
                    onPress={() => handleConfirmCheckin(checkin.id)}
                  >
                    <Text style={styles.actionBtnText}>✓</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleRejectCheckin(checkin.id)}
                  >
                    <Text style={styles.actionBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
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
  greeting: {
    fontSize: SIZES.h2,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.white,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    padding: SIZES.md,
    gap: SIZES.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.cardRadius,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pendingCard: {
    backgroundColor: COLORS.pending,
  },
  statValue: {
    fontSize: SIZES.h1,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  pendingValue: {
    color: COLORS.white,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    padding: SIZES.md,
    paddingTop: 0,
    gap: SIZES.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.accent,
    padding: SIZES.md,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: SIZES.xs,
  },
  actionText: {
    color: COLORS.white,
    fontSize: SIZES.caption,
    fontWeight: "600",
  },
  section: {
    padding: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  emptyState: {
    backgroundColor: COLORS.white,
    padding: SIZES.xl,
    borderRadius: SIZES.cardRadius,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  checkinCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.cardRadius,
    marginBottom: SIZES.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkinInfo: {
    flex: 1,
    marginRight: SIZES.md,
  },
  studentName: {
    fontSize: SIZES.h4,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  checkinDetails: {
    flexDirection: "row",
    gap: SIZES.xs,
    marginBottom: SIZES.xs,
  },
  detailText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
  dateText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: "row",
    gap: SIZES.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBtn: {
    backgroundColor: COLORS.success,
  },
  rejectBtn: {
    backgroundColor: COLORS.error,
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default AdminHomeScreen;
