import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function ProfilScreen() {
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
      const bulanNum = bulanMap[b]; // ambil angka bulan
      handleChange("tanggalLahir", `${t}-${bulanNum}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
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
        style={styles.btnHapus}
        onPress={() =>
          setForm({
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
          })
        }
      >
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
});
