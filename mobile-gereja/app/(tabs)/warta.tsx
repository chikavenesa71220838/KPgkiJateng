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

const formatMonthYear = (date: Date) =>
  date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Warta Gereja</Text>

      <TextInput
        placeholder="Cari berdasarkan judul, isi, atau kategori"
        style={styles.input}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.datePickerContainer}>
        <TouchableOpacity onPress={handlePrevMonth}>
          <Ionicons name="chevron-back" size={24} color="#207163ff" />
        </TouchableOpacity>

        <Text style={styles.dateText}>{formatMonthYear(selectedDate)}</Text>

        <TouchableOpacity onPress={handleNextMonth}>
          <Ionicons name="chevron-forward" size={24} color="#207163ff" />
        </TouchableOpacity>
      </View>

      {filteredData.length > 0 ? (
        filteredData.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <View key={item.id} style={styles.card}>
              {item.file?.url ? (
                <Image
                  source={{
                    uri: `${API_URL.replace("/api/graphql", "")}${item.file.url}`,
                  }}
                  style={styles.banner}
                />
              ) : (
                <View style={[styles.banner, { backgroundColor: "#000" }]} />
              )}
              <Text style={styles.topik}>{item.judul}</Text>
              <Text style={styles.text}>
                <Text style={styles.label}>Kategori: </Text>
                {item.kategori?.nama || "-"}
              </Text>

              <Text style={styles.text}>
                <Text style={styles.label}>Masa Berlaku: </Text>
                {formatDate(item.masaBerlaku)}
              </Text>

              <Text style={styles.text}>
                <Text style={styles.label}>Tanggal Kegiatan: </Text>
                {formatDate(item.tanggalPelaksanaan)}
              </Text>

              {isExpanded && (
                <Text style={[styles.text, { marginTop: 6 }]}>
                  {item.isiWarta || "-"}
                </Text>
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
  label: {
    fontWeight: "bold",
    color: "#fff",
  },
  expandToggle: {
    color: "#f9f9f9",
    fontStyle: "italic",
    fontSize: 13,
    marginTop: 10,
    textAlign: "right",
  },
});
