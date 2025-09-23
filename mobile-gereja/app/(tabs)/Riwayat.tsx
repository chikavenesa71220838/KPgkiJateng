import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
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

export default function Riwayat(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [riwayat, setRiwayat] = useState<Jadwal[]>([]);
  const [filteredData, setFilteredData] = useState<Jadwal[]>([]);

  const fetchRiwayat = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              jadwalIbadahs {
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

        const past = result.data.jadwalIbadahs.filter((item: Jadwal) => {
          const tgl = new Date(item.tanggal);
          return tgl < now;
        });

        setRiwayat(past);
        setFilteredData(past);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const textData = searchQuery.toLowerCase();
      const dataBaru = riwayat.filter(
        (item) =>
          item.tanggal.toLowerCase().includes(textData) ||
          item.topik.toLowerCase().includes(textData) ||
          item.pengkhotbah.toLowerCase().includes(textData)
      );
      setFilteredData(dataBaru);
    } else {
      setFilteredData(riwayat);
    }
  }, [searchQuery, riwayat]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Cari riwayat"
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
        ListEmptyComponent={<Text>Tidak ada riwayat ibadah</Text>}
      />
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
