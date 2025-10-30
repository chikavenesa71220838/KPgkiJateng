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
import { HeaderShownContext } from "@react-navigation/elements";

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

  // filter realtime
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setResults([]);
      return;
    }

    const text = searchQuery.toLowerCase();

    const jadwalFiltered = jadwalData.flatMap((item) =>
      item.detailIbadah
        .filter(
          (d: any) =>
            item.topik.toLowerCase().includes(text) ||
            d.pengkhotbah?.nama?.toLowerCase().includes(text)
        )
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
      .filter(
        (item) =>
          item.judul?.toLowerCase().includes(text) ||
          item.kategori?.nama?.toLowerCase().includes(text) ||
          item.isiWarta?.toLowerCase().includes(text)
      )
      .map((item) => ({
        type: "warta",
        id: item.id,
        judul: item.judul,
        kategori: item.kategori?.nama,
        masaBerlaku: item.masaBerlaku,
        tanggalPelaksanaan: item.tanggalPelaksanaan,
        file: item.file?.url,
      }));

    setResults([...jadwalFiltered, ...wartaFiltered]);
  }, [searchQuery, jadwalData, wartaData]);

  const formatDate = (dateString: string) => {
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
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#207163" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Pencarian</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Cari jadwal dan warta"
            placeholderTextColor="#7aa09f"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#207163" />
            <Text>Memuat data...</Text>
          </View>
        )}

        {/* Hasil Pencarian */}
        {!loading && (
          <ScrollView
            style={{ marginTop: 14 }}
            showsVerticalScrollIndicator={false}
          >
            {results.length > 0 ? (
              results.map((item) => (
                <View key={item.id} style={styles.cardContainer}>
                  <View style={styles.cardRow}>
                    {/* Gambar */}
                    <View style={styles.leftBox}>
                      {item.type === "jadwal" && item.banner ? (
                        <Image
                          source={{
                            uri: `${API_URL.replace("/api/graphql", "")}${item.banner}`,
                          }}
                          style={styles.image}
                        />
                      ) : item.type === "warta" && item.file ? (
                        <Image
                          source={{
                            uri: `${API_URL.replace("/api/graphql", "")}${item.file}`,
                          }}
                          style={styles.image}
                        />
                      ) : (
                        <View style={styles.imagePlaceholder} />
                      )}
                    </View>

                    {/* Isi */}
                    <View style={styles.rightBox}>
                      {item.type === "jadwal" ? (
                        <>
                          <Text style={styles.category}>
                            {item.topik || "Tanpa Topik"}
                          </Text>
                          <Text style={styles.judul}>
                            {formatDate(item.tanggal)}
                          </Text>
                          <Text style={styles.isiCard}>
                            {item.jam} WIB
                          </Text>
                          <Text style={styles.isiCard}>
                            {item.pengkhotbah}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.category}>
                            {item.kategori || "Umum"}
                          </Text>
                          <Text style={styles.judul}>
                            {item.judul}
                          </Text>
                          <Text style={styles.isiCard}>
                            {formatDate(item.tanggalPelaksanaan)}
                          </Text>
                          <Text style={styles.masaBerlaku}>
                            {formatDate(item.masaBerlaku)}
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
    backgroundColor: "#fff",
    paddingHorizontal: 16,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#207163",
  },
  searchContainer: {
    backgroundColor: "#d2f2ee",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  input: {
    fontSize: 13,
    color: "#000",
  },
  center: { justifyContent: "center", alignItems: "center", marginTop: 30 },
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
});
