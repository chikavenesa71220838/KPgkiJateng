import React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput} from "react-native";

const data = [
    {id: '1', kategori: 'Kegiatan', judul: 'Ibadah Minggu', tanggal: '20-09-2024'},
    {id: '2', kategori: 'Pengumuman', judul: 'Rapat Jemaat', tanggal: '22-09-2024'}
];

export default function WartaScreen() {
    const [setQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState(data);

    useEffect(() => {
        if (setQuery) {
            const dataBaru = data.filter(item => {
                const textData = setQuery.toLowerCase();
                return (
                    item.kategori.toLowerCase().includes(textData) ||
                    item.judul.toLowerCase().includes(textData) ||
                    item.tanggal.toLowerCase().includes(textData)
                )
            });
            setFilteredData(dataBaru);
        } else {
            setFilteredData(data);
        }
    }, [setQuery]);

    return (
        <View style={styles.container}>
            <TextInput placeholder="Cari berdasarkan" 
            style={styles.input}
            value={setQuery}
            onChangeText={text => setSearchQuery(text)}
            />
        <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <Text>Kategori: {item.kategori}</Text>
                    <Text>Judul: {item.judul}</Text>
                    <Text>Tanggal: {item.tanggal}</Text>
                </View>
            )}
        />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#fff" },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 8,
        marginBottom: 12,
        borderRadius: 8,
    },
    card: {
        backgroundColor: "#ADD8FF",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
  },
});
