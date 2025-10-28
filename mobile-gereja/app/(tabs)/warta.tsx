import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { API_URL } from "../../utils/api";
import { Ionicons } from "@expo/vector-icons";

interface WartaItem {
  id: string;
  judul: string;
  isiWarta: string;
  masaBerlaku?: string;
  tanggalPelaksanaan?: string;
  kategori?: { nama: string };
  file?: { url: string };
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Warta(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [warta, setWarta] = useState<WartaItem[]>([]);
  const [filteredData, setFilteredData] = useState<WartaItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchWarta = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              wartas(orderBy: { masaBerlaku: desc }) {
                id
                judul
                isiWarta
                masaBerlaku
                tanggalPelaksanaan
                kategori { nama }
                file { url }
              }
            }
          `,
        }),
      });

      const result = await res.json();
      if (result.errors)
        throw new Error(result.errors[0]?.message || "GraphQL Error");

      const data = result.data?.wartas || [];
      setWarta(data);
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
    fetchWarta();
  }, []);

  useEffect(() => {
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();

    let data = warta.filter((item) => {
      if (!item.masaBerlaku) return false;
      const d = new Date(item.masaBerlaku);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    if (searchQuery.trim() !== "") {
      const textData = searchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          item.judul?.toLowerCase().includes(textData) ||
          item.kategori?.nama?.toLowerCase().includes(textData) ||
          item.isiWarta?.toLowerCase().includes(textData)
      );
    }

    setFilteredData(data);
  }, [searchQuery, selectedDate, warta]);

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Memuat warta gereja...</Text>
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
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Warta</Text>

      <TextInput
        placeholder="Cari berdasarkan tanggal, topik, atau pengkhotbah"
        style={styles.input}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.datePickerContainer}>
        <TouchableOpacity onPress={handlePrevMonth}>
          <Ionicons name="chevron-back" size={20} color="#207163" />
        </TouchableOpacity>

        <Text style={styles.dateText}>
          {selectedDate.toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          })}
        </Text>

        <TouchableOpacity onPress={handleNextMonth}>
          <Ionicons name="chevron-forward" size={20} color="#207163" />
        </TouchableOpacity>
      </View>

      {filteredData.length > 0 ? (
        filteredData.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <View key={item.id} style={styles.cardContainer}>
              {/* Bagian utama kartu */}
              <View style={styles.cardRow}>
                <View style={styles.leftBox}>
                  {item.file?.url ? (
                    <Image
                      source={{
                        uri: `${API_URL.replace("/api/graphql", "")}${item.file.url}`,
                      }}
                      style={styles.image}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder} />
                  )}
                </View>

                <View style={styles.rightBox}>
                  <Text style={styles.category}>
                    {item.kategori?.nama || "Umum"}
                  </Text>
                  <Text style={styles.judul}>{item.judul}</Text>
                  <Text style={styles.tanggalPelaksanaan}>
                    {formatDate(item.tanggalPelaksanaan)}
                  </Text>

                  {/* Masa berlaku di pojok kanan bawah */}
                  <Text style={styles.masaBerlaku}>
                    {formatDate(item.masaBerlaku)}
                  </Text>
                </View>
              </View>

              {/* Bagian isi warta (expand) */}
              {isExpanded && (
                <Text style={styles.detail}>{item.isiWarta || "-"}</Text>
              )}

              <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                <Text style={styles.expandToggle}>
                  {isExpanded ? "▲ Tutup" : "▼ Baca Selengkapnya"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })
      ) : (
        <Text style={styles.emptyText}>Tidak ada warta untuk bulan ini.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", paddingHorizontal: 10 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#207163",
    marginVertical: 8,
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
  tanggalPelaksanaan: {
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
  detail: {
    padding: 8,
    fontSize: 12,
    color: "#333",
    backgroundColor: "#f8f8f8",
  },
  expandToggle: {
    color: "#207163",
    fontStyle: "italic",
    fontSize: 12,
    textAlign: "right",
    padding: 6,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
