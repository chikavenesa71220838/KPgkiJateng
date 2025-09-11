import { View, Text, StyleSheet, FlatList, TextInput} from "react-native";

const data = [
    {id: '1', kategori: 'Kegiatan', judul: 'Ibadah Minggu', tanggal: '20-09-2024'},
    {id: '2', kategori: 'Pengumuman', judul: 'Rapat Jemaat', tanggal: '22-09-2024'}
];

export default function WartaScreen() {
    return (
        <View>
            <TextInput placeholder="Cari berdasarkan judul"/>
        <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View>
                    <Text>Kategori: {item.kategori}</Text>
                    <Text>Judul: {item.judul}</Text>
                    <Text>Tanggal: {item.tanggal}</Text>
                </View>
            )}
        />
        </View>
    );
}
        