import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";

// Componente para renderizar cada despesa como um "card"
const ExpenseCard = ({ item, onEdit, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.description}</Text>
      <Text style={styles.cardAmount}>R${item.amount}</Text>
    </View>
    <View style={styles.cardActions}>
      <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
        <Text style={styles.actionText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: "#b00020" }]}
        onPress={onDelete}
      >
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const HomeScreen = ({ navigation }) => {
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
    fetchExpenses();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Expense Tracker</Text>
      </View>
      <Text style={styles.totalSaved}>Total Saved: R${totalSaved}</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ExpenseCard
            item={item}
            onEdit={() => navigation.navigate("AddEdit", { expense: item })}
            onDelete={() => deleteExpense(item.id)}
          />
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddEdit")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  header: {
    backgroundColor: "#6200ee",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  headerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  totalSaved: {
    fontSize: 20,
    textAlign: "center",
    marginVertical: 15,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 80, // para que o botão flutuante não cubra o último item
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardAmount: {
    fontSize: 16,
    color: "#555",
    marginTop: 4,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    marginLeft: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#6200ee",
    borderRadius: 4,
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#6200ee",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  fabText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
});

export default HomeScreen;
