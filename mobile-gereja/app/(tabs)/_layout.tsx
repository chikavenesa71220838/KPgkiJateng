import { withLayoutContext } from "expo-router";
import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { API_URL } from "../../utils/api";

const { Navigator } = createBottomTabNavigator();
const Tabs = withLayoutContext(Navigator);

interface Gereja {
  id: string;
  nama: string;
  logo?: { url: string };
}

export default function TabLayout() {
  const [gereja, setGereja] = useState<Gereja | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGereja = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              gerejas {
                id
                nama
                logo {
                  url
                }
              }
            }
          `,
        }),
      });

      const result = await res.json();
      const data = result.data?.gerejas?.[0] || null;
      setGereja(data);
    } catch (err) {
      console.error("Gagal memuat data gereja:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGereja();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        {loading ? (
          <ActivityIndicator color="#207163ff" />
        ) : (
          <>
            {gereja?.logo?.url ? (
              <Image
                source={{
                  uri: `${API_URL.replace("/api/graphql", "")}${gereja.logo.url}`,
                }}
                style={styles.logo}
              />
            ) : (
              <View style={[styles.logo, { backgroundColor: "#ccc" }]} />
            )}
            <Text style={styles.headerText}>
              {gereja?.nama || "Nama Gereja"}
            </Text>
          </>
        )}
      </View>

      {/* Tabs */}
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#ffd000ff",
          tabBarInactiveTintColor: "white",
          tabBarShowLabel: false,
          tabBarPosition: "bottom",
          tabBarStyle: {
            backgroundColor: "#207163ff",
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarIcon: ({ focused, color }) => {
            const size = 24;
            let iconName: keyof typeof Ionicons.glyphMap = "home";

            if (route.name === "home") iconName = "home";
            else if (route.name === "jadwalIbadah") iconName = "calendar";
            else if (route.name === "warta") iconName = "newspaper";
            else if (route.name === "Riwayat") iconName = "time";
            else if (route.name === "profil") iconName = "person";

            return (
              <View style={{ alignItems: "center" }}>
                <Ionicons name={iconName} size={size} color={color} />
              </View>
            );
          },
        })}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="jadwalIbadah" />
        <Tabs.Screen name="warta" />
        <Tabs.Screen name="Riwayat" />
        <Tabs.Screen name="profil" />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#207163ff",
  },
});
