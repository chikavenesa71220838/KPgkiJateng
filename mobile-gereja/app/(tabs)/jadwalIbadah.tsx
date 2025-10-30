import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { API_URL } from "../../utils/api";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";

interface DetailIbadah {
  id: string;
  jam: string;
  pengkhotbah?: { nama: string };
  banner?: { url: string };
}

interface Jadwal {
  id: string;
  tanggal: string;
  topik: string;
  detailIbadah: DetailIbadah[];
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

export default function JadwalIbadah(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [filteredData, setFilteredData] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString().split("T")[0];

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              jadwalIbadahs(
                where: { tanggal: { gte: "${now}" } }
                orderBy: { tanggal: asc }
              ) {
                id
                tanggal
                topik
                detailIbadah {
                  id
                  jam
                  pengkhotbah {
                    nama
                  }
                  banner {
                    url
                  }
                }
              }
            }
          `,
        }),
      });

      const result = await res.json();
      if (result.errors)
        throw new Error(result.errors[0]?.message || "GraphQL Error");

      const data = result.data?.jadwalIbadahs || [];
      setJadwal(data);
      setFilteredData(data);
      setError(null);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //Filter otomatis ketika tanggal atau pencarian berubah
  useEffect(() => {
    const formatted = selectedDate.toISOString().split("T")[0];
    let data = jadwal.filter((item) => item.tanggal.startsWith(formatted));

    if (searchQuery.trim() !== "") {
      const textData = searchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          item.topik?.toLowerCase().includes(textData) ||
          item.detailIbadah.some((d) =>
            d.pengkhotbah?.nama.toLowerCase().includes(textData)
          )
      );
    }

    setFilteredData(data);
  }, [searchQuery, selectedDate, jadwal]);

  const handlePrevDate = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Memuat jadwal ibadah...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Gagal memuat data: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Jadwal Ibadah</Text>

      <TextInput
        placeholder="Cari berdasarkan topik atau pengkhotbah"
        style={styles.input}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.datePickerContainer}>
        <TouchableOpacity onPress={handlePrevDate}>
          <Ionicons name="chevron-back" size={24} color="#207163ff" />
        </TouchableOpacity>

        <Text style={styles.dateText}>
          {formatDate(selectedDate.toISOString())}
        </Text>

        <TouchableOpacity onPress={handleNextDate}>
          <Ionicons name="chevron-forward" size={24} color="#207163ff" />
        </TouchableOpacity>
      </View>

      {filteredData.length > 0 ? (
        filteredData.map((item) =>
          item.detailIbadah.map((d) => (
            <View key={d.id} style={styles.card}>
              {d.banner?.url ? (
                <Image
                  source={{
                    uri: `${API_URL.replace("/api/graphql", "")}${d.banner.url}`,
                  }}
                  style={styles.banner}
                />
              ) : (
                <View style={[styles.banner, { backgroundColor: "#000" }]} />
              )}
              <Text style={styles.topik}>{item.topik || "Tanpa Topik"}</Text>
              <Text style={styles.text}>{formatDate(item.tanggal)}</Text>
              <Text style={styles.text}>
                <Text style={styles.text}>Pukul </Text>
                {d.jam || "-"} WIB
              </Text>
              <Text style={styles.text}>{d.pengkhotbah?.nama || "-"}</Text>
            </View>
          ))
        )
      ) : (
        <Text style={styles.emptyText}>Tidak ada jadwal tersedia.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#207163ff",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#DDF2F2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { textAlign: "center", color: "#666", marginTop: 20 },
  card: {
    backgroundColor: "#36c0c0ff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  banner: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginBottom: 10,
  },
  topik: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 16,
    marginBottom: 6,
  },
  text: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 2,
  },
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});
