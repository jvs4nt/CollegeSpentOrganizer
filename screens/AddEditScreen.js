import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

const AddEditScreen = ({ route, navigation }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const expense = route.params?.expense;

  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
    }
  }, [expense]);

  const saveExpense = async () => {
    if (expense) {
      // Update existing expense
      await updateDoc(doc(db, "expenses", expense.id), {
        description,
        amount: parseFloat(amount),
      });
    } else {
      // Add new expense
      await addDoc(collection(db, "expenses"), {
        description,
        amount: parseFloat(amount),
      });
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Save" onPress={saveExpense} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { marginBottom: 10, padding: 8, borderWidth: 1, borderColor: "#ccc" },
});

export default AddEditScreen;