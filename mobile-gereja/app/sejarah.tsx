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
import { fetchGerejaAPI } from "@/services/profileAPI";
import { Colors, FontSize, Layout } from "../constants/theme";

export default function SejarahGereja(): React.ReactElement {
  const navigation = useNavigation();
  const [sejarah, setSejarah] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSejarah() {
      try {
        const data = await fetchGerejaAPI();
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
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sejarah Gereja</Text>
        </View>

        <ScrollView style={styles.scrollContainer}>
          {loading ? (
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={{ color: Colors.primary, marginTop: 8 }}>
                Memuat sejarah gereja...
              </Text>
            </View>
          ) : error ? (
            <Text
              style={{
                color: Colors.danger, 
                textAlign: "center",
                marginTop: 20,
              }}
            >
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
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    paddingHorizontal: Layout.padding,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.padding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: FontSize.h2,
    fontWeight: "bold",
    color: Colors.primary,
  },
  paragraph: {
    fontSize: FontSize.body,
    color: Colors.text,
    lineHeight: 24,
    textAlign: "justify",
    marginBottom: 12,
  },
});