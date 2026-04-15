import { withLayoutContext, useRouter, Href, Slot, usePathname } from "expo-router";
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
  useWindowDimensions,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_URL } from "../../utils/api";

// 🔹 Import Firebase Auth dari Service Custom kita (Aman untuk Web & Mobile)
import { listenToAuth, forceSignOut } from "../../services/authGoogle";
import { fetchUserProfileAPI, fetchGerejaAPI } from "../../services/profileAPI";

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

  // 🔹 State untuk menyimpan data user login (Ubah tipe menjadi any agar tidak bergantung pada native module)
  const [user, setUser] = useState<any>(null);
  const [fotoProfil, setFotoProfil] = useState<string | null>(null);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const pathname = usePathname();

  // 🔹 1. Observer untuk memantau status login (Berlaku untuk Web & Mobile)
  useEffect(() => {
    const unsubscribe = listenToAuth(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const userData = await fetchUserProfileAPI(currentUser.email, token);
          setFotoProfil(userData?.profile?.fotoProfil || null);
        } catch {
          setFotoProfil(null);
        }
      } else {
        setFotoProfil(null);
      }
    });
    return () => unsubscribe(); // unsubscribe saat unmount
  }, []);

  const fetchGereja = async () => {
    try {
      const data = await fetchGerejaAPI();
      setGereja(data ?? null);
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

  const handleLogout = async () => {
    setMenuVisible(false);

    // Alert Native kadang tidak berjalan mulus di Web, kita beri proteksi khusus Web
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar?");
      if (confirmLogout) {
        try {
          await forceSignOut();
          router.replace("/home");
        } catch (error) {
          console.error("Logout Error:", error);
        }
      }
    } else {
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
                // 🔹 Cukup panggil fungsi ini, dia sudah pintar membedakan platform!
                await forceSignOut();
                router.replace("/home");
              } catch (error) {
                console.error("Logout Error:", error);
                router.replace("/home");
              }
            }
          }
        ]
      );
    }
  };

  if (loading) return null;

const SidebarItem = ({ name, icon, route, isActive, isProfile }: { name: string, icon?: keyof typeof Ionicons.glyphMap, route: Href, isActive: boolean, isProfile?: boolean }) => (
    <TouchableOpacity
      style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
      onPress={() => router.navigate(route)}
    >
      {isProfile ? (
        gereja?.logo?.url ? (
          <Image
            source={{ uri: `${API_URL.replace("/api/graphql", "")}${gereja.logo.url}` }}
            style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: isActive ? Colors.accent : "transparent" }}
          />
        ) : (
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#ccc" }} />
        )
      ) : (
        icon ? <Ionicons name={icon} size={24} color={isActive ? Colors.accent : Colors.white} /> : null
      )}
      <Text style={[styles.sidebarText, isActive && styles.sidebartextActive]}>{name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }} onLayout={onLayoutRootView}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => router.push("/profil")}
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
            {/* {user && (
               <Text style={styles.userGreet}>Halo, {user.displayName?.split(' ')[0] || "Jemaat"}</Text>
            )} */}
          </View>
        </TouchableOpacity>

        <View style={styles.rightButtons}>
          <TouchableOpacity onPress={() => router.push("../search")} style={styles.iconButton}>
            <Ionicons name="search" size={24} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.iconButton}>
            <View style={styles.profileCircleHeader}>
              {fotoProfil ? (
                <Image source={{ uri: fotoProfil }} style={styles.profileCircleAvatar} />
              ) : (
                <Ionicons name="person" size={20} color={Colors.primary} />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Menu */}
      {menuVisible && (
        <>
        <Pressable 
            style={styles.overlay} 
            onPress={() => setMenuVisible(false)} 
          />

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
            <Text style={styles.menuText}>{user ? "Profil Akun" : "Daftar / Masuk"}</Text>
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
        </>
      )}

      {/* Content & Tabs */}
      <View style={{ flex: 1, flexDirection: isLandscape ? "row" : "column" }}>
        {/* SIDEBAR - Hanya muncul jika Landscape */}
        {isLandscape && (
          <View style={styles.sidebarContainer}>
            <SidebarItem name="Home" icon="home" route="/home" isActive={pathname === "/home" || pathname === "/"} />
            <SidebarItem name="Jadwal" icon="calendar" route="/jadwalIbadah" isActive={pathname === "/jadwalIbadah"} />
            <SidebarItem name="Warta" icon="newspaper" route="/warta" isActive={pathname === "/warta"} />
            <SidebarItem name="Riwayat" icon="time" route="/Riwayat" isActive={pathname === "/Riwayat"} />
            {/* <SidebarItem name="Profil" icon={user ? "person" : "log-in"} route="/profil" isActive={pathname === "/profil"} /> */}
<SidebarItem name="Profil Gereja" route="/profil" isActive={pathname === "/profil"} isProfile={true} />
          </View>
        )}

        {/* KONTEN LAYAR & TABS */}
       <View style={{ flex: 1 }}>
            <Tabs
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: Colors.accent,
                tabBarInactiveTintColor: Colors.white,
                tabBarShowLabel: false,
                tabBarHideOnKeyboard: true,
                tabBarStyle: {
                  display: isLandscape ? "none" : "flex",
                  backgroundColor: Colors.primary,
                  borderTopWidth: 0,
                  height: Platform.OS === "android" ? 60 : 60,
                  paddingBottom: Platform.OS === "android" ? 10 : 10,
                  paddingTop: 10
                },
                tabBarIcon: ({ focused, color }) => {
                  if (route.name === "profil") {
                    return gereja?.logo?.url ? (
                      <Image
                        source={{ uri: `${API_URL.replace("/api/graphql", "")}${gereja.logo.url}` }}
                        style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: focused ? Colors.accent : "transparent" }}
                      />
                    ) : (
                      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#ccc" }} />
                    );
                  }
                  let iconName: keyof typeof Ionicons.glyphMap = "home";
                  if (route.name === "home") iconName = "home";
                  else if (route.name === "jadwalIbadah") iconName = "calendar";
                  else if (route.name === "warta") iconName = "newspaper";
                  else if (route.name === "Riwayat") iconName = "time";
                  // else if (route.name === "profil") iconName = user ? "person" : "log-in";

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
    paddingTop: Platform.OS === "android" ? 12 : 12,
  },
  logo: { width: 40, height: 40, marginRight: 10, borderRadius: 8 },
  headerText: { fontSize: 22, fontWeight: "bold", color: Colors.primary },
  userGreet: { fontSize: 12, color: Colors.primary, marginTop: -2 },
  rightButtons: { flexDirection: "row", alignItems: "center" },
  iconButton: { padding: 6, marginLeft: 8 },
  dropdownMenu: {
    position: "absolute",
    top: Platform.OS === "android" ? 60 : 60,
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

  sidebarContainer: {
    width: 250, // Lebar sidebar
    backgroundColor: Colors.primary,
    borderRightWidth: 1,
    borderColor: Colors.border,
    paddingTop: 0,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sidebarItemActive: {
    backgroundColor: Colors.tua,
  },
  sidebartextActive: {
    color: Colors.white,
    fontWeight: '600',
  },

  sidebarText: {
    marginLeft: 15,
    fontSize: 16,
    color: Colors.white,
    fontWeight: '500',
  },

  profileCircleHeader: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.muda,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileCircleAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

overlay: {
    ...StyleSheet.absoluteFillObject, 
    zIndex: 98, // Harus di bawah zIndex dropdown (99)
    elevation: 4, 
  },
});