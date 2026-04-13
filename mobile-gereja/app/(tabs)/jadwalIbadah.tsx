import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  ImageBackground,
  Linking,
  RefreshControl,
} from "react-native";
import { API_URL } from "../../utils/api";
import { fetchJadwalIbadahRangeAPI } from "../../services/profileAPI";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Colors, FontSize, Layout, Shadows } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";

interface DetailIbadah {
  id: string;
  jam: string;
  pengkhotbah?: { nama: string };
  banner?: { url: string };
  url?: string;
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

// Format ke yyyy-mm-dd
const formatYMD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function JadwalIbadah(): React.ReactElement {
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [filteredData, setFilteredData] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const uniqueSortedDates = React.useMemo(() => {
    const allDates = jadwal.map((j) => new Date(j.tanggal));
    const uniqueDateTimes = [
      ...new Set(allDates.map((d) => d.setHours(0, 0, 0, 0))),
    ];

    return uniqueDateTimes
      .map((t) => new Date(t))
      .sort((a, b) => a.getTime() - b.getTime());
  }, [jadwal]);

  const fetchData = async () => {
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 14);

      const now = formatYMD(today);
      const next = formatYMD(endDate);

      const data = await fetchJadwalIbadahRangeAPI(now, next);

      setJadwal(data);
      setFilteredData(data);

      if (data.length > 0) {
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

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
    direction: 1 | -1,
  ): Date | null => {
    const index = uniqueSortedDates.findIndex(
      (d) => d.toDateString() === currentDate.toDateString(),
    );

    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < uniqueSortedDates.length) {
      return uniqueSortedDates[newIndex];
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
        {/* UBAH WARNA LOADING */}
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 8, color: Colors.textMuted }}>
          Memuat jadwal ibadah...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.danger }}>Gagal memuat data: {error}</Text>
      </View>
    );
  }

  if (!selectedDate) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.textMuted }}>
          Tidak ada jadwal untuk minggu ini.
        </Text>
      </View>
    );
  }

  const formattedSelected = formatYMD(selectedDate);
  const selectedJadwal = filteredData
    .filter((item) => item.tanggal.startsWith(formattedSelected))
    .sort((a, b) => {
      const jamA = a.detailIbadah[0]?.jam || "00:00";
      const jamB = b.detailIbadah[0]?.jam || "00:00";
      return jamA.localeCompare(jamB);
    });

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 50,
          paddingTop: 10,
          paddingHorizontal: Layout.paddingSmall,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
        }
      >
        <Text style={styles.title}>Jadwal Ibadah</Text>

        {/* Date Navigation */}
        <View style={styles.datePickerContainer}>
          <TouchableOpacity
            onPress={handlePrevDate}
            disabled={isPrevDisabled}
            style={styles.navButton}
          >
            {/* UBAH WARNA ICON */}
            <Ionicons
              name="chevron-back"
              size={20}
              color={isPrevDisabled ? Colors.placeholder : Colors.primary}
            />
          </TouchableOpacity>

          <Text style={styles.dateText}>
            {formatDate(selectedDate.toISOString())}
          </Text>

          <TouchableOpacity onPress={handleNextDate} style={styles.navButton}>
            {/* UBAH WARNA ICON */}
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {selectedJadwal.length > 0 ? (
          selectedJadwal.map((item) =>
            item.detailIbadah
              .slice()
              .sort((a, b) => a.jam.localeCompare(b.jam))
              .map((d) => (
                <TouchableOpacity
                  key={d.id}
                  activeOpacity={0.7}
                  onPress={async () => {
                    if (d.url) {
                      const supported = await Linking.canOpenURL(d.url);
                      if (supported) {
                        await Linking.openURL(d.url);
                      }
                    }
                  }}
                >
                  <View style={styles.cardContainer}>
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
                        <View style={styles.tagContainer}>
                          <Text style={styles.tagText}>
                            {item.topik || "Umum"}
                          </Text>
                        </View>

                        <Text style={styles.judul}>
                          {formatDate(item.tanggal)}
                        </Text>

                        <View style={styles.infoRow}>
                          <Ionicons
                            name="time-outline"
                            size={16}
                            color={Colors.textMuted}
                          />
                          <Text style={styles.isiCard}>{d.jam || "-"} WIB</Text>
                        </View>

                        <View style={styles.infoRow}>
                          <Ionicons
                            name="person-outline"
                            size={16}
                            color={Colors.textMuted}
                          />
                          <Text style={styles.isiCard} numberOfLines={1}>
                            {d.pengkhotbah?.nama || "-"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )),
          )
        ) : (
          <Text style={styles.emptyText}>Tidak ada jadwal untuk hari ini.</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Layout.paddingSmall,
  },

  title: {
    fontSize: FontSize.h1,
    fontWeight: "bold",
    color: Colors.primary,
    marginVertical: Layout.gap,
  },

  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 50,
    marginBottom: 20,
    ...Shadows.shdows,
  },

  dateText: {
    fontSize: FontSize.body,
    fontWeight: "bold",
    color: Colors.text,
  },

  navButton: {
    padding: 4,
  },

  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: Layout.radiusLarge,
    marginBottom: 16,
    // borderWidth: 1,
    // borderColor: Colors.border,
    ...Shadows.shdows,
    overflow: "hidden",
    elevation: 4,
  },

  cardRow: {
    flexDirection: "row",
    borderRadius: Layout.radiusLarge,
    overflow: "hidden",
    alignItems: "stretch",
  },

  leftBox: {
    width: 120,
    flex: 1,
    backgroundColor: Colors.black,
    alignItems: "center",
    position: "relative",
  },

  rightBox: {
    flex: 1.3,
    backgroundColor: Colors.white,
    padding: Layout.paddingSmall,
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

  tagContainer: {
    backgroundColor: Colors.muda,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },

  category: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: FontSize.small,
    marginBottom: 2,
  },

  judul: {
    color: Colors.white,
    fontSize: FontSize.custom.titleCard,
    fontWeight: "700",
    marginBottom: 2,
    flexShrink: 1,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
    marginBottom: 4,
    gap: 0,
  },
  isiCard: {
    color: Colors.textMuted,
    fontSize: FontSize.custom.dateCard,
    flexShrink: 1,
    fontWeight: "500",
  },

  emptyText: {
    textAlign: "center",
    color: Colors.textMuted,
    marginTop: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  imageBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  tagText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.inputBackground,
    justifyContent: "center",
    alignItems: "center",
  },

  imageForeground: {
    width: "100%",
    aspectRatio: 1.5,
    resizeMode: "cover",
    borderTopLeftRadius: Layout.radiusLarge,
    borderBottomLeftRadius: Layout.radiusLarge,
  },
});
