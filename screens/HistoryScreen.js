import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, SafeAreaView, useColorScheme } from "react-native";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { darkTheme, lightTheme } from "./themes/themes";

const HistoryScreen = () => {
  const systemTheme = useColorScheme();
  const themeStyles = systemTheme === "dark" ? darkTheme : lightTheme;
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    const logsRef = collection(db, "logs");
    const q = query(logsRef, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const logsList = [];
    querySnapshot.forEach((docSnap) => {
      logsList.push({ id: docSnap.id, ...docSnap.data() });
    });
    setLogs(logsList);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <SafeAreaView style={[styles.container, themeStyles.container]}>
      <Text style={[styles.header, themeStyles.historyHeaderText]}>(all time)</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.logItem, themeStyles.card]}>
            <Text style={[styles.logText, themeStyles.cardTitle]}>
              {item.operation.toUpperCase()} {item.description ? `- ${item.description}` : ""}
            </Text>
            {item.amount !== undefined && (
              <Text style={[styles.logText, themeStyles.cardAmount]}>
                Amount: R${item.amount}
              </Text>
            )}
            <Text style={[styles.logTimestamp, themeStyles.cardAmount]}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 16, marginTop: 16 },
  logItem: { padding: 12, borderRadius: 8, marginBottom: 10 },
  logText: { fontSize: 16 },
  logTimestamp: { fontSize: 12, color: "#888" },
});

export default HistoryScreen;
