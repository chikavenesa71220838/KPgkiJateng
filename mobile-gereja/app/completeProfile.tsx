import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import auth from "@react-native-firebase/auth";
import { API_URL } from "@/utils/api";

export default function CompleteProfile() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    email: auth().currentUser?.email || "",
    jenisKelamin: "",
    statusKeanggotaan: "",
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSimpan = async () => {
    if (
      !form.nama ||
      !form.email ||
      !form.jenisKelamin ||
      !form.statusKeanggotaan
    ) {
      if (Platform.OS === "android") {
        ToastAndroid.show(
          "Mohon lengkapi semua kolom wajib (*)",
          ToastAndroid.SHORT,
        );
      } else {
        Alert.alert("Perhatian", "Mohon lengkapi semua kolom wajib (*)");
      }
      return;
    }

    setIsLoading(true);

    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error("Anda belum login.");
      const firebaseToken = await currentUser.getIdToken(true);

      const jkBackend = form.jenisKelamin === "Laki-laki" ? "L" : "P";
      const statusBackend = form.statusKeanggotaan.toLowerCase();

      // Cari ID User
      const FIND_USER_QUERY = {
        query: `
          query FindUser($email: String!) {
            users(where: { emailUser: { equals: $email } }) {
              id
            }
          }
        `,
        variables: { email: form.email },
      };

      const resFind = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify(FIND_USER_QUERY),
      });

      const dataFind = await resFind.json();
      const keystoneUserId = dataFind.data?.users?.[0]?.id;

      if (!keystoneUserId) {
        throw new Error("Data akun tidak ditemukan di server.");
      }

      // ==========================================
      // PERUBAHAN MUTASI GRAPHQL ADA DI SINI
      // 'nama' sekarang dimasukkan ke dalam create profile
      // ==========================================
      const UPDATE_PROFILE_MUTATION = {
        query: `
          mutation UpdateUserAndProfile($id: ID!, $nama: String!, $jk: String!, $status: String!) {
            updateUser(
              where: { id: $id }
              data: {
                profile: {
                  create: {
                    nama: $nama
                    jenisKelamin: $jk
                    statusKeanggotaan: $status
                  }
                }
              }
            ) {
              id
              profile {
                id
                nama
                jenisKelamin
                statusKeanggotaan
              }
            }
          }
        `,
        variables: {
          id: keystoneUserId,
          nama: form.nama,
          jk: jkBackend,
          status: statusBackend,
        },
      };

      const resUpdate = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify(UPDATE_PROFILE_MUTATION),
      });

      const dataUpdate = await resUpdate.json();

      if (dataUpdate.errors) {
        throw new Error(dataUpdate.errors[0].message);
      }

      if (Platform.OS === "android") {
        ToastAndroid.show("Profil berhasil disimpan!", ToastAndroid.SHORT);
      } else {
        Alert.alert("Sukses", "Profil berhasil disimpan!");
      }
      setIsLoading(false);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      setIsLoading(false);
      console.error("Gagal simpan profil:", error);
      Alert.alert(
        "Terjadi Kesalahan",
        error.message || "Gagal menghubungi server.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient colors={["#F0FDF4", "#D1FAE5"]} style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <View style={styles.headerContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-outline" size={40} color="#0B7A5D" />
              </View>
              <Text style={styles.title}>Selamat Datang,</Text>
              <Text style={styles.subtitle}>Silahkan Lengkapi Profil Anda</Text>
            </View>

            {/* Form Card Section */}
            <View style={styles.card}>
              {/* Input Nama */}
              <Text style={styles.label}>
                Nama <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor="#999"
                value={form.nama}
                onChangeText={(v) => handleChange("nama", v)}
              />

              {/* Input Email */}
              <Text style={styles.label}>
                Email <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="contoh@gmail.com"
                placeholderTextColor="#999"
                value={form.email}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(v) => handleChange("email", v)}
                editable={false} // Sebaiknya email dari Google tidak bisa diedit di sini
              />

              {/* SECTION: GENDER TOGGLE */}
              <Text style={styles.label}>
                Jenis Kelamin <Text style={styles.asterisk}>*</Text>
              </Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    form.jenisKelamin === "Laki-laki" &&
                      styles.toggleButtonActive,
                  ]}
                  onPress={() => handleChange("jenisKelamin", "Laki-laki")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      form.jenisKelamin === "Laki-laki" &&
                        styles.toggleTextActive,
                    ]}
                  >
                    Laki-laki
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    form.jenisKelamin === "Perempuan" &&
                      styles.toggleButtonActive,
                  ]}
                  onPress={() => handleChange("jenisKelamin", "Perempuan")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      form.jenisKelamin === "Perempuan" &&
                        styles.toggleTextActive,
                    ]}
                  >
                    Perempuan
                  </Text>
                </TouchableOpacity>
              </View>

              {/* SECTION: CUSTOM DROPDOWN STATUS KEANGGOTAAN */}
              <Text style={styles.label}>
                Status Keanggotaan <Text style={styles.asterisk}>*</Text>
              </Text>

              <TouchableOpacity
                style={styles.dropdownHeader}
                activeOpacity={0.8}
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Text
                  style={[
                    styles.dropdownHeaderText,
                    !form.statusKeanggotaan && { color: "#999" },
                  ]}
                >
                  {form.statusKeanggotaan
                    ? form.statusKeanggotaan
                    : "Pilih status keanggotaan"}
                </Text>
                <Ionicons
                  name={isDropdownOpen ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>

              {isDropdownOpen && (
                <View style={styles.dropdownListContainer}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleChange("statusKeanggotaan", "Anggota");
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Anggota</Text>
                  </TouchableOpacity>

                  <View style={styles.divider} />

                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleChange("statusKeanggotaan", "Simpatisan");
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Simpatisan</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Tombol Simpan */}
              <TouchableOpacity
                style={[styles.btnSimpan, isLoading && { opacity: 0.7 }]}
                onPress={handleSimpan}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnSimpanText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: "center" },
  headerContainer: { alignItems: "flex-start", marginBottom: 30, marginTop: 0 },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E6F4F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#0B7A5D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: { fontSize: 32, fontWeight: "800", color: "#0B7A5D", marginBottom: 4 },
  subtitle: { fontSize: 18, fontWeight: "600", color: "#0B7A5D" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  asterisk: { color: "#E53E3E" },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#333",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    height: 50,
  },
  toggleButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleText: { fontSize: 15, fontWeight: "600", color: "#6B7280" },
  toggleTextActive: { color: "#0B7A5D", fontWeight: "700" },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownHeaderText: { fontSize: 15, color: "#333" },
  dropdownListContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginTop: 6,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownItem: { paddingVertical: 14, paddingHorizontal: 16 },
  dropdownItemText: { fontSize: 15, color: "#333" },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginHorizontal: 16 },
  btnSimpan: {
    backgroundColor: "#0B7A5D",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
    marginBottom: 8,
    shadowColor: "#0B7A5D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnSimpanText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
