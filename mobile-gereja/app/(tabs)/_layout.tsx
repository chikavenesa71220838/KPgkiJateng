import { withLayoutContext, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
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
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

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

  const handleLogout = () => {
    setMenuVisible(false);
    console.log("User logged out");
    router.push("/login");
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        {/* Logo + Nama Gereja */}
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => router.push("../profil")}
          activeOpacity={0.7}
        >
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
        </TouchableOpacity>

        <View style={styles.rightButtons}>
          <TouchableOpacity
            onPress={() => router.push("../search")}
            style={styles.iconButton}
          >
            <Ionicons name="search" size={24} color="#207163ff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMenuVisible(!menuVisible)}
            style={styles.iconButton}
          >
            <Ionicons name="menu" size={28} color="#207163ff" />
          </TouchableOpacity>
        </View>
      </View>

      {menuVisible && (
        <View style={styles.dropdownMenu}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              // router.push("/akun");
            }}
          >
            <Ionicons name="person-circle-outline" size={20} color="#207163" />
            <Text style={styles.menuText}>Profil Akun</Text>
          </Pressable>

          <View style={styles.menuDivider} />

          <Pressable style={styles.menuItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#d9534f" />
            <Text style={[styles.menuText, { color: "#d9534f" }]}>Log Out</Text>
          </Pressable>
        </View>
      )}

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
            if (route.name === "profil" && gereja?.logo?.url) {
              return (
                <Image
                  source={{
                    uri: `${API_URL.replace("/api/graphql", "")}${gereja.logo.url}`,
                  }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    opacity: focused ? 1 : 0.7,
                    borderWidth: focused ? 2 : 0,
                    borderColor: focused ? "#ffd000ff" : "transparent",
                  }}
                />
              );
            }

            let iconName: keyof typeof Ionicons.glyphMap = "home";
            if (route.name === "home") iconName = "home";
            else if (route.name === "jadwalIbadah") iconName = "calendar";
            else if (route.name === "warta") iconName = "newspaper";
            else if (route.name === "Riwayat") iconName = "time";
            else if (route.name === "search") iconName = "search";

            return <Ionicons name={iconName} size={size} color={color} />;
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
    justifyContent: "space-between",
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
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 6,
    marginLeft: 8,
  },
  dropdownMenu: {
    position: "absolute",
    top: 60,
    right: 10,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingVertical: 8,
    width: 160,
    zIndex: 99,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#207163",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 4,
  },
});
