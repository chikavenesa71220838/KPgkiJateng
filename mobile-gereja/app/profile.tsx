import React, { useState } from "react";
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
import { API_URL } from "../utils/api"; 
// ==========================================
// TAMBAHAN IMPORT GOOGLE SIGN IN
// ==========================================
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export default function ProfilScreen() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSave = () => {
    alert(`Profil berhasil disimpan!`);
  };
  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const user = auth().currentUser;
      if (!user) throw new Error("Anda belum login.");

      const firebaseToken = await user.getIdToken(true);

      // 1. CARI ID USER DI BACKEND
      const GET_USER_QUERY = {
        query: `
          query GetActiveUser($googleId: String!, $email: String!) {
            users(where: { 
              statusAktivasi: { equals: "aktif" },
              OR: [
                { googleId: { equals: $googleId } },
                { emailUser: { equals: $email } }
              ]
            }) {
              id
            }
          }
        `,
        variables: { googleId: user.uid, email: user.email },
      };

      const resUser = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify(GET_USER_QUERY),
      });

      const dataUser = await resUser.json();
      const backendUsers = dataUser?.data?.users;

      // 2. CEK & SOFT DELETE DI BACKEND
      if (backendUsers && backendUsers.length > 0) {
        const backendId = backendUsers[0].id;
        const SOFT_DELETE_MUTATION = {
          query: `
            mutation SoftDeleteUser($id: ID!) {
              updateUser(where: { id: $id }, data: { statusAktivasi: "nonaktif" }) {
                id
              }
            }
          `,
          variables: { id: backendId },
        };

        await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${firebaseToken}`,
          },
          body: JSON.stringify(SOFT_DELETE_MUTATION),
        });
      }

      // ======================================================
      // PERUBAHAN KRUSIAL DI BAWAH INI
      // ======================================================

      // 3. HAPUS CACHE GOOGLE SIGN-IN DULUAN! (Sebelum Firebase dibunuh)
      try {
        await GoogleSignin.revokeAccess(); 
        await GoogleSignin.signOut();      
      } catch (googleError) {
        console.log("Catatan: Gagal signout dari Google SDK", googleError);
      }

      // 4. BARU HARD DELETE DI FIREBASE
      await user.delete();

      // 5. GANTI ALERT JADI TOAST (Mencegah Force Close)
      if (Platform.OS === 'android') {
        ToastAndroid.show("Akun berhasil dihapus permanen.", ToastAndroid.SHORT);
      }

      // 6. TENDANG KE HALAMAN LOGIN
      router.replace("/login");

    } catch (error: any) {
      console.error("Error Delete Account:", error);
      setIsDeleting(false);

      if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Keamanan",
          "Silakan logout dan login kembali terlebih dahulu untuk memverifikasi identitas Anda sebelum menghapus akun."
        );
      } else {
        Alert.alert("Gagal Hapus Akun", error.message);
      }
    }
  };

  const handleDeletePrompt = () => {
    Alert.alert(
      "Hapus Akun",
      "Apakah Anda yakin ingin menghapus akun? Data profil Anda tidak akan ditampilkan lagi dan Anda akan dikeluarkan dari aplikasi.",
      [
        { text: "Batal", style: "cancel" },
        { text: "Ya, Hapus", style: "destructive", onPress: executeDelete },
      ]
    );
  };
  // ==========================================================

  const bulanMap: Record<string, string> = {
    Januari: "01",
    Februari: "02",
    Maret: "03",
    April: "04",
    Mei: "05",
    Juni: "06",
    Juli: "07",
    Agustus: "08",
    September: "09",
    Oktober: "10",
    November: "11",
    Desember: "12",
  };

  const bulanList = Object.keys(bulanMap);

  const tahunList = Array.from({ length: 200 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  const [bulan, setBulan] = useState("");
  const [tahun, setTahun] = useState("");

  const updateTanggalLahir = (b: string, t: string) => {
    setBulan(b);
    setTahun(t);
    if (b && t) {
      const bulanNum = bulanMap[b];
      handleChange("tanggalLahir", `${t}-${bulanNum}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profil Jemaat</Text>
      <Text style={styles.label}>Nama *</Text>
      <TextInput
        style={styles.input}
        value={form.nama}
        onChangeText={(v) => handleChange("nama", v)}
      />

      <Text style={styles.label}>Alamat *</Text>
      <TextInput
        style={styles.input}
        value={form.alamat}
        onChangeText={(v) => handleChange("alamat", v)}
      />

      <Text style={styles.label}>Kode Pos *</Text>
      <TextInput
        style={styles.input}
        value={form.kodePos}
        onChangeText={(v) => handleChange("kodePos", v)}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Nomor WA *</Text>
      <TextInput
        style={styles.input}
        value={form.noWa}
        onChangeText={(v) => handleChange("noWa", v)}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        value={form.email}
        onChangeText={(v) => handleChange("email", v)}
        keyboardType="email-address"
        editable={false}
      />

      <Text style={styles.label}>Jenis Kelamin *</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.jenisKelamin}
          onValueChange={(v) => handleChange("jenisKelamin", v)}
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
      <TextInput
        style={styles.input}
        value={form.pekerjaan}
        onChangeText={(v) => handleChange("pekerjaan", v)}
      />

      <Text style={styles.label}>Tanggal Lahir (Bulan & Tahun) *</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={[styles.pickerWrapper, { flex: 1 }]}>
          <Picker
            selectedValue={bulan}
            onValueChange={(v) => updateTanggalLahir(v, tahun)}
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
        >
          <Picker.Item label="Pilih status perkawinan..." value="" />
          <Picker.Item label="Belum Menikah" value="Belum Menikah" />
          <Picker.Item label="Menikah" value="Menikah" />
          <Picker.Item label="Cerai Hidup" value="Cerai Hidup" />
          <Picker.Item label="Cerai Mati" value="Cerai Mati" />
        </Picker>
      </View>

      <Text style={styles.label}>Status Keanggotaan Gereja *</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.statusKeanggotaan}
          onValueChange={(v) => handleChange("statusKeanggotaan", v)}
        >
          <Picker.Item label="Pilih status keanggotaan..." value="" />
          <Picker.Item label="Anggota" value="Anggota" />
          <Picker.Item label="Simpatisan" value="Simpatisan" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
        <Text style={styles.btnText}>Simpan</Text>
      </TouchableOpacity>

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
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },
});