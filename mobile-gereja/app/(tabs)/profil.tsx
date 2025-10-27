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

export default function ProfilGereja(): React.ReactElement {
  const [pendeta, setPendeta] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPendeta() {
      try {
        const res = await fetch("http://localhost:3000/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query {
                pengkhotbahs {
                  id
                  nama
                  kontak
                }
              }
            `,
          }),
        });

        const json = await res.json();
        setPendeta(json.data.pengkhotbahs);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPendeta();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Profil Gereja */}
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
            <TouchableOpacity onPress={() => Linking.openURL("https://wa.me/6280000000000")}>
              <FontAwesome name="whatsapp" size={24} color="white" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL("https://instagram.com")}>
              <FontAwesome name="instagram" size={24} color="white" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL("mailto:gki@example.com")}>
              <Ionicons name="mail" size={24} color="white" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL("https://youtube.com")}>
              <FontAwesome name="youtube-play" size={24} color="white" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL("https://facebook.com")}>
              <FontAwesome name="facebook" size={24} color="white" style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Sejarah Gereja */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Sejarah Gereja</Text>
      </View>

      {/* Pendeta Gereja */}
      <Text style={styles.subTitle}>Pendeta Gereja</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#207163" />
      ) : (
        <View style={styles.pendetaList}>
          {pendeta.map((p, index) => (
            <View key={index} style={styles.pendetaCard}>
              <Image
                source={require("../../assets/images/logogereja.png")}
                style={styles.pendetaImg}
              />
              <Text style={styles.pendetaName}>{p.nama}</Text>
              <Text style={styles.pendetaPhone}>{p.kontak || "Tidak ada kontak"}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
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
  infoText: {
    color: "white",
    fontSize: 14,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
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
  socialIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginLeft: 10,
  },
  pendetaList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  pendetaCard: {
    backgroundColor: "#207163",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
  },
  pendetaImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8,
  },
  pendetaName: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  pendetaPhone: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
});
