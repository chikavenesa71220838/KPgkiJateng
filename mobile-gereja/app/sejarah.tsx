import React from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView, // 1. Impor SafeAreaView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Stack } from "expo-router";

// ... (const sejarahTeks dan paragrafArray Anda tetap di sini)
const sejarahTeks = `Yogyakarta memiliki sejarah yang panjang, jauh di belakang dengan kerajaan Mataramnya. Sebagai kota budaya, Yogyakarta juga menyimpan banyak kisah masa lalu, termasuk sejarah jemaat GKI Ngupasan Yogyakarta yang sudah berusia lebih dari 70 tahun. Kini, kota Yogyakarta berkembang menjadi salah satu kota modern dengan sejumlah besar mahasiswanya. Itulah sebabnya kota Yogyakarta dijuluki sebagai “Kota Pelajar” di samping “Kota Budaya” dan “Kota Perjuangan”.
Sejak awal abad ke-20, Residen memberi izin kepada Pdt. J. Zwaan untuk melakukan pemberitaan Injil di daerah Yogyakarta. Sasarannya adalah penduduk asli atau suku Jawa. Karena itu dibangunlah sebuah gedung gereja yang dikenal dengan Gereja Kristen Jawa Klitren (kini GKJ Sawokembar – Gondokusuman), yang dilayani dalam bahasa Jawa. Sementara itu, untuk orang Belanda dihadirkan Gereformeerde Kerk di Kotabaru dengan bahasa Belanda. Selanjutnya didirikanlah sekolah Kristen untuk orang Tionghoa yang disebut Christelijke Hollands Chinese School. Pada tahun 1905, dibaptislah orang Tionghoa pertama di GKJ Klitren, bahkan beberapa waktu kemudian ada juga orang Tionghoa yang menjadi anggota Majelis Jemaat GKJ Klitren.
Dalam perkembangan berikutnya, para orang Tionghoa peranakan yang telah dibaptis menumpang beribadah dalam bahasa Melayu di Jl. Pajeksan, tempat kelompok Tionghoa Totok mengadakan kebaktian sejak sekitar tahun 1920. Dana untuk pengembangan kelompok Kristen Tionghoa peranakan ini didukung oleh Gereformeerde Kerk Kotabaru.
Pada pertengahan tahun 1928, dirasakan perlu untuk menyewa sebuah rumah di Jl. Ngabean (KHA Dahlan) dan mengangkat Sdr. Go Tiang Lioe (ayahanda Pdt. Sam Gosana) menjadi Guru Injil yang merangkap sebagai Kepala Sekolah dari Christelijke Maleis Chinese School. Dengan demikian, ada pembagian tugas pelayanan, yakni bagi mereka yang dapat berbahasa Belanda dilayani oleh Pdt. Dr. F.L. Bakker, sedangkan yang hanya dapat berbahasa Melayu dilayani oleh Pdt. Sopater (ayahanda Pdt. Prof. Dr. Sularso Sopater). Sementara itu, Sdr. Go Tiang Lioe melayani katekisasi dari rumah ke rumah.
Karena tempat kebaktian di Jl. Ngabean tak cukup lagi, pada tahun 1929 mereka pindah ke Jl. Ngadiwinatan dan di sanalah jemaat ini didewasakan pada tanggal 3 Juni 1934 dengan nama Tiong Hoa Kie Tok Kauw Hwee (THKTKH). Adapun susunan Majelis Jemaat yang pertama adalah Pnt. Sie Ke Tjin, Pnt. Liem Phoen Kian, Pnt. Koo Hien, Dk. Oei Sing Bie, dan Guru Injil Go Tiang Lioe, dengan konsulennya Pdt. Dr. F.L. Bakker. Sekali lagi jemaat berpindah alamat, yakni ke Jl. Ngupasan 21, yang diperoleh melalui pinjaman dari Gereformeerde Kerk dan Schoolvereniging sampai dilunaskan penuh pada tahun 1939.
Ternyata pekerjaan pelayanan di tengah jemaat makin banyak sehingga Sdr. Pouw Ie Gan dipanggil dan ditahbiskan menjadi pendeta pada tahun 1941. Namun beliau hanya melayani hingga tahun 1943 karena memenuhi panggilan Gereja Kristue Ketapang Jakarta. Sementara Sdr. Go Tiang Lioe mengundurkan diri dari jabatan sebagai Kepala Sekolah dan menyerahkan hidupnya selaku Guru Injil sampai ditahbiskan pada tahun 1943, namun setahun kemudian beliau pensiun.
Berikutnya, Sdr. Tan Hok Sing (S. Tandiowidagdo) menerima panggilan sebagai Guru Injil untuk melayani Pos PI di Wates sampai tahun 1945 dan Pos PI Kebumen sampai tahun 1948. Perpindahan Pos PI ini terjadi karena situasi negara yang masih kacau dan terjadi pengungsian.
Pada masa tak ada pendeta, Pdt. Tan King Hien dari Hoa Kiauw Kie Tok Kauw Hwee Magelang bertindak sebagai konsulen antara tahun 1944–1947, sampai Pdt. Then Djin Soei diteguhkan sebagai pendeta yang baru. Terjadinya agresi Belanda (1947) dan wabah pes menyebabkan banyak penduduk Yogyakarta mengungsi dan mengalami penderitaan, sampai-sampai istri Pdt. Then Djin Soei wafat karena penyakit pes. Untuk memperlancar pelayanan, Guru Injil Lie Tie Jong ditempatkan di Muntilan sampai beliau menerima panggilan dari salah satu jemaat di Jawa Timur. Selanjutnya, sejak tahun 1949 jemaat Muntilan diasuh oleh THKTKH Ngupasan bersama Guru Injil Lie Tie Jong (T.J. Lintang). Baru pada tahun 1955, pengasuh cabang Muntilan dikembalikan kepada HKKTKH Muntilan.
Perkembangan jemaat bertambah pesat seiring dengan kehadiran Universitas Gadjah Mada (UGM) pada tahun 1949. Pelayanan kepada para mahasiswa pun semakin meningkat. Pada tahun 1956, nama THKTKH diubah menjadi Gereja Kristen Indonesia (GKI) berdasarkan keputusan Sidang Sinode VI Gereja–Gereja Kristen Tionghoa di Purwokerto. Juga pada masa itu diadakan pelayanan kebaktian dalam bahasa Tionghoa yang kemudian menjadi Gereja Kristen Kalam Kudus Yogyakarta.
Jemaat GKI Ngupasan memanggil Sdr. Tjoa Tjin Touw (Basilea Maruta) sebagai Guru Injil pada tahun 1951, dan beliau melayani sampai pertengahan tahun 1959 karena tenaganya dibutuhkan sebagai dosen di Akademi Theologia Yogyakarta. Panggilan GKI Pekalongan pada tahun 1958 diterima Pdt. Then Djin Soei sehingga GKI Ngupasan mengalami kekosongan pengerja sampai Pdt. Tan Ik Hay (Iskak Gunawan), yang semula melayani GKI Salatiga, menggantikannya pada tahun 1959.
Didorong oleh makin bertambahnya jumlah anggota jemaat, maka jemaat pun bertekad untuk membangun gedung gereja yang baru di Jl. Ngupasan (Bhayangkara) No. 19. Pembangunan gedung gereja terlaksana di bawah pimpinan arsitek Oei Kang Yan (Y.K. Winata) dan diresmikan pada tahun 1961.
Bidang pendidikan juga mendapat perhatian jemaat. Karena itu, sekolah-sekolah Kristen yang telah dirintis oleh Pdt. Go Tiang Lioe dalam wadah Yayasan Pendidikan Nasional oleh Pdt. Iskak Gunawan ditingkatkan dan kini menjadi YPPN Budya Wacana. Di samping itu, bersama dengan beberapa anggota jemaat, Pdt. Iskak Gunawan mendirikan Asrama Putri Kristen (APK) di Jl. Ledok Ratmakan dan Pendidikan Guru Atas Agama Kristen (PGAAK). Selanjutnya kebutuhan tenaga pengerja jemaat dilengkapi dengan kehadiran Sdri. Ida Roosmalasari (Be Khing Hwa) sejak 1 Maret 1969.
Pdt. Iskak Gunawan dipanggil pulang ke rumah Bapa yang kekal pada tanggal 25 November 1972. Tuhan memberikan gantinya atas Pdt. Jermia Widyanto (Tjan Poen Ong), yang semula melayani GKI Klaten dan diteguhkan pada tanggal 21 Agustus 1974. Setahun kemudian dibuatkan tempat kebaktian sore di gedung SMP Budya Wacana Jl. Kranggan. Kemudian, ada penambahan pendeta pada diri Pdt. Daud Adiprasetya (Liem Djiet Go), pindahan dari GKI Tumapel, Malang pada tahun 1979.
Pdt. Daud Adiprasetya mengakhiri pelayanannya di GKI Ngupasan pada tahun 1985 untuk mutasi ke GKI Coyudan, Solo. Kemudian Sdr. Budi Santoso Marsudi mulai pelayanan di GKI Ngupasan pada bulan April 1985 dan ditahbiskan sebagai pendeta pada tanggal 19 November 1990.
Selanjutnya dibuka lagi tempat kebaktian pagi pada tahun 1982 di SMA Budya Wacana Jl. Teuku Cik Di Tiro, dan Januari 1984 di Wongsodirjan yang kemudian didewasakan menjadi GKI Wongsodirjan pada tanggal 31 Oktober 1991. GKI Ngupasan juga pernah memiliki Pos PI di Wates, namun kemudian ditutup karena anggota jemaat GKI Ngupasan yang berdomisili di Wates lebih memilih beribadah di gereja induk.
Dengan waktu yang tidak terlalu lama setelah peresmian Bakal Jemaat Wongsodirjan, pada tanggal 5 Januari 1984 GKI Ngupasan juga telah meresmikan Pos Kebaktian di Jl. Ledok Gondomanan yang menempati sebidang tanah hibah dari keluarga Tan Bian Hoo. Peningkatan status menjadi Bakal Jemaat dilaksanakan dalam sebuah kebaktian pada tahun 1987, dan pendewasaan GKI Ngupasan Bakal Jemaat Gondomanan menjadi GKI Gondomanan dilaksanakan pada tanggal 22 November 1996.
Untuk lebih melengkapi pendampingan kepada anggota jemaat, maka Majelis Jemaat GKI Ngupasan telah memanggil Pdt. John Then untuk memasuki masa perkenalan di GKI Ngupasan pada akhir bulan Agustus 1992 dan diteguhkan sebagai pendeta GKI Jateng dengan basis pelayanan di GKI Ngupasan pada tanggal 19 November 1992.
Seiring dengan majunya pendidikan di kota Yogyakarta, khususnya Fakultas Theologia Universitas Kristen Duta Wacana (UKDW), maka BPMS GKI Jateng (sekarang BPMSW GKISW Jateng) telah mengutus Pdt. Drs. Matius W. Wyanto, M.Th. dan Sdri. Tabita Kartika Christiani, M.Th. Sdri. Tabita memasuki masa orientasi mulai tanggal 1 April 1991 dan kemudian ditahbiskan di GKI Ngupasan sebagai Pendeta Tugas Khusus GKI SW Jateng untuk Fakultas Theologia UKDW pada 19 November 1993, bersamaan dengan peneguhan Pdt. Drs. Matius W. Wyanto.
Dalam perkembangannya, GKI Ngupasan telah membeli sebidang tanah di daerah Prayan Kulon yang kemudian didirikan sebuah tempat ibadah. Ibadah perdana yang menandai diresmikannya Pos Kebaktian di Gejayan diadakan pada tanggal 3 Januari 1993 dengan pelayan Pdt. Budi Santoso Marsudi. Pos Kebaktian di Gejayan ini ditingkatkan menjadi Bakal Jemaat pada tanggal 3 November 1996 dan akhirnya didewasakan pada tanggal 3 Maret 2000.
Karena Majelis Jemaat membutuhkan seorang pendeta yang benar-benar dapat ikut memikirkan generasi mudanya, maka Majelis Jemaat memutuskan untuk memanggil Pdt. Shirley Dewi Indrawati, yang pada saat itu melayani di GKI Gombong, untuk memasuki masa perkenalan di GKI Ngupasan mulai awal Oktober 2002 dan diteguhkan pada tanggal 19 November 2002.
Bekerja sama dengan Majelis Jemaat GKI Wongsodirjan dan GKI Gejayan dengan pendampingan BPMK GKI Klasis Yogya, maka pada bulan Desember 2005 telah dirintis pembukaan Pos Kebaktian di sekitar Jl. Magelang dengan mengambil tempat di Restoran Pacific. Panitia Pos Kebaktian ini dilantik oleh BPMK GKI Klasis Yogya pada tanggal 29 Oktober 2006.
Semuanya adalah wujud nyata penyertaan Tuhan dalam setiap pekerjaan untuk kemuliaan nama-Nya.`;

