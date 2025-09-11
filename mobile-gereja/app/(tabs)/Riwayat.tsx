import { View, Platform, StyleSheet , Text, FlatList, TextInput } from 'react-native';

const data = [
  { id: "1", tanggal: "2024-12-25", topik: "Menyambut Kedatangan-Nya", pengkhotbah: "Pendeta A" },
  { id: "2", tanggal: "2024-01-01", topik: "Tahun Baru, Iman Baru", pengkhotbah: "Pendeta B" },
]

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <TextInput placeholder="Cari riwayat berdasarkan" style={styles.input}/>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Tanggal: {item.tanggal}</Text>
            <Text>Topik: {item.topik}</Text>
            <Text>Pengkhotbah: {item.pengkhotbah}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  input: {borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12},
  card: {backgroundColor: '#ADD8FF', padding: 12, borderRadius: 10, marginBottom: 10},
});
