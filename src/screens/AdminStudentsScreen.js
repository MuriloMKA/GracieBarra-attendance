import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { COLORS, SIZES, BELTS } from "../constants/theme";
import Button from "../components/Button";

const AdminStudentsScreen = () => {
  // Mock de alunos
  const [students, setStudents] = useState([
    {
      id: 1,
      name: "João Silva",
      email: "joao@email.com",
      belt: "AZUL",
      degrees: 2,
      birthDate: "1995-05-15",
      lastGraduation: "2025-06-10",
      nextGraduation: "2026-06-10",
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@email.com",
      belt: "BRANCA",
      degrees: 1,
      birthDate: "1998-03-20",
      lastGraduation: "2025-11-05",
      nextGraduation: "2026-05-05",
    },
    {
      id: 3,
      name: "Pedro Costa",
      email: "pedro@email.com",
      belt: "ROXA",
      degrees: 3,
      birthDate: "1992-08-10",
      lastGraduation: "2024-09-15",
      nextGraduation: "2026-09-15",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBelt, setEditBelt] = useState("BRANCA");
  const [editDegrees, setEditDegrees] = useState(0);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setEditName(student.name);
    setEditEmail(student.email);
    setEditBelt(student.belt);
    setEditDegrees(student.degrees);
    setModalVisible(true);
  };

  const handleSaveStudent = () => {
    if (!editName || !editEmail) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios");
      return;
    }

    const updatedStudents = students.map((s) =>
      s.id === selectedStudent.id
        ? {
            ...s,
            name: editName,
            email: editEmail,
            belt: editBelt,
            degrees: editDegrees,
          }
        : s,
    );

    setStudents(updatedStudents);
    setModalVisible(false);
    Alert.alert("Sucesso", "Aluno atualizado com sucesso!");
  };

  const handlePromote = (student) => {
    const beltInfo = BELTS[student.belt];

    if (student.degrees < beltInfo.maxDegrees - 1) {
      // Adicionar grau
      const updatedStudents = students.map((s) =>
        s.id === student.id ? { ...s, degrees: s.degrees + 1 } : s,
      );
      setStudents(updatedStudents);
      Alert.alert("Promoção", `${student.name} recebeu um grau!`);
    } else {
      // Promover para próxima faixa
      Alert.alert(
        "Promover Faixa",
        `${student.name} está pronto para subir de faixa. Deseja promovê-lo?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Promover",
            onPress: () => {
              // Lógica para próxima faixa (simplificada)
              Alert.alert(
                "Sucesso",
                "Faixa atualizada! Configure manualmente.",
              );
            },
          },
        ],
      );
    }
  };

  const renderStudentCard = ({ item }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentEmail}>{item.email}</Text>
        <View style={styles.beltInfo}>
          <Text style={styles.beltText}>
            Faixa {BELTS[item.belt]?.name} - {item.degrees} graus
          </Text>
        </View>
      </View>

      <View style={styles.studentActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.iconButtonText}>✏️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, styles.promoteButton]}
          onPress={() => handlePromote(item)}
        >
          <Text style={styles.iconButtonText}>⬆️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciar Alunos</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      {/* Students List */}
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhum aluno encontrado</Text>
          </View>
        }
      />

      {/* Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Aluno</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={editName}
              onChangeText={setEditName}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
            />

            <Text style={styles.label}>Faixa</Text>
            <View style={styles.beltSelector}>
              {Object.keys(BELTS).map((beltKey) => (
                <TouchableOpacity
                  key={beltKey}
                  style={[
                    styles.beltOption,
                    editBelt === beltKey && styles.beltOptionSelected,
                  ]}
                  onPress={() => setEditBelt(beltKey)}
                >
                  <Text
                    style={[
                      styles.beltOptionText,
                      editBelt === beltKey && styles.beltOptionTextSelected,
                    ]}
                  >
                    {BELTS[beltKey].name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Graus</Text>
            <View style={styles.degreesSelector}>
              {[0, 1, 2, 3, 4].map((degree) => (
                <TouchableOpacity
                  key={degree}
                  style={[
                    styles.degreeOption,
                    editDegrees === degree && styles.degreeOptionSelected,
                  ]}
                  onPress={() => setEditDegrees(degree)}
                >
                  <Text
                    style={[
                      styles.degreeOptionText,
                      editDegrees === degree && styles.degreeOptionTextSelected,
                    ]}
                  >
                    {degree}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Salvar"
                onPress={handleSaveStudent}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: SIZES.h2,
    fontWeight: "bold",
    color: COLORS.white,
  },
  searchContainer: {
    padding: SIZES.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    height: SIZES.inputHeight,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.md,
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  listContent: {
    padding: SIZES.md,
  },
  studentCard: {
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
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: SIZES.h4,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  studentEmail: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  beltInfo: {
    marginTop: SIZES.xs,
  },
  beltText: {
    fontSize: SIZES.caption,
    color: COLORS.accent,
    fontWeight: "600",
  },
  studentActions: {
    flexDirection: "row",
    gap: SIZES.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  promoteButton: {
    backgroundColor: COLORS.success,
  },
  iconButtonText: {
    fontSize: 18,
  },
  emptyState: {
    padding: SIZES.xl,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: SIZES.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.cardRadius,
    padding: SIZES.lg,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.lg,
  },
  input: {
    height: SIZES.inputHeight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.md,
    fontSize: SIZES.body,
  },
  label: {
    fontSize: SIZES.caption,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SIZES.sm,
    marginTop: SIZES.sm,
  },
  beltSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  beltOption: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  beltOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  beltOptionText: {
    fontSize: SIZES.caption,
    color: COLORS.text,
  },
  beltOptionTextSelected: {
    color: COLORS.white,
  },
  degreesSelector: {
    flexDirection: "row",
    gap: SIZES.sm,
    marginBottom: SIZES.lg,
  },
  degreeOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  degreeOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  degreeOptionText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: "600",
  },
  degreeOptionTextSelected: {
    color: COLORS.white,
  },
  modalActions: {
    flexDirection: "row",
    gap: SIZES.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default AdminStudentsScreen;
