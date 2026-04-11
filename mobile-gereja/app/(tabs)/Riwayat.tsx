import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { API_URL } from "../../utils/api";
import { fetchRiwayatIbadahAPI } from "../../services/profileAPI";
import { Ionicons } from "@expo/vector-icons";
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

export default function Riwayat(): React.ReactElement {
  const [riwayat, setRiwayat] = useState<Jadwal[]>([]);
  const [filteredData, setFilteredData] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString().split("T")[0];
      const data = await fetchRiwayatIbadahAPI(now);
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 8, color: Colors.textMuted }}>Memuat riwayat ibadah...</Text>
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

  return (
    <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 50,
          paddingTop: 10,
          paddingHorizontal: Layout.paddingSmall,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Riwayat Ibadah</Text>

        {filteredData.length > 0 ? (
          filteredData.map((item) =>
            item.detailIbadah.map((d) => (
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
                    
                    {/* Gambar Kiri - Dikembalikan ke struktur simple agar ukuran pas */}
                    <View style={styles.leftBox}>
                      {d.banner?.url ? (
                        <Image
                          source={{
                            uri: `${API_URL.replace("/api/graphql", "")}${d.banner.url}`,
                          }}
                          style={styles.imageForeground}
                        />
                      ) : (
                        <View style={styles.imagePlaceholder}>
                          <Ionicons name="image-outline" size={24} color={Colors.placeholder} />
                        </View>
                      )}
                    </View>

                    {/* Informasi Kanan */}
                    <View style={styles.rightBox}>
                      <View style={styles.tagContainer}>
                        <Text style={styles.tagText}>
                          {item.topik || "Umum"}
                        </Text>
                      </View>

                      <Text style={styles.judul}>{formatDate(item.tanggal)}</Text>

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
            ))
          )
        ) : (
          <Text style={styles.emptyText}>Tidak ada riwayat tersedia.</Text>
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
  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: Layout.radiusLarge,
    marginBottom: 14,
    ...Shadows.shdows,
    overflow: "hidden",
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    height: 90,
    borderRadius: Layout.radiusLarge,
    overflow: "hidden",
  },
  leftBox: {
    flex: 1,
    backgroundColor: Colors.inputBackground, // Diubah jadi abu-abu muda biar estetik kalau kosong
    justifyContent: "center",
    alignItems: "center",
  },
  rightBox: {
    flex: 1.3,
    paddingTop: 20,
    backgroundColor: Colors.white,
    padding: Layout.paddingSmall,
    justifyContent: "center",
    position: "relative",
  },
  tagContainer: {
    backgroundColor: Colors.muda,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  tagText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
  },
  judul: {
    color: Colors.text,
    fontSize: FontSize.custom.titleCard,
    fontWeight: "700",
    marginBottom: 2,
    flexShrink: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -5,
    marginBottom: 4,
    gap: 3,
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
  imageForeground: {
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
});