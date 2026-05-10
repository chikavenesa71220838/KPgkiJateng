import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../utils/api";
import { fetchAyatHarianAPI, fetchJadwalIbadahUpcomingAPI, fetchJadwalRutinAPI } from "../../services/profileAPI";
import { useNavigation } from "@react-navigation/native";
import { Colors, FontSize, Layout, Shadows } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";

// 🔹 Import listener auth untuk mendeteksi user login secara realtime
import { listenToAuth } from "../../services/authGoogle";

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

// 🔹 Fungsi Pembantu: Mengambil singkatan hari (SEN, SEL, dst)
const getSingkatanHari = (dateString?: string) => {
  if (!dateString) return "HARI";
  const date = new Date(dateString);
  const hari = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];
  return hari[date.getDay()];
};

export default function HomeScreen() {
  const navigation = useNavigation();
  // Gunakan tipe any sementara di state untuk menghindari bentrok saat Hot Reload
  const [jadwalIbadah, setJadwalIbadah] = useState<any[]>([]);
  const [ayat, setAyat] = useState<AyatHarian | null>(null);
  const [jadwalRutin, setJadwalRutin] = useState<JadwalRutin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 STATE BARU: Untuk menyimpan nama user yang sedang login
  const [userName, setUserName] = useState("Tamu");

  // 🔹 EFFECT BARU: Mendengarkan perubahan status Login
  useEffect(() => {
    const unsubscribe = listenToAuth((user) => {
      if (user) {
        // Ambil nama asli, kalau kosong ambil dari email bagian depan, kalau kosong pakai "Jemaat"
        setUserName(user.displayName || user.email?.split("@")[0] || "Jemaat");
      } else {
        setUserName("Tamu");
      }
    });

    // Cleanup listener saat komponen ditutup agar tidak memory leak
    return () => unsubscribe();
  }, []);

  const loadAll = useCallback(async (showFullLoader = true) => {
    if (showFullLoader) setLoading(true);
    try {
      const d = new Date();
      const now = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const [ayatData, jadwalData, rutinData] = await Promise.all([
        fetchAyatHarianAPI(),
        fetchJadwalIbadahUpcomingAPI(now, 5),
        fetchJadwalRutinAPI(),
      ]);

      setAyat(ayatData);

      const flattenedDetails = (jadwalData as Jadwal[]).flatMap((item) => {
        if (!item?.detailIbadah) return [];
        return item.detailIbadah.map(detail => ({ jadwal: item, detail }));
      });
      setJadwalIbadah(flattenedDetails);

      setJadwalRutin(rutinData);
    } catch (err: any) {
      console.error("Load home error:", err);
      setError(err.message);
    }
    setLoading(false);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll(false);
    setRefreshing(false);
  }, [loadAll]);

  useEffect(() => {
    loadAll();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 8, color: Colors.textMuted }}>Memuat data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.danger }}>{error}</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Layout.padding,
          paddingBottom: 40,
          paddingTop: 10,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
        }
      >
        {/* 🔹 HEADER GREETING BARU */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.greetingText} accessibilityLabel="sapaan-teks">Selamat Datang,</Text>
            <Text style={styles.userNameText} accessibilityLabel="nama-pengguna">{userName}</Text>
          </View>
        </View>

        {/* 🔹 AYAT HARIAN MODERN */}
        <View style={styles.verseBox}>
          <View style={styles.verseHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="book" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.verseTitle}>AYAT HARIAN</Text>
          </View>
          {ayat ? (
            <>
              <Text style={styles.verseText}>"{ayat.text}"</Text>
              <Text style={styles.verseRef}>
                {ayat.book} {ayat.chapter}:{ayat.verse}
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
            style={{ padding: 4 }}
            accessibilityLabel="arrow-ke-jadwal"
          >
            <Ionicons name="arrow-forward" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {jadwalIbadah && jadwalIbadah.length > 0 ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={jadwalIbadah}
            // 🔹 PROTEKSI KEY: Menghindari bentrok antara object baru dan state lama (hot reload)
            keyExtractor={(item, index) => {
              const safeId = item?.detail?.id || item?.id || index;
              return safeId.toString();
            }}
            contentContainerStyle={{ paddingBottom: 16, paddingLeft: 2, paddingRight: 10 }}
            renderItem={({ item }) => {
              // 🔹 PROTEKSI RENDER: Amankan mapping data
              const detail = item?.detail || item; // Fallback kalau datanya masih state versi lama
              const jadwal = item?.jadwal || {};

              return (
                <View style={styles.jadwalCard}>
                  <View style={styles.imageContainer}>
                    {detail?.banner?.url ? (
                      <Image
                        source={{
                          uri: `${API_URL.replace("/api/graphql", "")}${detail.banner.url}`,
                        }}
                        style={styles.jadwalImage}
                      />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={24} color={Colors.placeholder} />
                      </View>
                    )}
                    
                    {/* 🔹 BADGE HARI (MODERN) */}
                    {jadwal?.tanggal && (
                      <View style={styles.dayBadge}>
                        <Text style={styles.dayBadgeText}>{getSingkatanHari(jadwal.tanggal)}</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.jamContainer}>
                    <Ionicons name="time-outline" size={16} color={Colors.primary} />
                    <Text style={styles.jamText}>{detail?.jam || "-"} WIB</Text>
                  </View>
                </View>
              );
            }}
          />
        ) : (
          <Text style={styles.emptyText}>Tidak ada jadwal tersedia.</Text>
        )}

        {/* 🔹 IBADAH RUTIN */}
        <Text style={styles.sectionTitle2}>Ibadah Rutin</Text>

        <View style={styles.rutinContainer}>
          {jadwalRutin && jadwalRutin.length > 0 ? (
            jadwalRutin.flatMap((item) =>
              item?.waktu && item.waktu.length > 0
                ? item.waktu
                    .sort((a, b) => a.jam.localeCompare(b.jam))
                    .map((w) => (
                      <View key={`${item?.id}-${w?.id}`} style={styles.rutinCard}>
                        <View style={styles.rutinIconWrapper}>
                          <Ionicons name="calendar-outline" size={22} color={Colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rutinTitle}>{item?.namaIbadah}</Text>
                          <Text style={styles.rutinSub}>
                            {item?.nama}, {w?.jam}
                          </Text>
                        </View>
                      </View>
                    ))
                : [
                    <View key={item?.id} style={styles.rutinCard}>
                      <View style={styles.rutinIconWrapper}>
                        <Ionicons name="calendar-outline" size={22} color={Colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rutinTitle}>{item?.namaIbadah}</Text>
                        <Text style={styles.rutinSub}>{item?.nama}, -</Text>
                      </View>
                    </View>,
                  ]
            )
          ) : (
            <Text style={styles.emptyText}>Tidak ada jadwal rutin tersedia.</Text>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // --- HEADER BARU ---
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Layout.gap,
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 15,
    color: Colors.textMuted,
    marginBottom: 2,
    fontWeight: "500",
  },
  userNameText: {
    fontSize: FontSize.h1,
    fontWeight: "bold",
    color: Colors.primary,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.muda,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.shdows,
  },

  // --- AYAT HARIAN ---
  verseBox: {
    backgroundColor: Colors.white,
    borderRadius: Layout.radiusLarge,
    padding: Layout.padding,
    marginBottom: 24,
    ...Shadows.shdows,
  },
  verseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    backgroundColor: Colors.muda,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  verseTitle: {
    color: Colors.primary,
    fontWeight: "800",
    fontSize: FontSize.small,
    letterSpacing: 0.5,
  },
  verseText: {
    color: Colors.text,
    fontSize: 15,
    fontStyle: "italic",
    lineHeight: 22,
    marginBottom: 10,
  },
  verseRef: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: FontSize.body,
    textAlign: "right",
  },

  // --- JADWAL IBADAH HORIZONTAL ---
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: FontSize.h3,
    fontWeight: "800",
    color: Colors.primary,
  },
  jadwalCard: {
    width: 120, 
    height: 130, 
    marginRight: 14,
    borderRadius: Layout.radiusLarge,
    backgroundColor: Colors.white,
    ...Shadows.shdows,
  },
  imageContainer: {
    height: "70%",
    width: "100%",
    borderTopLeftRadius: Layout.radiusLarge,
    borderTopRightRadius: Layout.radiusLarge,
    overflow: "hidden",
    position: 'relative', 
  },
  jadwalImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.inputBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  dayBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  dayBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary, 
    letterSpacing: 0.5,
  },
  jamContainer: {
    height: "30%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  jamText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: FontSize.small,
  },

  // --- IBADAH RUTIN ---
  sectionTitle2: {
    fontSize: FontSize.h3,
    fontWeight: "800",
    color: Colors.primary,
    marginTop: 24,
    marginBottom: 12,
  },
  rutinContainer: {
    marginBottom: 20,
  },
  rutinCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: Layout.radiusLarge,
    padding: 16,
    marginBottom: 12,
    ...Shadows.shdows,
  },
  rutinIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.muda,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  rutinTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: Colors.text,
    marginBottom: 4,
  },
  rutinSub: {
    fontSize: FontSize.small,
    color: Colors.textMuted,
  },

  emptyText: {
    textAlign: "center",
    color: Colors.textMuted,
    marginVertical: Layout.gap,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});