import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  ToastAndroid,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, FontSize, Layout, Shadows } from "../constants/theme";
import {
  fetchUserProfileAPI,
  saveUserProfileAPI,
  deleteBackendDataAPI
} from "../services/profileAPI";

// 🔹 Import Firebase Auth dari Service Custom kita (Aman untuk Web & Mobile)
import { listenToAuth, forceSignOut } from "../services/authGoogle";

export default function ProfilScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [keystoneUserId, setKeystoneUserId] = useState<string | null>(null);
  const [keystoneProfileId, setKeystoneProfileId] = useState<string | null>(null);

  // 🔹 State untuk menyimpan data User dari Firebase (Web/Mobile)
  const [activeUser, setActiveUser] = useState<any>(null);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    kodePos: "",
    noWa: "",
    email: "",
    jenisKelamin: "",
    pendidikan: "",
    pekerjaan: "",
    statusKawin: "",
    statusKeanggotaan: "",
    tanggalLahir: "",
  });

  const [bulan, setBulan] = useState("");
  const [tahun, setTahun] = useState("");

  const bulanMap: Record<string, string> = {
    Januari: "01", Februari: "02", Maret: "03", April: "04",
    Mei: "05", Juni: "06", Juli: "07", Agustus: "08",
    September: "09", Oktober: "10", November: "11", Desember: "12",
  };
  const bulanList = Object.keys(bulanMap);
  const tahunList = Array.from({ length: 100 }, (_, i) =>
    (new Date().getFullYear() - i).toString(),
  );
  
  const pendidikanList = [
    "Tidak/Belum Sekolah", "SD/Sederajat", "SMP/Sederajat", 
    "SMA/SMK/Sederajat", "Diploma", "Sarjana (S1)", 
    "Magister (S2)", "Doktor (S3)"
  ];

  // 🔹 MENDENGARKAN STATUS LOGIN SECARA UNIVERSAL (Web & Mobile)
  useEffect(() => {
    const unsubscribe = listenToAuth(async (user) => {
      if (user && user.email) {
        setActiveUser(user);
        try {
          const firebaseToken = await user.getIdToken(true);
          await fetchProfileData(user.email, firebaseToken, user.displayName);
        } catch (error) {
          console.error("Gagal verifikasi token:", error);
          setIsLoadingData(false);
        }
      } else {
        setIsLoadingData(false);
        // // Jika tidak ada user (belum login), kembalikan ke home/login
        // Alert.alert("Akses Ditolak", "Anda harus login untuk melihat profil.");
        router.replace("/home");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchProfileData = async (email: string, token: string, fallbackName: string) => {
    try {
      const userData = await fetchUserProfileAPI(email, token);

      if (userData) {
        setKeystoneUserId(userData.id);
        const p = userData.profile;

        if (p) {
          setKeystoneProfileId(p.id);

          const jkFront = p.jenisKelamin === "L" ? "Laki-laki" : p.jenisKelamin === "P" ? "Perempuan" : "";
          const statusKawinFront = p.statusPernikahan === "single" ? "Belum Menikah" : p.statusPernikahan === "married" ? "Menikah" : "";
          const keanggotaanFront = p.statusKeanggotaan === "anggota" ? "Anggota" : p.statusKeanggotaan === "simpatisan" ? "Simpatisan" : "";

          setForm({
            nama: p.nama || "",
            email: userData.emailUser || "",
            alamat: p.alamat || "",
            kodePos: p.domisili || "",
            noWa: p.nomorWa || "",
            jenisKelamin: jkFront,
            pendidikan: p.pendidikan || "",
            pekerjaan: p.pekerjaan || "",
            statusKawin: statusKawinFront,
            statusKeanggotaan: keanggotaanFront,
            tanggalLahir: p.tanggalLahir || "",
          });

          if (p.tanggalLahir) {
            const [t, b] = p.tanggalLahir.split("-");
            setTahun(t);
            const namaBulan = Object.keys(bulanMap).find((key) => bulanMap[key] === b);
            if (namaBulan) setBulan(namaBulan);
          }
        } else {
          setForm((prev) => ({ ...prev, nama: userData.namaUser || fallbackName, email: userData.emailUser || email }));
        }
      }
    } catch (error) {
      console.error("Gagal ambil data profil backend:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const updateTanggalLahir = (b: string, t: string) => {
    setBulan(b);
    setTahun(t);
    if (b && t) {
      const bulanNum = bulanMap[b];
      handleChange("tanggalLahir", `${t}-${bulanNum}`);
    }
  };

  const handleSave = async () => {
    if (!keystoneUserId) return Alert.alert("Error", "ID User tidak ditemukan.");
    if (!activeUser) return Alert.alert("Error", "Sesi login tidak valid.");
    
    setIsSaving(true);

    try {
      const firebaseToken = await activeUser.getIdToken(true);

      const payload = {
        nama: form.nama,
        alamat: form.alamat,
        domisili: form.kodePos,
        noWa: form.noWa,
        jk: form.jenisKelamin === "Laki-laki" ? "L" : form.jenisKelamin === "Perempuan" ? "P" : null,
        pendidikan: form.pendidikan,
        pekerjaan: form.pekerjaan,
        statusKawin: form.statusKawin === "Belum Menikah" ? "single" : form.statusKawin === "Menikah" ? "married" : null,
        statusKeanggotaan: form.statusKeanggotaan === "Anggota" ? "anggota" : form.statusKeanggotaan === "Simpatisan" ? "simpatisan" : null,
        tglLahir: form.tanggalLahir,
      };

      const result = await saveUserProfileAPI(keystoneUserId, keystoneProfileId, payload, firebaseToken);

      if (!keystoneProfileId && result.profile?.id) {
        setKeystoneProfileId(result.profile.id);
      }

      if (Platform.OS === "android") {
        ToastAndroid.show("Profil berhasil diperbarui!", ToastAndroid.SHORT);
      } else {
        Alert.alert("Sukses", "Profil berhasil diperbarui!");
      }
    } catch (error: any) {
      console.error("Gagal simpan:", error);
      Alert.alert("Error", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      if (!activeUser) throw new Error("Anda belum login.");
      const firebaseToken = await activeUser.getIdToken(true);

      const userEmail = activeUser.email || form.email;
      
      // 1. Hapus data di Backend KeystoneJS
      await deleteBackendDataAPI(keystoneUserId, keystoneProfileId, firebaseToken, userEmail);
      
      // 2. Hapus akun di Firebase
      await activeUser.delete();

      // 3. Bersihkan Sesi Google (Hanya dijalankan di HP agar Web tidak crash)
      if (Platform.OS !== 'web') {
        try {
          const { GoogleSignin } = require("@react-native-google-signin/google-signin");
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
        } catch (googleError) {
          console.log("Catatan Google Signout:", googleError);
        }
      } else {
        await forceSignOut();
      }
      
      if (Platform.OS === "android") ToastAndroid.show("Akun dihapus.", ToastAndroid.SHORT);
      router.replace("/home");

    } catch (error: any) {
      console.error("Error Delete:", error);
      setIsDeleting(false);
      
      if (error.code === "auth/requires-recent-login") {
        // Jika butuh verifikasi ulang, minta user login lagi. 
        // Ini cara paling aman lintas platform (Web & Mobile).
        Alert.alert(
          "Verifikasi Keamanan 🛡️",
          "Karena ini tindakan permanen, sistem meminta Anda untuk Logout dan Login kembali untuk memverifikasi identitas sebelum menghapus akun.",
          [
            { text: "Batal", style: "cancel" },
            {
              text: "Logout Sekarang",
              onPress: async () => {
                await forceSignOut();
                router.replace("/home");
              },
            },
          ]
        );
      } else {
        Alert.alert("Gagal Hapus Akun", error.message);
      }
    }
  };

  const handleDeletePrompt = () => {
    // Alert Native kadang tidak muncul di Web, kita beri proteksi khusus Web
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm("PERINGATAN: Yakin ingin menghapus akun secara permanen?");
      if (confirmDelete) executeDelete();
    } else {
      Alert.alert("Hapus Akun", "Yakin ingin menghapus akun secara permanen?", [
        { text: "Batal", style: "cancel" },
        { text: "Ya, Hapus", style: "destructive", onPress: executeDelete },
      ]);
    }
  };

  if (isLoadingData) {
    return (
      <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10, color: Colors.primary }}>Memuat Profil...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* 🔹 HEADER KONSISTEN & RAPI */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Akun</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            
            <Text style={[styles.label, { marginTop: 0 }]}>Nama <Text style={styles.asterisk}>*</Text></Text>
            <TextInput style={styles.input} value={form.nama} onChangeText={(v) => handleChange("nama", v)} />

            <Text style={styles.label}>Alamat <Text style={styles.asterisk}>*</Text></Text>
            <TextInput style={styles.input} value={form.alamat} onChangeText={(v) => handleChange("alamat", v)} />

            <Text style={styles.label}>Kode Pos / Domisili <Text style={styles.asterisk}>*</Text></Text>
            <TextInput style={styles.input} value={form.kodePos} onChangeText={(v) => handleChange("kodePos", v)} keyboardType="numeric" />

            <Text style={styles.label}>Nomor WA <Text style={styles.asterisk}>*</Text></Text>
            <TextInput style={styles.input} value={form.noWa} onChangeText={(v) => handleChange("noWa", v)} keyboardType="phone-pad" />

            <Text style={styles.label}>Email</Text>
            <TextInput style={[styles.input, { backgroundColor: Colors.divider, color: Colors.textMuted }]} value={form.email} editable={false} />

            {/* 🔹 TOGGLE JENIS KELAMIN */}
            <Text style={styles.label}>Jenis Kelamin <Text style={styles.asterisk}>*</Text></Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, form.jenisKelamin === "Laki-laki" ? styles.toggleButtonActive : null]}
                onPress={() => handleChange("jenisKelamin", "Laki-laki")}
              >
                <Text style={[styles.toggleText, form.jenisKelamin === "Laki-laki" ? styles.toggleTextActive : null]}>Laki-laki</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, form.jenisKelamin === "Perempuan" ? styles.toggleButtonActive : null]}
                onPress={() => handleChange("jenisKelamin", "Perempuan")}
              >
                <Text style={[styles.toggleText, form.jenisKelamin === "Perempuan" ? styles.toggleTextActive : null]}>Perempuan</Text>
              </TouchableOpacity>
            </View>

            {/* 🔹 CUSTOM DROPDOWN PENDIDIKAN */}
            <Text style={styles.label}>Pendidikan Terakhir <Text style={styles.asterisk}>*</Text></Text>
            <TouchableOpacity
              style={styles.dropdownHeader}
              activeOpacity={0.8}
              onPress={() => setOpenDropdown(openDropdown === "pendidikan" ? null : "pendidikan")}
            >
              <Text style={[styles.dropdownHeaderText, !form.pendidikan && { color: Colors.placeholder }]}>
                {form.pendidikan ? form.pendidikan : "Pilih pendidikan..."}
              </Text>
              <Ionicons name={openDropdown === "pendidikan" ? "chevron-up" : "chevron-down"} size={20} color={Colors.textMuted} />
            </TouchableOpacity>
            {openDropdown === "pendidikan" && (
              <View style={styles.dropdownListContainer}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                  {pendidikanList.map((item, idx) => (
                    <View key={idx}>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => { handleChange("pendidikan", item); setOpenDropdown(null); }}
                      >
                        <Text style={styles.dropdownItemText}>{item}</Text>
                      </TouchableOpacity>
                      {idx < pendidikanList.length - 1 && <View style={styles.divider} />}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text style={styles.label}>Pekerjaan <Text style={styles.asterisk}>*</Text></Text>
            <TextInput style={styles.input} value={form.pekerjaan} onChangeText={(v) => handleChange("pekerjaan", v)} />

            {/* 🔹 CUSTOM DROPDOWN TANGGAL LAHIR */}
            <Text style={styles.label}>Tanggal Lahir (Bulan & Tahun) <Text style={styles.asterisk}>*</Text></Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              
              <View style={{ flex: 1 }}>
                <TouchableOpacity style={styles.dropdownHeader} onPress={() => setOpenDropdown(openDropdown === "bulan" ? null : "bulan")}>
                  <Text style={[styles.dropdownHeaderText, !bulan && { color: Colors.placeholder }]}>{bulan || "Bulan"}</Text>
                  <Ionicons name={openDropdown === "bulan" ? "chevron-up" : "chevron-down"} size={20} color={Colors.textMuted} />
                </TouchableOpacity>
                {openDropdown === "bulan" && (
                  <View style={[styles.dropdownListContainer, { position: "absolute", top: 50, left: 0, right: 0, zIndex: 10 }]}>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
                      {bulanList.map((b, i) => (
                        <TouchableOpacity key={i} style={styles.dropdownItem} onPress={() => { updateTanggalLahir(b, tahun); setOpenDropdown(null); }}>
                          <Text style={styles.dropdownItemText}>{b}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <TouchableOpacity style={styles.dropdownHeader} onPress={() => setOpenDropdown(openDropdown === "tahun" ? null : "tahun")}>
                  <Text style={[styles.dropdownHeaderText, !tahun && { color: Colors.placeholder }]}>{tahun || "Tahun"}</Text>
                  <Ionicons name={openDropdown === "tahun" ? "chevron-up" : "chevron-down"} size={20} color={Colors.textMuted} />
                </TouchableOpacity>
                {openDropdown === "tahun" && (
                  <View style={[styles.dropdownListContainer, { position: "absolute", top: 50, left: 0, right: 0, zIndex: 10 }]}>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
                      {tahunList.map((t, i) => (
                        <TouchableOpacity key={i} style={styles.dropdownItem} onPress={() => { updateTanggalLahir(bulan, t); setOpenDropdown(null); }}>
                          <Text style={styles.dropdownItemText}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            {/* 🔹 CUSTOM DROPDOWN PERKAWINAN */}
            <Text style={styles.label}>Status Perkawinan <Text style={styles.asterisk}>*</Text></Text>
            <TouchableOpacity
              style={styles.dropdownHeader}
              activeOpacity={0.8}
              onPress={() => setOpenDropdown(openDropdown === "kawin" ? null : "kawin")}
            >
              <Text style={[styles.dropdownHeaderText, !form.statusKawin && { color: Colors.placeholder }]}>
                {form.statusKawin ? form.statusKawin : "Pilih status..."}
              </Text>
              <Ionicons name={openDropdown === "kawin" ? "chevron-up" : "chevron-down"} size={20} color={Colors.textMuted} />
            </TouchableOpacity>
            {openDropdown === "kawin" && (
              <View style={styles.dropdownListContainer}>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { handleChange("statusKawin", "Belum Menikah"); setOpenDropdown(null); }}>
                  <Text style={styles.dropdownItemText}>Belum Menikah</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { handleChange("statusKawin", "Menikah"); setOpenDropdown(null); }}>
                  <Text style={styles.dropdownItemText}>Menikah</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 🔹 CUSTOM DROPDOWN KEANGGOTAAN */}
            <Text style={styles.label}>Status Keanggotaan Gereja <Text style={styles.asterisk}>*</Text></Text>
            <TouchableOpacity
              style={styles.dropdownHeader}
              activeOpacity={0.8}
              onPress={() => setOpenDropdown(openDropdown === "anggota" ? null : "anggota")}
            >
              <Text style={[styles.dropdownHeaderText, !form.statusKeanggotaan && { color: Colors.placeholder }]}>
                {form.statusKeanggotaan ? form.statusKeanggotaan : "Pilih status..."}
              </Text>
              <Ionicons name={openDropdown === "anggota" ? "chevron-up" : "chevron-down"} size={20} color={Colors.textMuted} />
            </TouchableOpacity>
            {openDropdown === "anggota" && (
              <View style={styles.dropdownListContainer}>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { handleChange("statusKeanggotaan", "Anggota"); setOpenDropdown(null); }}>
                  <Text style={styles.dropdownItemText}>Anggota</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { handleChange("statusKeanggotaan", "Simpatisan"); setOpenDropdown(null); }}>
                  <Text style={styles.dropdownItemText}>Simpatisan</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Tombol Simpan */}
            <TouchableOpacity
              style={[styles.btnSave, isSaving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.btnText}>Simpan</Text>
              )}
            </TouchableOpacity>

            {/* Tombol Hapus */}
            <TouchableOpacity
              style={[styles.btnHapus, isDeleting && { opacity: 0.7 }]}
              onPress={handleDeletePrompt}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.btnText}>Hapus Akun</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // 🔹 HEADER RAPI & GAP DIPERBAIKI
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.padding,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 20, 
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: FontSize.h1,
    fontWeight: "bold",
    color: Colors.primary,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Layout.padding,
    paddingTop: 4,
    paddingBottom: 40,
  },
  
  card: {
    backgroundColor: Colors.white,
    borderRadius: Layout.radiusXLarge,
    padding: 24,
    marginBottom: 20,
    ...Shadows.shdows, 
  },

  // 🔹 TYPOGRAPHY & INPUT
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  asterisk: {
    color: Colors.danger, 
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.radiusLarge,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },

  // 🔹 TOGGLE GENDER
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.03)", // Sedikit abu-abu transparan
    borderRadius: Layout.radiusLarge,
    padding: 4,
    height: 50,
  },
  toggleButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  toggleButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleText: { fontSize: 15, fontWeight: "600", color: Colors.textMuted },
  toggleTextActive: { color: Colors.primary, fontWeight: "700" },

  // 🔹 CUSTOM DROPDOWN
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.radiusLarge,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownHeaderText: { fontSize: 15, color: Colors.text },
  dropdownListContainer: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.radiusLarge,
    marginTop: 6,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: { paddingVertical: 14, paddingHorizontal: 16 },
  dropdownItemText: { fontSize: 15, color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },

  // 🔹 BUTTONS
  btnSave: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.radiusLarge,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
    marginBottom: 12,
    ...Shadows.button,
  },
  btnHapus: {
    backgroundColor: Colors.danger,
    borderRadius: Layout.radiusLarge,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
    ...Shadows.button,
  },
  btnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});