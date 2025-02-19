import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, StyleSheet } from "react-native";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";

const HomeScreen = ({ navigation }) => {
  const [expenses, setExpenses] = useState([]);
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const querySnapshot = await getDocs(collection(db, "expenses"));
    const expensesList = [];
    let total = 0;
    querySnapshot.forEach((doc) => {
      expensesList.push({ id: doc.id, ...doc.data() });
      total += doc.data().amount;
    });
    setExpenses(expensesList);
    setTotalSaved(total);
  };

  const deleteExpense = async (id) => {
    await deleteDoc(doc(db, "expenses", id));
    fetchExpenses();
  };

  return (
    <View style={styles.container}>
      <Text>Total Saved: R${totalSaved}</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.description}: R${item.amount}</Text>
            <Button
              title="Edit"
              onPress={() => navigation.navigate("AddEdit", { expense: item })}
            />
            <Button title="Delete" onPress={() => deleteExpense(item.id)} />;
          </View>
        )}
      />
      <Button
        title="Add Expense"
        onPress={() => navigation.navigate("AddEdit")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
});

export default HomeScreen;