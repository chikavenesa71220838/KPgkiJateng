import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Stack } from "expo-router";
import { API_URL } from "@/utils/api";

export default function SejarahGereja(): React.ReactElement {
  const navigation = useNavigation();
  const [sejarah, setSejarah] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSejarah() {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query {
                gerejas {
                  id
                  sejarah
                }
              }
            `,
          }),
        });

        const json = await res.json();
        if (json.errors) throw new Error(json.errors[0].message);
        const data = json.data.gerejas?.[0];
        setSejarah(data?.sejarah || "Sejarah gereja belum tersedia.");
      } catch (err: any) {
        setError(err.message || "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    }

    fetchSejarah();
  }, []);

  const paragrafArray =
    sejarah?.split("\n").filter((p) => p.trim() !== "") || [];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color="#207163" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sejarah Gereja</Text>
        </View>

        <ScrollView style={styles.scrollContainer}>
          {loading ? (
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <ActivityIndicator size="large" color="#207163" />
              <Text style={{ color: "#207163", marginTop: 8 }}>
                Memuat sejarah gereja...
              </Text>
            </View>
          ) : error ? (
            <Text style={{ color: "red", textAlign: "center", marginTop: 20 }}>
              {error}
            </Text>
          ) : (
            paragrafArray.map((paragraf, index) => (
              <Text key={index} style={styles.paragraph}>
                {paragraf}
              </Text>
            ))
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#207163",
  },
  paragraph: {
    fontSize: 15,
    color: "#333",
    lineHeight: 24,
    textAlign: "justify",
    marginBottom: 12,
  },
});
