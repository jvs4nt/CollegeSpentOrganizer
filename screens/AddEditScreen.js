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
      await updateDoc(doc(db, "expenses", expense.id), {
        description,
        amount: parseFloat(amount),
      });
    } else {
      try {
        await addDoc(collection(db, "expenses"), {
          description,
          amount: parseFloat(amount),
        });
      } catch (error) {
        console.error("Error adding document: ", error);
      }
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
        <TextInput
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={saveExpense}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
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
  form: {
    padding: 16,
  },
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
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AddEditScreen;
