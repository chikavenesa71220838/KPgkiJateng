import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

export default function ProfilGereja(): React.ReactElement {
  return (
    <ScrollView style={styles.container}>
      {/* Profil Gereja */}
      <Text style={styles.sectionTitle}>Profil Gereja</Text>

      {/* Alamat + Foto Gereja */}
      <View style={[styles.infoCard, styles.flexRow]}>
        <Image
          source={require("../../assets/images/fotogereja.jpeg")}
          style={styles.gerejaImage}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Alamat</Text>
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
              <FontAwesome
                name="whatsapp"
                size={24}
                color="white"
                style={styles.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://instagram.com")}
            >
              <FontAwesome
                name="instagram"
                size={24}
                color="white"
                style={styles.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL("mailto:gki@example.com")}
            >
              <Ionicons name="mail" size={24} color="white" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://youtube.com")}
            >
              <FontAwesome
                name="youtube-play"
                size={24}
                color="white"
                style={styles.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://facebook.com")}
            >
              <FontAwesome
                name="facebook"
                size={24}
                color="white"
                style={styles.icon}
              />
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

      <View style={styles.pendetaList}>
        {[
          {
            id: 1,
            nama: "Pdt. Iyan",
            telp: "081888888888",
            img: require("F:/KP/KPgkiJateng/mobile-gereja/assets/images/logogereja.png"),
          },
          {
            id: 2,
            nama: "Pdt. Albert",
            telp: "081777777777",
            img: require("F:/KP/KPgkiJateng/mobile-gereja/assets/images/logogereja.png"),
          },
          {
            id: 3,
            nama: "Pdt. Maria",
            telp: "081999999999",
            img: require("F:/KP/KPgkiJateng/mobile-gereja/assets/images/logogereja.png"),
          },
        ].map((p) => (
          <View key={p.id} style={styles.pendetaCard}>
            <Image source={p.img} style={styles.pendetaImg} />
            <Text style={styles.pendetaName}>{p.nama}</Text>
            <Text style={styles.pendetaPhone}>{p.telp}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9F6F5",
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
  infoTitle: {
    color: "white",
    fontWeight: "bold",
    marginBottom: 4,
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
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 10,
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

  /*** Pendeta Section ***/
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
