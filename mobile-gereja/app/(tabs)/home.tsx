import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../utils/api";
import { useNavigation } from "@react-navigation/native";

interface DetailIbadah {
  id: string;
  jam: string;
  banner?: { url: string };
}

interface Jadwal {
  id: string;
  tanggal: string;
  topik: string;
  detailIbadah: DetailIbadah[];
}

interface AyatHarian {
  book: string;
  chapter: string;
  verse: string;
  text: string;
}

interface JadwalRutin {
  id: string;
  namaIbadah: string;
  nama: string; // hari
  waktu: { id: string; jam: string }[];
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const [jadwalIbadah, setJadwalIbadah] = useState<DetailIbadah[]>([]);
  const [ayat, setAyat] = useState<AyatHarian | null>(null);
  const [jadwalRutin, setJadwalRutin] = useState<JadwalRutin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Ambil data Ayat Harian
  const fetchAyatHarian = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              ayatHarians(orderBy: { tanggal: desc }, take: 1) {
                book
                chapter
                verse
                text
              }
            }
          `,
        }),
      });
      const result = await res.json();
      if (result.errors) throw new Error(result.errors[0].message);
      setAyat(result.data.ayatHarians[0]);
    } catch (err: any) {
      console.error("Fetch Ayat Harian error:", err);
      setError("Gagal memuat ayat harian");
    }
  };

  // 🔹 Ambil data Jadwal Ibadah
  const fetchJadwal = async () => {
    try {
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
                take: 5
              ) {
                id
                tanggal
                detailIbadah {
                  id
                  jam
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
      const data: Jadwal[] = result.data?.jadwalIbadahs || [];
      const allDetails = data.flatMap((item) => item.detailIbadah);
      setJadwalIbadah(allDetails);
    } catch (err: any) {
      console.error("Fetch Jadwal error:", err);
      setError(err.message);
    }
  };

  // 🔹 Ambil data Jadwal Rutin dari Database
  const fetchJadwalRutin = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              jadwalRutins(orderBy: { namaIbadah: asc }) {
                id
                namaIbadah
                nama
                waktu {
                  id
                  jam
                }
              }
            }
          `,
        }),
      });

      const result = await res.json();
      if (result.errors)
        throw new Error(result.errors[0]?.message || "GraphQL Error");
      setJadwalRutin(result.data?.jadwalRutins || []);
    } catch (err: any) {
      console.error("Fetch Jadwal Rutin error:", err);
      setError("Gagal memuat jadwal rutin");
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchAyatHarian(), fetchJadwal(), fetchJadwalRutin()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#207163ff" />
        <Text>Memuat data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Home</Text>

      {/* 🔹 AYAT HARIAN */}
      <View style={styles.verseBox}>
        <Text style={styles.verseTitle}>AYAT HARIAN</Text>
        {ayat ? (
          <>
            <Text style={styles.verseText}>{ayat.text}</Text>
            <Text style={styles.verseRef}>
              - {ayat.book} {ayat.chapter}:{ayat.verse}
            </Text>
          </>
        ) : (
          <Text style={styles.verseText}>Tidak ada ayat harian tersedia.</Text>
        )}
      </View>

      {/* 🔹 JADWAL IBADAH */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Jadwal Ibadah</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("jadwalIbadah" as never)}
        >
          <Ionicons name="arrow-forward" size={20} color="#207163ff" />
        </TouchableOpacity>
      </View>

      {jadwalIbadah.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={jadwalIbadah}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.jadwalCard}>
              {item.banner?.url ? (
                <Image
                  source={{
                    uri: `${API_URL.replace("/api/graphql", "")}${
                      item.banner.url
                    }`,
                  }}
                  style={styles.jadwalImage}
                />
              ) : (
                <View
                  style={[styles.jadwalImage, { backgroundColor: "#000" }]}
                />
              )}
              <View style={styles.jamContainer}>
                <Text style={styles.jamText}>{item.jam || "-"}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>Tidak ada jadwal tersedia.</Text>
      )}

      {/* 🔹 IBADAH RUTIN */}
      <Text style={styles.sectionTitle2}>Ibadah Rutin</Text>

      <View style={styles.rutinContainer}>
        {jadwalRutin.length > 0 ? (
          jadwalRutin.flatMap((item) =>
            item.waktu.length > 0
              ? item.waktu
                  .sort((a, b) => a.jam.localeCompare(b.jam))
                  .map((w) => (
                    <View key={`${item.id}-${w.id}`} style={styles.rutinCard}>
                      <Text style={styles.rutinTitle}>{item.namaIbadah}</Text>
                      <Text style={styles.rutinSub}>
                        {item.nama}, {w.jam}
                      </Text>
                    </View>
                  ))
              : [
                  <View key={item.id} style={styles.rutinCard}>
                    <Text style={styles.rutinTitle}>{item.namaIbadah}</Text>
                    <Text style={styles.rutinSub}>{item.nama}, -</Text>
                  </View>,
                ]
          )
        ) : (
          <Text style={styles.emptyText}>Tidak ada jadwal rutin tersedia.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#207163",
    marginVertical: 10,
  },
  verseBox: {
    backgroundColor: "#207163",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  verseTitle: { color: "#fff", fontWeight: "bold", marginBottom: 5 },
  verseText: { color: "#fff", fontSize: 13, marginBottom: 5 },
  verseRef: { color: "#fff", fontWeight: "bold" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#207163" },
  jadwalCard: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  jadwalImage: {
    width: "100%",
    height: "70%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  jamContainer: {
    backgroundColor: "#207163",
    height: "30%",
    justifyContent: "center",
    alignItems: "center",
  },
  jamText: { color: "#fff", fontWeight: "bold" },
  sectionTitle2: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#207163",
    marginVertical: 10,
  },
  rutinContainer: { marginBottom: 30 },
  rutinCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 5,
    borderLeftColor: "#207163",
  },
  rutinTitle: { fontWeight: "bold", color: "#000" },
  rutinSub: { color: "#555" },
  emptyText: { textAlign: "center", color: "#777", marginVertical: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
