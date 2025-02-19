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
} from "react-native";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
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
        <TouchableOpacity style={[styles.actionButton, themeStyles.actionButton]} onPress={onEdit}>
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
  // Inicialmente, usamos o valor do sistema, mas o usuário pode trocar manualmente
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
    fetchExpenses();
  };

  return (
    <SafeAreaView style={[styles.container, themeStyles.container]}>
      <View style={[styles.header, themeStyles.header]}>
        <Text style={[styles.headerText, themeStyles.headerText]}>Expense Tracker</Text>
        {/* Botão para trocar o tema */}
        <TouchableOpacity onPress={() => setIsDark(!isDark)}>
          <Text style={{ color: themeStyles.headerText.color, fontSize: 14, marginLeft: 10 }}>
            Toggle Theme
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.totalSaved, themeStyles.totalSaved]}>
        Total Saved: R${totalSaved}
      </Text>
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
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Espaça o título e o botão
  },
  headerText: {
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
    paddingBottom: 80,
  },
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
  cardContent: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardAmount: {
    fontSize: 16,
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
    borderRadius: 4,
  },
  actionText: {
    fontSize: 14,
  },
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
  fabText: {
    fontSize: 30,
    fontWeight: "bold",
  },
});

export default HomeScreen;
