import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Animated,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  Switch,
} from "react-native";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { darkTheme, lightTheme } from "./themes/themes";

// Componente para renderizar cada despesa como um "card" animado
const ExpenseCard = ({ item, onEdit, onDelete, themeStyles }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleDelete = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
    });
  };

  return (
    <Animated.View style={[styles.card, themeStyles.card, { opacity: fadeAnim }]}>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, themeStyles.cardTitle]}>{item.description}</Text>
        <Text style={[styles.cardAmount, themeStyles.cardAmount]}>R${item.amount}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, themeStyles.actionButton]}
          onPress={onEdit}
        >
          <Text style={[styles.actionText, themeStyles.actionText]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#b00020" }]}
          onPress={handleDelete}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const HomeScreen = ({ navigation }) => {
  // Inicialmente, usamos o tema do sistema, mas o usuário pode trocar manualmente
  const systemTheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemTheme === "dark");
  const themeStyles = isDark ? darkTheme : lightTheme;

  const [expenses, setExpenses] = useState([]);
  const [totalSaved, setTotalSaved] = useState(0);

  const fetchExpenses = async () => {
    const querySnapshot = await getDocs(collection(db, "expenses"));
    const expensesList = [];
    let total = 0;
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      expensesList.push({ id: docSnap.id, ...data });
      total += data.amount;
    });
    setExpenses(expensesList);
    setTotalSaved(total);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchExpenses();
    }, [])
  );

  const deleteExpense = async (id) => {
    await deleteDoc(doc(db, "expenses", id));
    // Registra a operação de exclusão no log
    await addDoc(collection(db, "logs"), {
      operation: "delete",
      expenseId: id,
      timestamp: new Date().toISOString(),
    });
    fetchExpenses();
  };

  return (
    <SafeAreaView style={[styles.container, themeStyles.container]}>
      <View style={[styles.header, themeStyles.header]}>
        <Text style={[styles.headerText, themeStyles.headerText]}>
          Expense Tracker
        </Text>
        <Switch
          value={isDark}
          onValueChange={() => setIsDark(!isDark)}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isDark ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>
      {/* Área de resumo: Total Saved e botão History */}
      <View style={styles.summaryContainer}>
        <Text style={[styles.totalSaved, themeStyles.totalSaved]}>
          Total Saved: R${totalSaved}
        </Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate("History")}
        >
          <Text style={[styles.historyText, themeStyles.headerText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ExpenseCard
            item={item}
            onEdit={() => navigation.navigate("AddEdit", { expense: item })}
            onDelete={() => deleteExpense(item.id)}
            themeStyles={themeStyles}
          />
        )}
      />
      <TouchableOpacity
        style={[styles.fab, themeStyles.fab]}
        onPress={() => navigation.navigate("AddEdit")}
      >
        <Text style={[styles.fabText, themeStyles.fabText]}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: { fontSize: 24, fontWeight: "bold" },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 15,
  },
  totalSaved: { fontSize: 20 },
  historyButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  historyText: { color: "#fff", fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: { marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardAmount: { fontSize: 16, marginTop: 4 },
  cardActions: { flexDirection: "row", justifyContent: "flex-end" },
  actionButton: {
    marginLeft: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  actionText: { fontSize: 14, color: "white" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 50,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  fabText: { fontSize: 30, fontWeight: "bold" },
});

export default HomeScreen;
