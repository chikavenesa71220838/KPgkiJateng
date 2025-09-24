import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import { API_URL } from "../../utils/api";

interface Jadwal {
  id: string;
  tanggal: string;
  topik: string;
  pengkhotbah: string;
}

// ✅ helper hitung minggu ini & minggu depan
function getRangeForQuery() {
  const today = new Date();

  const day = today.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const endNextWeek = new Date(monday);
  endNextWeek.setDate(monday.getDate() + 13);
  endNextWeek.setHours(23, 59, 59, 999);

  return {
    start: monday.toISOString(),
    end: endNextWeek.toISOString(),
  };
}

export default function JadwalIbadah(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [filteredData, setFilteredData] = useState<Jadwal[]>([]);

  const [tanggal, setTanggal] = useState("");
  const [topik, setTopik] = useState("");
  const [pengkhotbah, setPengkhotbah] = useState("");

  const fetchData = async () => {
    try {
      const { start, end } = getRangeForQuery();

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              jadwalIbadahs(
                where: { tanggal: { gte: "${start}", lte: "${end}" } }
                orderBy: { tanggal: asc }
              ) {
                id
                tanggal
                topik
                pengkhotbah
              }
            }
          `,
        }),
      });

      const result = await res.json();

      if (result.data?.jadwalIbadahs) {
        setJadwal(result.data.jadwalIbadahs);
        setFilteredData(result.data.jadwalIbadahs);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const textData = searchQuery.toLowerCase();
      const dataBaru = jadwal.filter(
        (item) =>
          item.tanggal.toLowerCase().includes(textData) ||
          item.topik.toLowerCase().includes(textData) ||
          item.pengkhotbah.toLowerCase().includes(textData)
      );
      setFilteredData(dataBaru);
    } else {
      setFilteredData(jadwal);
    }
  }, [searchQuery, jadwal]);

  const tambahJadwal = async () => {
    if (!tanggal || !topik || !pengkhotbah) {
      Alert.alert("Error", "Semua field harus diisi!");
      return;
    }

    const mutation = `
      mutation {
        createJadwalIbadah(data: {
          tanggal: "${tanggal}T00:00:00.000Z"
          topik: "${topik}"
          pengkhotbah: "${pengkhotbah}"
        }) {
          id
          tanggal
          topik
          pengkhotbah
        }
      }
    `;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mutation }),
      });

      const json = await res.json();
      if (json.data?.createJadwalIbadah) {
        Alert.alert("Sukses", "Jadwal berhasil ditambahkan!");
        fetchData();
        setTanggal("");
        setTopik("");
        setPengkhotbah("");
      } else {
        Alert.alert("Gagal", "Terjadi kesalahan saat menambah data");
      }
    } catch (error) {
      console.error("Error creating jadwal:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Jadwal Ibadah</Text>
      <TextInput
        placeholder="Cari jadwal"
        style={styles.input}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredData.length > 0 ? (
        filteredData.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text>Tanggal: {item.tanggal.split("T")[0]}</Text>
            <Text>Topik: {item.topik}</Text>
            <Text>Pengkhotbah: {item.pengkhotbah}</Text>
          </View>
        ))
      ) : (
        <Text>Tidak ada jadwal minggu ini & depan</Text>
      )}

      <TextInput
        placeholder="Tanggal (YYYY-MM-DD)"
        style={styles.input}
        value={tanggal}
        onChangeText={setTanggal}
      />
      <TextInput
        placeholder="Topik"
        style={styles.input}
        value={topik}
        onChangeText={setTopik}
      />
      <TextInput
        placeholder="Pengkhotbah"
        style={styles.input}
        value={pengkhotbah}
        onChangeText={setPengkhotbah}
      />
      <Button title="Tambah Jadwal" onPress={tambahJadwal} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#ADD8FF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 20 },
});
