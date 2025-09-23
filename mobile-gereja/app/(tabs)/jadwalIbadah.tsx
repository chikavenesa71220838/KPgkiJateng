import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TextInput,
  Button,
  Alert,
  Platform,
} from "react-native";

const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000/api/graphql"
    : "http://localhost:3000/api/graphql";

interface Jadwal {
  id: string;
  tanggal: string;
  topik: string;
  pengkhotbah: string;
}

function getWeekRange(date: Date) {
  const day = date.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

export default function JadwalIbadah(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [filteredData, setFilteredData] = useState<Jadwal[]>([]);

  const [tanggal, setTanggal] = useState<string>("");
  const [topik, setTopik] = useState<string>("");
  const [pengkhotbah, setPengkhotbah] = useState<string>("");

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              jadwalIbadahs(orderBy: { tanggal: asc }) {
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

      if (result.data && result.data.jadwalIbadahs) {
        const now = new Date();
        const thisWeek = getWeekRange(now);
        const nextWeekStart = new Date(thisWeek.start);
        nextWeekStart.setDate(thisWeek.start.getDate() + 7);
        const nextWeekEnd = new Date(thisWeek.end);
        nextWeekEnd.setDate(thisWeek.end.getDate() + 7);

        const filtered = result.data.jadwalIbadahs.filter((item: Jadwal) => {
          const tgl = new Date(item.tanggal);
          return (
            (tgl >= thisWeek.start && tgl <= thisWeek.end) ||
            (tgl >= nextWeekStart && tgl <= nextWeekEnd)
          );
        });

        setJadwal(filtered);
        setFilteredData(filtered);
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
          tanggal: "${tanggal}"
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
    <View style={styles.container}>
      <TextInput
        placeholder="Cari jadwal"
        style={styles.input}
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />

      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Tanggal: {item.tanggal.split("T")[0]}</Text>
            <Text>Topik: {item.topik}</Text>
            <Text>Pengkhotbah: {item.pengkhotbah}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>Tidak ada jadwal minggu ini & depan</Text>}
      />

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
    </View>
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
});
