import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { API_URL } from "@/utils/api";

export default function ProfilGereja(): React.ReactElement {
  const router = useRouter();
  const [pendeta, setPendeta] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = API_URL.replace("/api/graphql", "");

  useEffect(() => {
    async function fetchPendeta() {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query {
                pengkhotbahs {
                  id
                  nama
                  kontak
                  foto {
                    url
                  }
                }
              }
            `,
          }),
        });

        const json = await res.json();

        if (json.errors) {
          throw new Error(json.errors[0].message);
        }

        setPendeta(json.data.pengkhotbahs);
      } catch (err: any) {
        console.error("Gagal mengambil data:", err);
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }

    fetchPendeta();
  }, []);

  // Fungsi salin teks
  const salinTeks = async (teks: string) => {
    await Clipboard.setStringAsync(teks);
    Toast.show({
      type: "success",
      text1: "Nomor telepon telah disalin!",
      position: "bottom",
      visibilityTime: 1500,
    });
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>Profil Gereja</Text>

        {/* Alamat + Foto Gereja */}
        <View style={[styles.infoCardGereja, styles.flexRow]}>
          <Image
            source={require("../../assets/images/fotogereja.jpeg")}
            style={styles.gerejaImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Alamat GKI Ngupasan</Text>
            <Text style={styles.infoText}>
              Jl. Bhayangkara No.25, Ngampilan, Kota Yogyakarta, Daerah Istimewa
              Yogyakarta 55261
            </Text>
          </View>
        </View>

        {/* Jam Kerja */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Jam Kerja Kantor</Text>
          <Text style={styles.infoText}>Senin – Jumat : 08.00 – 15.30</Text>
          <Text style={styles.infoText}>Sabtu : 08.00 – 13.00</Text>
          <Text style={styles.infoText}>Minggu : 07.30 – 10.30</Text>
        </View>

        {/* Telepon */}
        <TouchableOpacity
          style={[styles.infoCard, styles.rowBetween]}
          onPress={() => Linking.openURL(`tel:(0274)514704`)}
          onLongPress={() => salinTeks("(0274) 514704")}
        >
          <Text style={styles.infoTitle}>Telepon</Text>
          <Text style={[styles.infoText, { textDecorationLine: "underline" }]}>
            (0274) 514704
          </Text>
        </TouchableOpacity>

        {/* Sosial Media */}
        <View style={styles.infoCard}>
          <View style={styles.socialHeader}>
            <Text style={styles.infoTitle}>Sosial Media</Text>
            <View style={styles.socialIcons}>
              <TouchableOpacity onPress={() => Linking.openURL("https://wa.me/6281904056700")}>
                <FontAwesome name="whatsapp" size={24} color="white" style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL("https://www.instagram.com/gkingupasan_/")}>
                <FontAwesome name="instagram" size={24} color="white" style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL("mailto:gkingupasan@yahoo.com")}>
                <Ionicons name="mail" size={24} color="white" style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL("https://www.youtube.com/channel/UC5wamDcvGr3A2V0Ras7eUYg")}>
                <FontAwesome name="youtube-play" size={24} color="white" style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL("https://web.facebook.com/mulmed.gkingupasan/")}>
                <FontAwesome name="facebook" size={24} color="white" style={styles.icon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sejarah Gereja */}
        <TouchableOpacity
          style={[styles.infoCard, styles.rowBetween]}
          onPress={() => router.push("/sejarah")}
        >
          <Text style={styles.infoTitle}>Sejarah Gereja</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Pendeta Gereja */}
        <Text style={styles.subTitle}>Pendeta Gereja</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#207163" />
            <Text style={{ color: "#207163", marginTop: 8 }}>
              Memuat data pendeta...
            </Text>
          </View>
        ) : error ? (
          <Text style={{ color: "red", textAlign: "center" }}>
            Gagal memuat data: {error}
          </Text>
        ) : pendeta.length === 0 ? (
          <Text style={{ textAlign: "center", color: "#207163", marginTop: 10 }}>
            Tidak ada data pendeta.
          </Text>
        ) : (
          <View style={styles.pendetaList}>
            {pendeta.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.pendetaCard}
                onPress={() => Linking.openURL(`tel:${p.kontak}`)}
                onLongPress={() => salinTeks(p.kontak)}
              >
                <Image
                  source={
                    p.foto?.url
                      ? { uri: `${BASE_URL}${p.foto.url}` }
                      : require("../../assets/images/logogereja.png")
                  }
                  style={styles.pendetaImg}
                />
                <View style={styles.pendetaInfo}>
                  <Text style={styles.pendetaName}>{p.nama}</Text>
                  <Text style={[styles.pendetaPhone, { textDecorationLine: "underline" }]}>
                    {p.kontak || "Tidak ada kontak"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  center: { alignItems: "center", justifyContent: "center", marginVertical: 10 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#207163",
    marginVertical: 10,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#207163",
    marginTop: 15,
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: "#207163",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  infoCardGereja: {
    backgroundColor: "#207163",
    borderRadius: 12,
    paddingLeft: 0,
    marginBottom: 12,
  },
  infoTitle: {
    color: "white",
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 16,
  },
  infoText: { color: "white", fontSize: 14 },
  flexRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  gerejaImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  socialHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  socialIcons: { flexDirection: "row", alignItems: "center" },
  icon: { marginLeft: 10 },

  // Pendeta
  pendetaList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  pendetaCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    width: "48%",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pendetaImg: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#000",
  },
  pendetaInfo: {
    backgroundColor: "#207163",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  pendetaName: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  pendetaPhone: {
    color: "white",
    fontSize: 14,
  },
});
