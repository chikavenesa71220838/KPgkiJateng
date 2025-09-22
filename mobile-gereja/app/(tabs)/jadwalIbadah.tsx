import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, FlatList, TextInput, Button, Alert } from "react-native";

const API_URL = "http://10.0.2.2:3000/api/graphql";

interface Jadwal {
  id: string;
  tanggal: string;
  topik: string;
  pengkhotbah: string;
}

export default function JadwalIbadah(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [filteredData, setFilteredData] = useState<Jadwal[]>([]);

  const [tanggal, setTanggal] = useState<string>("");
  const [topik, setTopik] = useState<string>("");
  const [pengkhotbah, setPengkhotbah] = useState<string>("");

  const fetchData = async () => {
    const query = `
      query {
        jadwalIbadahs {
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
        body: JSON.stringify({ query }),
      });

      const json = await res.json();
      const data: Jadwal[] = json.data?.jadwalIbadahs || [];
      setJadwal(data);
      setFilteredData(data);
    } catch (error) {
      console.error("Error fetching jadwal:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const textData = searchQuery.toLowerCase();
      const dataBaru = jadwal.filter((item) =>
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Tanggal: {new Date(item.tanggal).toLocaleDateString()}</Text>
            <Text>Topik: {item.topik}</Text>
            <Text>Pengkhotbah: {item.pengkhotbah}</Text>
          </View>
        )}
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
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginBottom: 12 },
  card: { backgroundColor: "#ADD8FF", padding: 12, borderRadius: 10, marginBottom: 10 },
});
