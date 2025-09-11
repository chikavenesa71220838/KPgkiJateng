import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";

export default function ProfilScreen() {
  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    kodePos: "",
    email: "",
    jenisKelamin: "",
    pendidikan: "",
    pekerjaan: "",
    statusKawin: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSave = () => {
    console.log("Data tersimpan:", form);
    alert("Profil berhasil disimpan!");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nama *</Text>
      <TextInput style={styles.input} value={form.nama} onChangeText={(v) => handleChange("nama", v)} />

      <Text style={styles.label}>Alamat *</Text>
      <TextInput style={styles.input} value={form.alamat} onChangeText={(v) => handleChange("alamat", v)} />

      <Text style={styles.label}>Kode Pos *</Text>
      <TextInput style={styles.input} value={form.kodePos} onChangeText={(v) => handleChange("kodePos", v)} keyboardType="numeric" />

      <Text style={styles.label}>Email *</Text>
      <TextInput style={styles.input} value={form.email} onChangeText={(v) => handleChange("email", v)} keyboardType="email-address" />

      <Text style={styles.label}>Jenis Kelamin *</Text>
      <TextInput style={styles.input} value={form.jenisKelamin} onChangeText={(v) => handleChange("jenisKelamin", v)} placeholder="Laki-laki / Perempuan" />

      <Text style={styles.label}>Pendidikan Terakhir *</Text>
      <TextInput style={styles.input} value={form.pendidikan} onChangeText={(v) => handleChange("pendidikan", v)} />

      <Text style={styles.label}>Pekerjaan *</Text>
      <TextInput style={styles.input} value={form.pekerjaan} onChangeText={(v) => handleChange("pekerjaan", v)} />

      <Text style={styles.label}>Status Perkawinan *</Text>
      <TextInput style={styles.input} value={form.statusKawin} onChangeText={(v) => handleChange("statusKawin", v)} placeholder="Belum menikah / Menikah" />

      <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
        <Text style={styles.btnText}>Simpan</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnHapus} onPress={() => setForm({
        nama: "",
        alamat: "",
        kodePos: "",
        email: "",
        jenisKelamin: "",
        pendidikan: "",
        pekerjaan: "",
        statusKawin: "",
        })}>
        <Text style={styles.btnText}>Hapus</Text>
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
  btnSave: {
    backgroundColor: "#1E90FF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },

  btnHapus: {
    backgroundColor: "#FF6347",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40,
  },

  btnText: { color: "#fff", fontWeight: "bold" },
});