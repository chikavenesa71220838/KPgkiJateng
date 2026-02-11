import { withLayoutContext, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import {
  View,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  Platform,
  Alert,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_URL } from "../../utils/api";

// Import Firebase Auth
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const { Navigator } = createBottomTabNavigator();
const Tabs = withLayoutContext(Navigator);

interface Gereja {
  id: string;
  nama: string;
  logo?: { url: string };
}

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const [gereja, setGereja] = useState<Gereja | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  // State untuk menyimpan data user login
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 1. Observer untuk memantau status login Firebase
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return subscriber; // unsubscribe saat unmount
  }, []);

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
                logo { url }
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

  const onLayoutRootView = useCallback(async () => {
    if (!loading) {
      await SplashScreen.hideAsync();
    }
  }, [loading]);

  const handleLogout = () => {
    setMenuVisible(false);
    
    Alert.alert(
      "Konfirmasi Keluar",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Ya, Keluar", 
          style: "destructive",
          onPress: async () => {
            try {
              await auth().signOut();
              await GoogleSignin.signOut();
              router.replace("/home");
            } catch (error) {
              console.error("Logout Error:", error);
              router.replace("/home");
            }
          }
        }
      ]
    );
  };

  if (loading) return null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }} onLayout={onLayoutRootView}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          // Jika login ke Profil, jika tidak ke Login
          onPress={() => router.push(user ? "/profil" : "/login")}
          activeOpacity={0.7}
        >
          {gereja?.logo?.url ? (
            <Image
              source={{ uri: `${API_URL.replace("/api/graphql", "")}${gereja.logo.url}` }}
              style={styles.logo}
            />
          ) : (
            <View style={[styles.logo, { backgroundColor: "#ccc" }]} />
          )}
          <View>
            <Text style={styles.headerText}>{gereja?.nama || "Nama Gereja"}</Text>
            {user && (
               <Text style={styles.userGreet}>Halo, {user.displayName?.split(' ')[0]}</Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.rightButtons}>
          <TouchableOpacity onPress={() => router.push("../search")} style={styles.iconButton}>
            <Ionicons name="search" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.iconButton}>
            <Ionicons name="menu" size={28} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Menu */}
      {menuVisible && (
        <View style={styles.dropdownMenu}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              if (user) {
                router.push("/profile");
              } else {
                router.push("/login");
              }
              setMenuVisible(false);
            }}
          >
            <Ionicons name="person-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.menuText}>{user ? "Profil Akun" : "Masuk / Login"}</Text>
          </Pressable>
          
          {user && (
            <>
              <View style={styles.menuDivider} />
              <Pressable style={styles.menuItem} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
                <Text style={[styles.menuText, { color: Colors.danger }]}>Log Out</Text>
              </Pressable>
            </>
          )}
        </View>
      )}

      {/* Content & Tabs */}
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: Colors.accent,
            tabBarInactiveTintColor: Colors.white,
            tabBarShowLabel: false,
            tabBarHideOnKeyboard: true,
            tabBarStyle: {
              backgroundColor: Colors.primary,
              borderTopWidth: 0,
              height: Platform.OS === "android" ? 60 : 90,
              paddingBottom: Platform.OS === "android" ? 10 : 30,
            },
            tabBarIcon: ({ focused, color }) => {
              let iconName: keyof typeof Ionicons.glyphMap = "home";
              if (route.name === "home") iconName = "home";
              else if (route.name === "jadwalIbadah") iconName = "calendar";
              else if (route.name === "warta") iconName = "newspaper";
              else if (route.name === "Riwayat") iconName = "time";
              else if (route.name === "profil") iconName = user ? "person" : "log-in";

              return <Ionicons name={iconName} size={24} color={color} />;
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
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    paddingTop: Platform.OS === "android" ? 12 : 50,
  },
  logo: { width: 40, height: 40, marginRight: 10, borderRadius: 8 },
  headerText: { fontSize: 18, fontWeight: "bold", color: Colors.primary },
  userGreet: { fontSize: 12, color: Colors.primary, marginTop: -2 },
  rightButtons: { flexDirection: "row", alignItems: "center" },
  iconButton: { padding: 6, marginLeft: 8 },
  dropdownMenu: {
    position: "absolute",
    top: Platform.OS === "android" ? 60 : 100,
    right: 10,
    backgroundColor: Colors.white,
    borderRadius: 8,
    elevation: 5,
    paddingVertical: 8,
    width: 160,
    zIndex: 99,
  },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 12 },
  menuText: { marginLeft: 8, fontSize: 16, color: Colors.primary },
  menuDivider: { height: 1, backgroundColor: "#eee", marginVertical: 4 },
});