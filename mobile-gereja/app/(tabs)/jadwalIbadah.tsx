import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  ImageBackground,
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
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [filteredData, setFilteredData] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek); // Minggu ini (hari Minggu)
      const endOfNextWeek = new Date(startOfWeek);
      endOfNextWeek.setDate(startOfWeek.getDate() + 13); // Akhir minggu depan (Sabtu minggu depan)

      // Format ke yyyy-mm-dd
      const now = startOfWeek.toISOString().split("T")[0];
      const next = endOfNextWeek.toISOString().split("T")[0];

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              jadwalIbadahs(
                where: { tanggal: { gte: "${now}", lte: "${next}" } }
                orderBy: { tanggal: asc }
              ) {
                id
                tanggal
                topik
                detailIbadah {
                  id
                  jam
                  pengkhotbah { nama }
                  banner { url }
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

      if (data.length > 0) {
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        // cari jadwal pertama yang tanggalnya >= hari ini
        const nextUpcoming = data.find((item: Jadwal) => {
          const itemDate = new Date(item.tanggal);
          itemDate.setHours(0, 0, 0, 0);
          return itemDate.getTime() >= todayDate.getTime();
        });

        if (nextUpcoming) {
          setSelectedDate(new Date(nextUpcoming.tanggal));
        } else {
          setSelectedDate(new Date(data[data.length - 1].tanggal));
        }
      } else {
        setSelectedDate(today);
      }

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

  const handlePrevDate = () => {
    if (!selectedDate) return;
    const prevDate = getAdjacentDate(selectedDate, -1);
    if (!prevDate) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (prevDate.getTime() < today.getTime()) return;

    setSelectedDate(prevDate);
  };

  const handleNextDate = () => {
    if (!selectedDate) return;
    const nextDate = getAdjacentDate(selectedDate, 1);
    if (nextDate) setSelectedDate(nextDate);
  };

  const getAdjacentDate = (
    currentDate: Date,
    direction: 1 | -1
  ): Date | null => {
    const sortedDates = jadwal
      .map((j) => new Date(j.tanggal))
      .sort((a, b) => a.getTime() - b.getTime());

    const index = sortedDates.findIndex(
      (d) => d.toDateString() === currentDate.toDateString()
    );

    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < sortedDates.length) {
      return sortedDates[newIndex];
    }
    return null;
  };

  const isPrevDisabled = (() => {
    if (!selectedDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate.getTime() <= today.getTime();
  })();

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

  if (!selectedDate) {
    return (
      <View style={styles.center}>
        <Text>Tidak ada jadwal untuk minggu ini.</Text>
      </View>
    );
  }

const formattedSelected = selectedDate.toISOString().split("T")[0];
  const selectedJadwal = filteredData
    .filter((item) => item.tanggal.startsWith(formattedSelected))
    .sort((a, b) => {
      //ambil jam pertama dari detailIbadah
      const jamA = a.detailIbadah[0]?.jam || "00:00";
      const jamB = b.detailIbadah[0]?.jam || "00:00";
      return jamA.localeCompare(jamB);
    });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 50,
        paddingLeft: 7,
        paddingRight: 7,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Jadwal Ibadah</Text>

      {/* Date Navigation */}
      <View style={styles.datePickerContainer}>
        <TouchableOpacity onPress={handlePrevDate} disabled={isPrevDisabled}>
          <Ionicons
            name="chevron-back"
            size={20}
            color={isPrevDisabled ? "#ccc" : "#207163"}
          />
        </TouchableOpacity>

        <Text style={styles.dateText}>
          {formatDate(selectedDate.toISOString())}
        </Text>

        <TouchableOpacity onPress={handleNextDate}>
          <Ionicons name="chevron-forward" size={20} color="#207163" />
        </TouchableOpacity>
      </View>

      {selectedJadwal.length > 0 ? (
        selectedJadwal.map((item) =>
          item.detailIbadah
            .slice()
            .sort((a, b) => a.jam.localeCompare(b.jam))
            .map((d) => (
              <View key={d.id} style={styles.cardContainer}>
                <View style={styles.cardRow}>
                  {/* Gambar kiri */}
                  <View style={styles.leftBox}>
                    {d.banner?.url ? (
                      <ImageBackground
                        source={{
                          uri: `${API_URL.replace("/api/graphql", "")}${
                            d.banner.url
                          }`,
                        }}
                        style={styles.imageBackground}
                        blurRadius={12}
                      >
                        <Image
                          source={{
                            uri: `${API_URL.replace("/api/graphql", "")}${
                              d.banner.url
                            }`,
                          }}
                          style={styles.imageForeground}
                        />
                      </ImageBackground>
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
                    <Text style={styles.isiCard}>{d.jam || "-"} WIB</Text>
                    <Text style={styles.isiCard}>
                      {d.pengkhotbah?.nama || "-"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
        )
      ) : (
        <Text style={styles.emptyText}>Tidak ada jadwal untuk hari ini.</Text>
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
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "stretch",
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
    height: undefined,
    resizeMode: "cover",
    aspectRatio: 1.5,
    maxHeight: 120,
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
    flexShrink: 1,
  },
  isiCard: {
    color: "#fff",
    fontSize: 11,
    flexShrink: 1,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  imageBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  imageForeground: {
    width: "100%",
    aspectRatio: 1.5,
    resizeMode: "cover",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
});
