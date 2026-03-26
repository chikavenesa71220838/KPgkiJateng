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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import auth from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { 
  fetchUserProfileAPI, 
  saveUserProfileAPI, 
  deleteBackendDataAPI 
} from "../services/profileAPI";

export default function ProfilScreen() {
  const router = useRouter();

  // State untuk Loading & ID dari Backend
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [keystoneUserId, setKeystoneUserId] = useState<string | null>(null);
  const [keystoneProfileId, setKeystoneProfileId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const user = auth().currentUser;
      if (!user || !user.email) throw new Error("Belum login");

      const firebaseToken = await user.getIdToken(true);

      // Panggil fungsi dari profileAPI.ts
      const userData = await fetchUserProfileAPI(user.email, firebaseToken);

      if (userData) {
        setKeystoneUserId(userData.id);
        const p = userData.profile;

        if (p) {
          setKeystoneProfileId(p.id);

          // Terjemahkan data backend ke frontend
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

          // Pecah tanggal lahir
          if (p.tanggalLahir) {
            const [t, b] = p.tanggalLahir.split("-");
            setTahun(t);
            const namaBulan = Object.keys(bulanMap).find((key) => bulanMap[key] === b);
            if (namaBulan) setBulan(namaBulan);
          }
        } else {
          setForm((prev) => ({ ...prev, nama: userData.namaUser, email: userData.emailUser }));
        }
      }
    } catch (error) {
      console.error("Gagal ambil data:", error);
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
    setIsSaving(true);

    try {
      const user = auth().currentUser;
      const firebaseToken = await user?.getIdToken(true) || "";

      // Siapkan Payload Data
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

      // Panggil fungsi simpan dari profileAPI.ts
      const result = await saveUserProfileAPI(keystoneUserId, keystoneProfileId, payload, firebaseToken);

      // Update state ID profile jika baru di-create
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
      const user = auth().currentUser;
      if (!user) throw new Error("Anda belum login.");
      const firebaseToken = await user.getIdToken(true);
      
      // Hapus data di Backend KeystoneJS
      await deleteBackendDataAPI(keystoneUserId, keystoneProfileId, firebaseToken);
      
      // Hapus akun di Firebase
      await user.delete();

      // Hapus cache Google Sign-in
      try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      } catch (googleError) {
        console.log("Catatan Google Signout:", googleError);
      }
      
      if (Platform.OS === "android") ToastAndroid.show("Akun dihapus.", ToastAndroid.SHORT);
      router.replace("/login");

    } catch (error: any) {
      console.error("Error Delete:", error);
      setIsDeleting(false);
      
      // Penanganan khusus jika Firebase minta login ulang (Token Expired)
if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Verifikasi Keamanan 🛡️",
          "Karena ini tindakan permanen, Google meminta Anda memverifikasi identitas sekali lagi.",
          [
            { text: "Batal", style: "cancel" },
            {
              text: "Verifikasi Sekarang",
              onPress: async () => {
                try {
                  await GoogleSignin.hasPlayServices();
                  const response = await GoogleSignin.signIn();
                  if (response.type === 'success') {
                    const idToken = response.data.idToken;
                    
                    if (idToken) {
                      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
                      
                      // Masukkan kredensial baru ke Firebase
                      await auth().currentUser?.reauthenticateWithCredential(googleCredential);
                      
                      Alert.alert("Sukses", "Identitas terverifikasi! Silakan tekan tombol 'Hapus Akun' sekali lagi.");
                    }
                  } else {
                    console.log("Verifikasi dibatalkan oleh user.");
                  }

                } catch (reauthErr) {
                  console.log("Batal verifikasi:", reauthErr);
                }
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
    Alert.alert("Hapus Akun", "Yakin ingin menghapus akun?", [
      { text: "Batal", style: "cancel" },
      { text: "Ya, Hapus", style: "destructive", onPress: executeDelete },
    ]);
  };

  if (isLoadingData) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={{ marginTop: 10 }}>Memuat Profil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profil Jemaat</Text>

      <Text style={styles.label}>Nama *</Text>
      <TextInput style={styles.input} value={form.nama} onChangeText={(v) => handleChange("nama", v)} />

      <Text style={styles.label}>Alamat *</Text>
      <TextInput style={styles.input} value={form.alamat} onChangeText={(v) => handleChange("alamat", v)} />

      <Text style={styles.label}>Kode Pos / Domisili *</Text>
      <TextInput style={styles.input} value={form.kodePos} onChangeText={(v) => handleChange("kodePos", v)} keyboardType="numeric" />

      <Text style={styles.label}>Nomor WA *</Text>
      <TextInput style={styles.input} value={form.noWa} onChangeText={(v) => handleChange("noWa", v)} keyboardType="phone-pad" />

      <Text style={styles.label}>Email *</Text>
      <TextInput style={styles.input} value={form.email} editable={false} />

      <Text style={styles.label}>Jenis Kelamin *</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.jenisKelamin}
          onValueChange={(v) => handleChange("jenisKelamin", v)}
          style={{ color: '#000' }}
          dropdownIconColor="#000"
        >
          <Picker.Item label="Pilih jenis kelamin..." value="" />
          <Picker.Item label="Laki-laki" value="Laki-laki" />
          <Picker.Item label="Perempuan" value="Perempuan" />
        </Picker>
      </View>

      <Text style={styles.label}>Pendidikan Terakhir *</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.pendidikan}
          onValueChange={(v) => handleChange("pendidikan", v)}
          style={{ color: '#000' }}
          dropdownIconColor="#000"
        >
          <Picker.Item label="Pilih pendidikan terakhir..." value="" />
          <Picker.Item label="Tidak/Belum Sekolah" value="Tidak/Belum Sekolah" />
          <Picker.Item label="SD/Sederajat" value="SD/Sederajat" />
          <Picker.Item label="SMP/Sederajat" value="SMP/Sederajat" />
          <Picker.Item label="SMA/SMK/Sederajat" value="SMA/SMK/Sederajat" />
          <Picker.Item label="Diploma" value="Diploma" />
          <Picker.Item label="Sarjana (S1)" value="Sarjana (S1)" />
          <Picker.Item label="Magister (S2)" value="Magister (S2)" />
          <Picker.Item label="Doktor (S3)" value="Doktor (S3)" />
        </Picker>
      </View>

      <Text style={styles.label}>Pekerjaan *</Text>
      <TextInput style={styles.input} value={form.pekerjaan} onChangeText={(v) => handleChange("pekerjaan", v)} />

      <Text style={styles.label}>Tanggal Lahir (Bulan & Tahun) *</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={[styles.pickerWrapper, { flex: 1 }]}>
          <Picker
            selectedValue={bulan}
            onValueChange={(v) => updateTanggalLahir(v, tahun)}
            style={{ color: '#000' }}
            dropdownIconColor="#000"
          >
            <Picker.Item label="Bulan" value="" />
            {bulanList.map((b, i) => (
              <Picker.Item key={i} label={b} value={b} />
            ))}
          </Picker>
        </View>
        <View style={[styles.pickerWrapper, { flex: 1 }]}>
          <Picker
            selectedValue={tahun}
            onValueChange={(v) => updateTanggalLahir(bulan, v)}
            style={{ color: '#000' }}
            dropdownIconColor="#000"
          >
            <Picker.Item label="Tahun" value="" />
            {tahunList.map((t, i) => (
              <Picker.Item key={i} label={t} value={t} />
            ))}
          </Picker>
        </View>
      </View>

      <Text style={styles.label}>Status Perkawinan *</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.statusKawin}
          onValueChange={(v) => handleChange("statusKawin", v)}
          style={{ color: '#000' }} 
          dropdownIconColor="#000"
        >
          <Picker.Item label="Pilih status perkawinan..." value="" />
          <Picker.Item label="Belum Menikah" value="Belum Menikah" />
          <Picker.Item label="Menikah" value="Menikah" />
        </Picker>
      </View>

      <Text style={styles.label}>Status Keanggotaan Gereja *</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.statusKeanggotaan}
          onValueChange={(v) => handleChange("statusKeanggotaan", v)}
          style={{ color: '#000' }} 
          dropdownIconColor="#000"
        >
          <Picker.Item label="Pilih status keanggotaan..." value="" />
          <Picker.Item label="Anggota" value="Anggota" />
          <Picker.Item label="Simpatisan" value="Simpatisan" />
        </Picker>
      </View>

      {/* Tombol Simpan */}
      <TouchableOpacity
        style={[styles.btnSave, isSaving && { backgroundColor: "#87CEFA" }]}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Simpan</Text>
        )}
      </TouchableOpacity>

      {/* Tombol Hapus */}
      <TouchableOpacity
        style={[styles.btnHapus, isDeleting && { backgroundColor: "#ccc" }]}
        onPress={handleDeletePrompt}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Hapus Akun</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  label: { fontWeight: "bold", marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  btnSave: {
    backgroundColor: "#1E90FF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  btnHapus: {
    backgroundColor: "#FF6347",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40,
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 20 },
});