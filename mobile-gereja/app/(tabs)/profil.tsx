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
  const [gereja, setGereja] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = API_URL.replace("/api/graphql", "");

  useEffect(() => {
    async function fetchData() {
      try {
        // Ambil data gereja
        const resGereja = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query {
                gerejas {
                  id
                  nama
                  alamat
                  hari
                  telepon
                  linkWhatsapp
                  linkInstagram
                  linkYoutube
                  linkFacebook
                  linkEmail
                  gambar { url }
                  sejarah
                }
              }
            `,
          }),
        });

        const jsonGereja = await resGereja.json();
        if (jsonGereja.errors) throw new Error(jsonGereja.errors[0].message);
        const dataGereja = jsonGereja.data.gerejas?.[0];
        setGereja(dataGereja);

        // Ambil data pendeta (dari list Pendeta di Keystone)
        const resPendeta = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query {
                pendetas {
                  id
                  nama
                  email
                  sejakKapanAktif
                  foto { url }
                }
              }
            `,
          }),
        });

        const jsonPendeta = await resPendeta.json();
        if (jsonPendeta.errors) throw new Error(jsonPendeta.errors[0].message);
        setPendeta(jsonPendeta.data.pendetas);
      } catch (err: any) {
        console.error("Gagal mengambil data:", err);
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Fungsi salin teks (email)
  const salinTeksEmail = async (teks: string) => {
    await Clipboard.setStringAsync(teks);
    Toast.show({
      type: "success",
      text1: "Email telah disalin!",
      position: "bottom",
      visibilityTime: 1500,
    });
  };

  const salinTeks = async (teks: string) => {
    await Clipboard.setStringAsync(teks);
    Toast.show({
      type: "success",
      text1: "Nomor telah disalin!",
      position: "bottom",
      visibilityTime: 1500,
    });
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#207163" />
        <Text style={{ color: "#207163", marginTop: 8 }}>
          Memuat data gereja...
        </Text>
      </View>
    );

  if (error)
    return (
      <Text style={{ color: "red", textAlign: "center", marginTop: 20 }}>
        {error}
      </Text>
    );

  if (!gereja)
    return (
      <Text style={{ color: "#207163", textAlign: "center", marginTop: 20 }}>
        Tidak ada data gereja.
      </Text>
    );

  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>Profil Gereja</Text>

        {/* Alamat + Foto Gereja */}
        <View style={[styles.infoCardGereja, styles.flexRow]}>
          <Image
            source={
              gereja.gambar?.url
                ? { uri: `${BASE_URL}${gereja.gambar.url}` }
                : require("../../assets/images/fotogereja.jpeg")
            }
            style={styles.gerejaImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>{gereja.nama}</Text>
            <Text style={styles.infoText}>{gereja.alamat}</Text>
          </View>
        </View>

        {/* Jam Kerja */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Jam Kerja Kantor</Text>
          {gereja.hari?.split("\n").map((h: string, i: number) => (
            <Text key={i} style={styles.infoText}>
              {h}
            </Text>
          ))}
        </View>

        {/* Telepon */}
        {gereja.telepon ? (
          <TouchableOpacity
            style={[styles.infoCard, styles.rowBetween]}
            onPress={() => Linking.openURL(`tel:${gereja.telepon}`)}
            onLongPress={() => salinTeks(gereja.telepon)}
          >
            <Text style={styles.infoTitle}>Telepon</Text>
            <Text
              style={[styles.infoText, { textDecorationLine: "underline" }]}
            >
              {gereja.telepon}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Sosial Media */}
        <View style={styles.infoCard}>
          <View style={styles.socialHeader}>
            <Text style={styles.infoTitle}>Sosial Media</Text>
            <View style={styles.socialIcons}>
              {gereja.linkWhatsapp && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(gereja.linkWhatsapp)}
                >
                  <FontAwesome
                    name="whatsapp"
                    size={24}
                    color="white"
                    style={styles.icon}
                  />
                </TouchableOpacity>
              )}
              {gereja.linkInstagram && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(gereja.linkInstagram)}
                >
                  <FontAwesome
                    name="instagram"
                    size={24}
                    color="white"
                    style={styles.icon}
                  />
                </TouchableOpacity>
              )}
              {gereja.linkEmail && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(gereja.linkEmail)}
                >
                  <Ionicons
                    name="mail"
                    size={24}
                    color="white"
                    style={styles.icon}
                  />
                </TouchableOpacity>
              )}
              {gereja.linkYoutube && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(gereja.linkYoutube)}
                >
                  <FontAwesome
                    name="youtube-play"
                    size={24}
                    color="white"
                    style={styles.icon}
                  />
                </TouchableOpacity>
              )}
              {gereja.linkFacebook && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(gereja.linkFacebook)}
                >
                  <FontAwesome
                    name="facebook"
                    size={24}
                    color="white"
                    style={styles.icon}
                  />
                </TouchableOpacity>
              )}
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

        {pendeta.length === 0 ? (
          <Text
            style={{ textAlign: "center", color: "#207163", marginTop: 10 }}
          >
            Tidak ada data pendeta.
          </Text>
        ) : (
          <View style={styles.pendetaList}>
            {pendeta.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.pendetaCard}
                onPress={() => Linking.openURL(`mailto:${p.email}`)}
                onLongPress={() => salinTeksEmail(p.email)}
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
                  <Text
                    style={[
                      styles.pendetaEmail,
                      { textDecorationLine: "underline" },
                    ]}
                  >
                    {p.email}
                  </Text>
                  <Text style={styles.pendetaSejak}>
                    Sejak: {p.sejakKapanAktif || "-"}
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#207163",
    marginTop: -6,
    marginBottom: 10,
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
  pendetaEmail: {
    color: "white",
    fontSize: 14,
  },
  pendetaSejak: {
    color: "#d3f3e0",
    fontSize: 13,
    marginTop: 2,
  },
});
