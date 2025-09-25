import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView } from "react-native";
import { API_URL } from "../../utils/api";

interface Jadwal {
  id: string;
  tanggal: string;
  topik: string;
  pengkhotbah: string;
}

export default function Riwayat(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [riwayat, setRiwayat] = useState<Jadwal[]>([]);
  const [filteredData, setFilteredData] = useState<Jadwal[]>([]);

  const fetchRiwayat = async () => {
    try {
      const now = new Date().toISOString();

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              jadwalIbadahs(
                where: { tanggal: { lt: "${now}" } }
                orderBy: { tanggal: desc }
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
      console.log("Raw data riwayat:", JSON.stringify(result, null, 2));

      if (result.data?.jadwalIbadahs) {
        setRiwayat(result.data.jadwalIbadahs);
        setFilteredData(result.data.jadwalIbadahs);
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Riwayat Ibadah</Text>
      <TextInput
        placeholder="Cari riwayat"
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
        <Text>Tidak ada riwayat ibadah</Text>
      )}
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
