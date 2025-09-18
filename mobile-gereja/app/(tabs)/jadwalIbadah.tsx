import React from 'react';
import { useState, useEffect } from 'react';
import { View, Platform, StyleSheet , Text, FlatList, TextInput } from 'react-native';

const data = [
  { id: "1", tanggal: "2024-12-25", topik: "Menyambut Kedatangan-Nya", pengkhotbah: "Pendeta A" },
  { id: "2", tanggal: "2024-01-01", topik: "Tahun Baru, Iman Baru", pengkhotbah: "Pendeta B" },
]

export default function jadwalIbadah() {
  const [setQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (setQuery) {
      const dataBaru = data.filter(item => {
        const textData = setQuery.toLowerCase();
        return (
          item.tanggal.toLowerCase().includes(textData) ||
          item.topik.toLowerCase().includes(textData) ||
          item.pengkhotbah.toLowerCase().includes(textData) 
        )
      });
      setFilteredData(dataBaru);
    } else {
      setFilteredData(data);
    }
  }, [setQuery]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Cari jadwal"
        style={styles.input}
        value={setQuery}
        onChangeText={text => setSearchQuery(text)}
      />
      <FlatList
        data={filteredData}
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
