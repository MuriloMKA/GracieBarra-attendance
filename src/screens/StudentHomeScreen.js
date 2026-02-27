import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { COLORS, SIZES } from "../constants/theme";
import Button from "../components/Button";

const StudentHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState(null);
  const [todayCheckins, setTodayCheckins] = useState([]);

  // Horários disponíveis
  const availableClasses = [
    { id: 1, time: "06:00", name: "GB1 Fundamental" },
    { id: 2, time: "07:00", name: "GB2 Avançado" },
    { id: 3, time: "12:00", name: "GB Kids" },
    { id: 4, time: "18:00", name: "GB1 Fundamental" },
    { id: 5, time: "19:00", name: "GB2 Avançado" },
    { id: 6, time: "20:00", name: "GB All Levels" },
    { id: 7, time: "21:00", name: "Treino Livre" },
  ];

  const handleCheckIn = (classItem) => {
    Alert.alert(
      "Confirmar Check-in",
      `Deseja fazer check-in na aula de ${classItem.time} - ${classItem.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => {
            // Aqui você faria a chamada à API
            const newCheckin = {
              id: Date.now(),
              classId: classItem.id,
              time: classItem.time,
              name: classItem.name,
              date: new Date().toLocaleDateString("pt-BR"),
              status: "pending",
            };
            setTodayCheckins([...todayCheckins, newCheckin]);
            Alert.alert(
              "Sucesso!",
              "Check-in realizado! Aguardando confirmação do administrador.",
            );
          },
        },
      ],
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return COLORS.success;
      case "pending":
        return COLORS.pending;
      case "rejected":
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmado";
      case "pending":
        return "Pendente";
      case "rejected":
        return "Rejeitado";
      default:
        return "Desconhecido";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Olá, {user?.name?.split(" ")[0]}! 🥋
          </Text>
          <Text style={styles.subtitle}>Pronto para treinar hoje?</Text>
        </View>

        {/* My Card Button */}
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate("StudentProfile")}
        >
          <Text style={styles.cardButtonText}>📋 Ver Meu Cartão Digital</Text>
        </TouchableOpacity>

        {/* Check-ins de Hoje */}
        {todayCheckins.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meus Check-ins de Hoje</Text>
            {todayCheckins.map((checkin) => (
              <View key={checkin.id} style={styles.checkinItem}>
                <View style={styles.checkinInfo}>
                  <Text style={styles.checkinTime}>{checkin.time}</Text>
                  <Text style={styles.checkinName}>{checkin.name}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(checkin.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(checkin.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Horários Disponíveis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aulas Disponíveis Hoje</Text>
          <Text style={styles.sectionSubtitle}>
            Selecione uma aula para fazer check-in
          </Text>

          {availableClasses.map((classItem) => (
            <TouchableOpacity
              key={classItem.id}
              style={styles.classCard}
              onPress={() => handleCheckIn(classItem)}
            >
              <View style={styles.classTime}>
                <Text style={styles.classTimeText}>{classItem.time}</Text>
              </View>
              <View style={styles.classInfo}>
                <Text style={styles.className}>{classItem.name}</Text>
                <Text style={styles.classAction}>Toque para check-in →</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  scrollView: {
    flex: 1,
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
  cardButton: {
    margin: SIZES.lg,
    backgroundColor: COLORS.accent,
    padding: SIZES.md,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
  },
  cardButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: "600",
  },
  section: {
    padding: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  sectionSubtitle: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
  },
  checkinItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkinInfo: {
    flex: 1,
  },
  checkinTime: {
    fontSize: SIZES.h4,
    fontWeight: "bold",
    color: COLORS.text,
  },
  checkinName: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
  statusBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.borderRadius,
  },
  statusText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: "600",
  },
  classCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  classTime: {
    backgroundColor: COLORS.primary,
    padding: SIZES.md,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  classTimeText: {
    color: COLORS.white,
    fontSize: SIZES.h4,
    fontWeight: "bold",
  },
  classInfo: {
    flex: 1,
    padding: SIZES.md,
    justifyContent: "center",
  },
  className: {
    fontSize: SIZES.body,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  classAction: {
    fontSize: SIZES.caption,
    color: COLORS.accent,
  },
});

export default StudentHomeScreen;
