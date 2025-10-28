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
import { useNavigation } from "@react-navigation/native"; // ✅ Tambahkan ini
import { API_URL } from "../../utils/api";

interface Pendeta {
  id: string;
  nama: string;
  kontak?: string;
  foto?: { url: string };
}

export default function ProfilGereja(): React.ReactElement {
  const [pendeta, setPendeta] = useState<Pendeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation(); // ✅ Tambahkan ini

  const fetchPendeta = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              pengkhotbahs(orderBy: { nama: asc }) {
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

      const result = await res.json();
      if (result.errors)
        throw new Error(result.errors[0]?.message || "GraphQL Error");

      setPendeta(result.data?.pengkhotbahs || []);
      setError(null);
    } catch (err: any) {
      console.error("Gagal memuat data pendeta:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendeta();
  }, []);

  return (
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
      <View style={[styles.infoCard, styles.rowBetween]}>
        <Text style={styles.infoTitle}>Telepon</Text>
        <Text style={styles.infoText}>(0274) 514704</Text>
      </View>

      {/* Sosial Media */}
      <View style={styles.infoCard}>
        <View style={styles.socialHeader}>
          <Text style={styles.infoTitle}>Sosial Media</Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://wa.me/6280000000000")}
            >
              <FontAwesome name="whatsapp" size={24} color="white" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://instagram.com")}
            >
              <FontAwesome name="instagram" size={24} color="white" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL("mailto:gki@example.com")}
            >
              <Ionicons name="mail" size={24} color="white" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://youtube.com")}
            >
              <FontAwesome name="youtube-play" size={24} color="white" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://facebook.com")}
            >
              <FontAwesome name="facebook" size={24} color="white" style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ✅ Sejarah Gereja */}
      <TouchableOpacity
        style={[styles.infoCard, styles.rowBetween]}
        onPress={() => navigation.navigate("sejarah" as never)}
      >
        <Text style={styles.infoTitle}>Sejarah Gereja</Text>
        <Ionicons name="chevron-forward" size={20} color="white" />
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
            <View key={p.id} style={styles.pendetaCard}>
              <Image
                source={
                  p.foto?.url
                    ? { uri: `${API_URL.replace("/api/graphql", "")}${p.foto.url}` }
                    : require("../../assets/images/logogereja.png")
                }
                style={styles.pendetaImg}
              />
              <View style={styles.pendetaInfo}>
                <Text style={styles.pendetaName}>{p.nama}</Text>
                {p.kontak ? (
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${p.kontak}`)}>
                    <Text style={styles.pendetaPhone}>{p.kontak}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
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
  pendetaList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  pendetaCard: {
    backgroundColor: "#207163",
    borderRadius: 12,
    overflow: "hidden",
    width: "48%",
    marginBottom: 12,
  },
  pendetaImg: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "contain",
    backgroundColor: "#fff",
  },
  pendetaInfo: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  pendetaName: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  pendetaPhone: {
    color: "#b2dfdb",
    fontSize: 14,
    marginTop: 4,
    textDecorationLine: "underline",
  },
  center: { justifyContent: "center", alignItems: "center", marginTop: 20 },
});
