import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { API_URL } from "../../utils/api";
interface DetailIbadah {
  id: string;
  jam: string;
  pengkhotbah: string;
  banner?: { url: string };
}

interface Jadwal {
  id:string;
  tanggal: string;
  topik: string;
  detailIbadah: DetailIbadah[];
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

export default function Riwayat(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [riwayat, setRiwayat] = useState<Jadwal[]>([]);
  const [filteredData, setFilteredData] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true); // Tambahkan loading state
  const [error, setError] = useState<string | null>(null); // Tambahkan error state

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString().split("T")[0];

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 2. Perbaiki Query GraphQL
          query: `
            query {
              jadwalIbadahs(
                where: { tanggal: { lt: "${now}" } }
                orderBy: { tanggal: desc }
              ) {
                id
                tanggal
                topik
                detailIbadah {
                  id
                  jam
                  pengkhotbah
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
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || "GraphQL Error");
      }

      const data = result.data?.jadwalIbadahs || [];
      setRiwayat(data);
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
    fetchRiwayat();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const textData = searchQuery.toLowerCase();
      const dataBaru = riwayat.filter(
        (item) =>
          item.tanggal.toLowerCase().includes(textData) ||
          item.topik?.toLowerCase().includes(textData) ||
          item.detailIbadah.some((d) =>
            d.pengkhotbah?.toLowerCase().includes(textData)
          )
      );
      setFilteredData(dataBaru);
    } else {
      setFilteredData(riwayat);
    }
  }, [searchQuery, riwayat]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Memuat riwayat ibadah...</Text>
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
      <Text style={styles.title}>Riwayat Ibadah</Text>
      <TextInput
        placeholder="Cari topik atau pengkhotbah..."
        style={styles.input}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {/* 4. Ganti FlatList dengan .map() dan adopsi UI dari JadwalIbadah */}
      {filteredData.length > 0 ? (
        filteredData.map((item) => {
          const bannerUrl = item.detailIbadah[0]?.banner?.url;

          if (bannerUrl) {
            return (
              <ImageBackground
                key={item.id}
                source={{ uri: `${API_URL.replace("/api/graphql", "")}${bannerUrl}` }}
                style={styles.cardBackground}
                imageStyle={{ borderRadius: 12 }}
              >
                <View style={styles.overlay}>
                  <Text style={styles.dateOnImage}>📅 {formatDate(item.tanggal)}</Text>
                  <Text style={styles.topikOnImage}>🕊️ {item.topik || "Tanpa Topik"}</Text>

                  {item.detailIbadah.map((d) => (
                    <View key={d.id} style={styles.detailCardOnImage}>
                      <Text style={styles.textOnImage}>Jam: {d.jam || "-"}</Text>
                      <Text style={styles.textOnImage}>🙌 Pengkhotbah: {d.pengkhotbah || "-"}</Text>
                    </View>
                  ))}
                </View>
              </ImageBackground>
            );
          }

          return (
            <View key={item.id} style={styles.card}>
              <Text style={styles.date}>📅 {formatDate(item.tanggal)}</Text>
              <Text style={styles.topik}>🕊️ {item.topik || "Tanpa Topik"}</Text>

              {item.detailIbadah.map((d) => (
                <View key={d.id} style={styles.detailCard}>
                  <Text>Jam: {d.jam || "-"}</Text>
                  <Text>🙌 Pengkhotbah: {d.pengkhotbah || "-"}</Text>
                </View>
              ))}
            </View>
          );
        })
      ) : (
        <Text style={styles.emptyText}>Tidak ada riwayat untuk ditampilkan.</Text>
      )}
    </ScrollView>
  );
}

// 5. Gunakan Stylesheet yang sama dengan JadwalIbadah
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F7F8FA" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 16, color: "#333" },
  input: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, fontSize: 16,
  },
  emptyText: { textAlign: "center", marginTop: 24, color: "#666", fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#F7F8FA" },
  card: {
    backgroundColor: "#FFFFFF", padding: 16, borderRadius: 12, marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1,
    shadowRadius: 3, elevation: 3,
  },
  date: { fontWeight: "bold", marginBottom: 4, fontSize: 16, color: "#007AFF" },
  topik: { fontStyle: "italic", color: '#555' },
  detailCard: {
    backgroundColor: "#F9F9F9", borderRadius: 8, padding: 12, marginTop: 10,
    borderLeftWidth: 3, borderLeftColor: '#007AFF',
  },
  cardBackground: {
    minHeight: 150, marginBottom: 12, justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 12, padding: 16,
  },
  dateOnImage: {
    fontWeight: "bold", marginBottom: 4, fontSize: 16, color: "#FFFFFF",
    textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10,
  },
  topikOnImage: {
    fontStyle: "italic", color: '#E0E0E0',
    textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10,
  },
  detailCardOnImage: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 8, padding: 12, marginTop: 10,
    borderLeftWidth: 3, borderLeftColor: '#4D9FFF',
  },
  textOnImage: {
    color: '#FFFFFF',
  },
});