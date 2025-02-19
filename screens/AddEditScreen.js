import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { TextInputMask } from "react-native-masked-text";

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
    const rawValue = amount.replace(/[^0-9,]/g, "").replace(",", ".");
    const parsedAmount = parseFloat(rawValue) || 0;
    const timestamp = new Date().toISOString();

    if (expense) {
      await updateDoc(doc(db, "expenses", expense.id), {
        description,
        amount: parsedAmount,
      });
      await addDoc(collection(db, "logs"), {
        operation: "update",
        expenseId: expense.id,
        description,
        amount: parsedAmount,
        timestamp,
      });
    } else {
      const docRef = await addDoc(collection(db, "expenses"), {
        description,
        amount: parsedAmount,
      });
      await addDoc(collection(db, "logs"), {
        operation: "add",
        expenseId: docRef.id,
        description,
        amount: parsedAmount,
        timestamp,
      });
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {expense ? "Edit Expense" : "Add Expense"}
        </Text>
      </View>
      <View style={styles.form}>
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
        />
        <TextInputMask
          type={"money"}
          options={{
            precision: 2,
            separator: ",",
            delimiter: ".",
            unit: "R$ ",
            suffixUnit: "",
          }}
          placeholder="Amount"
          value={amount}
          onChangeText={(maskedValue, rawValue) => setAmount(maskedValue)}
          style={styles.input}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={saveExpense}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  header: { backgroundColor: "#6200ee", paddingVertical: 20, paddingHorizontal: 16 },
  headerText: { color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center" },
  form: { padding: 16 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#6200ee",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default AddEditScreen;