const paragrafArray = sejarahTeks
  .split("\n")
  .filter((p) => p.trim() !== "");

export default function SejarahGereja(): React.ReactElement {
  const navigation = useNavigation();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* 2. Gunakan SafeAreaView sebagai pembungkus utama */}
      <SafeAreaView style={styles.mainContainer}>
        
        {/* 3. Header sekarang ada DI LUAR ScrollView */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color="#207163" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sejarah Gereja</Text>
        </View>

        {/* 4. ScrollView sekarang HANYA membungkus konten yang perlu di-scroll */}
        <ScrollView style={styles.scrollContainer}>
          {paragrafArray.map((paragraf, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraf}
            </Text>
          ))}

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// 5. Kita perlu sedikit memodifikasi StyleSheet
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  // 'container' lama kita ganti nama menjadi 'scrollContainer'
  // dan kita hapus 'paddingTop' dan 'flex: 1' darinya
  scrollContainer: {
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    // Kita tambahkan padding horizontal agar sejajar dengan konten
    paddingHorizontal: 18,
    // Kita tambahkan padding vertikal agar header-nya tidak terlalu mepet
    paddingVertical: 12,
    // 'marginBottom' bisa diganti atau dihapus,
    // tapi 'paddingVertical' di atas sudah cukup memberi jarak.
    // Mari kita tambahkan border bawah tipis agar terlihat rapi
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#207163",
  },
  paragraph: {
    fontSize: 15,
    color: "#333",
    lineHeight: 24,
    textAlign: "justify",
    marginBottom: 12,
  },
});