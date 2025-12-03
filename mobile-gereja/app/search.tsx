import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack, useNavigation } from "expo-router";
import { API_URL } from "../utils/api";
import { Colors, FontSize, Layout } from "../constants/theme";

export default function SearchScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const inputRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [jadwalData, setJadwalData] = useState<any[]>([]);
  const [wartaData, setWartaData] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    navigation.setOptions({ HeaderShown: false });
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    Keyboard.dismiss();
    router.back();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              jadwalIbadahs(orderBy: { tanggal: desc }) {
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
              wartas(orderBy: { masaBerlaku: desc }) {
                id
                judul
                isiWarta { document } 
                masaBerlaku
                tanggalPelaksanaan
                kategori { nama }
                gambar { url }
              }
            }
          `,
        }),
      });

      const result = await res.json();
      setJadwalData(result.data?.jadwalIbadahs || []);
      setWartaData(result.data?.wartas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setResults([]);
      return;
    }

    const text = searchQuery.toLowerCase();

    const jadwalFiltered = jadwalData.flatMap((item) =>
      item.detailIbadah
          .filter((d: any) => {
          const topik = item.topik ? item.topik.toLowerCase() : "";
          const pengkhotbah = d.pengkhotbah?.nama
            ? d.pengkhotbah.nama.toLowerCase()
            : "";

          return topik.includes(text) || pengkhotbah.includes(text);
        })
        .map((d: any) => ({
          type: "jadwal",
          id: d.id,
          tanggal: item.tanggal,
          topik: item.topik,
          jam: d.jam,
          pengkhotbah: d.pengkhotbah?.nama,
          banner: d.banner?.url,
        }))
    );

    const wartaFiltered = wartaData
      .filter((item) => {
        const judul = item.judul ? item.judul.toLowerCase() : "";
        const kategori = item.kategori?.nama
          ? item.kategori.nama.toLowerCase()
          : "";

        return judul.includes(text) || kategori.includes(text);
      })
      .map((item) => ({
        type: "warta",
        id: item.id,
        judul: item.judul,
        kategori: item.kategori?.nama,
        masaBerlaku: item.masaBerlaku,
        tanggalPelaksanaan: item.tanggalPelaksanaan,
        file: item.gambar?.url, 
      }));

    setResults([...jadwalFiltered, ...wartaFiltered]);
  }, [searchQuery, jadwalData, wartaData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Pencarian</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Cari jadwal dan warta"
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ color: Colors.textMuted, marginTop: 8 }}>
              Memuat data...
            </Text>
          </View>
        )}

        {!loading && (
          <ScrollView
            style={{ marginTop: 14 }}
            showsVerticalScrollIndicator={false}
          >
            {results.length > 0 ? (
              results.map((item, index) => (
                <View key={`${item.type}-${item.id}-${index}`} style={styles.cardContainer}>
                  <View style={styles.cardRow}>
                    <View style={styles.leftBox}>
                      {item.type === "jadwal" && item.banner ? (
                        <Image
                          source={{
                            uri: `${API_URL.replace(
                              "/api/graphql",
                              ""
                            )}${item.banner}`,
                          }}
                          style={styles.image}
                        />
                      ) : item.type === "warta" && item.file ? (
                        <Image
                          source={{
                            uri: `${API_URL.replace(
                              "/api/graphql",
                              ""
                            )}${item.file}`,
                          }}
                          style={styles.image}
                        />
                      ) : (
                        <View style={styles.imagePlaceholder} />
                      )}
                    </View>

                    <View style={styles.rightBox}>
                      {item.type === "jadwal" ? (
                        <>
                          <Text style={styles.category}>
                            {item.topik || "Tanpa Topik"}
                          </Text>
                          <Text style={styles.judul}>
                            {formatDate(item.tanggal)}
                          </Text>
                          <Text style={styles.isiCard}>{item.jam} WIB</Text>
                          <Text style={styles.isiCard}>
                            {item.pengkhotbah}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.category}>
                            {item.kategori || "Umum"}
                          </Text>
                          <Text style={styles.judul}>{item.judul}</Text>
                          <Text style={styles.isiCard}>
                            Pelaksanaan: {formatDate(item.tanggalPelaksanaan)}
                          </Text>
                          <Text style={styles.masaBerlaku}>
                            Berlaku s/d {formatDate(item.masaBerlaku)}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              ))
            ) : searchQuery.trim() !== "" ? (
              <Text style={styles.emptyText}>Tidak ada hasil ditemukan.</Text>
            ) : null}
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Layout.padding,
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 8,
  },
  headerText: {
    fontSize: FontSize.h2,
    fontWeight: "bold",
    color: Colors.primary,
  },
  searchContainer: {
    backgroundColor: Colors.inputBackground,
    borderRadius: Layout.radius,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  input: {
    fontSize: FontSize.custom.titleCard,
    color: Colors.text,
    paddingVertical: 8,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: Layout.radiusLarge,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.black,
  },
  rightBox: {
    flex: 1.3,
    backgroundColor: Colors.primary,
    padding: Layout.paddingSmall,
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
    backgroundColor: Colors.black,
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
    fontWeight: "600",
    marginBottom: 2,
  },
  isiCard: {
    color: Colors.white,
    fontSize: FontSize.custom.dateCard,
  },
  masaBerlaku: {
    position: "absolute",
    bottom: 6,
    right: 8,
    color: Colors.white,
    fontSize: FontSize.caption,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.textMuted,
    marginTop: 20,
  },
});