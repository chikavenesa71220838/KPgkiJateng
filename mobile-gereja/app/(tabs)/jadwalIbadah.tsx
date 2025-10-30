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

  // useEffect(() => {
  //   const formatted = selectedDate.toISOString().split("T")[0];
  //   let data = jadwal.filter((item) => item.tanggal.startsWith(formatted));

  //   if (searchQuery.trim() !== "") {
  //     const textData = searchQuery.toLowerCase();
  //     data = data.filter(
  //       (item) =>
  //         item.topik?.toLowerCase().includes(textData) ||
  //         item.detailIbadah.some((d) =>
  //           d.pengkhotbah?.nama.toLowerCase().includes(textData)
  //         )
  //     );
  //   }

  //   setFilteredData(data);
  // }, [searchQuery, selectedDate, jadwal]);

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50, paddingLeft:7, paddingRight:7, }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Jadwal Ibadah</Text>

      {/* <TextInput
        placeholder="Cari berdasarkan topik atau pengkhotbah"
        style={styles.input}
        value={searchQuery}
        onChangeText={setSearchQuery}
      /> */}

      <View style={styles.datePickerContainer}>
        <TouchableOpacity onPress={handlePrevDate}>
          <Ionicons name="chevron-back" size={20} color="#207163" />
        </TouchableOpacity>

        <Text style={styles.dateText}>
          {formatDate(selectedDate.toISOString())}
        </Text>

        <TouchableOpacity onPress={handleNextDate}>
          <Ionicons name="chevron-forward" size={20} color="#207163" />
        </TouchableOpacity>
      </View>

      {filteredData.length > 0 ? (
        filteredData.map((item) =>
          item.detailIbadah.map((d) => (
            <View key={d.id} style={styles.cardContainer}>
              <View style={styles.cardRow}>
                {/* Gambar kiri */}
                <View style={styles.leftBox}>
                  {d.banner?.url ? (
                    <Image
                      source={{
                        uri: `${API_URL.replace("/api/graphql", "")}${d.banner.url}`,
                      }}
                      style={styles.image}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder} />
                  )}
                </View>

                {/* Informasi kanan */}
                <View style={styles.rightBox}>
                  <Text style={styles.category}>
                    {item.topik || "Tanpa Topik"}
                  </Text>
                  <Text style={styles.judul}>{formatDate(item.tanggal)}</Text>
                  <Text style={styles.isiCard}>
                    {d.jam || "-"} WIB
                  </Text>
                  <Text style={styles.isiCard}>
                    {d.pengkhotbah?.nama || "-"}
                  </Text>
                </View>
              </View>
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
  container: { backgroundColor: "#fff", paddingHorizontal: 10 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#207163",
    marginVertical: 10,
  },
  input: {
    backgroundColor: "#E9F5F4",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 12,
  },
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    height: 90,
    borderRadius: 10,
    overflow: "hidden",
  },
  leftBox: {
    flex: 1,
    backgroundColor: "#000",
  },
  rightBox: {
    flex: 1.3,
    backgroundColor: "#1A6969",
    padding: 8,
    justifyContent: "center",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  category: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 2,
  },
  judul: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  isiCard: {
    color: "#fff",
    fontSize: 11,
  },
  masaBerlaku: {
    position: "absolute",
    bottom: 6,
    right: 8,
    color: "#fff",
    fontSize: 10,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
