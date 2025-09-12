import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons} from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? "1E90FF" : "1E90FF",
        tabBarInactiveTintColor: "gray",
        headerShown: false
      }}>
      <Tabs.Screen
        name="jadwalIbadah"
        options={{
          title: 'Jadwal',
          tabBarIcon: ({ color, size }) => ( <Ionicons name="calendar" size={size} color={color} /> ),
        }}
      />
      <Tabs.Screen
        name="warta"
        options={{
          title: 'Warta',
          tabBarIcon: ({ color, size }) => ( <Ionicons name="book" size={size} color={color} /> ),
        }}
      />
      <Tabs.Screen
        name="Riwayat"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color, size }) => ( <Ionicons name="time" size={size} color={color} /> ),
        }}
      />

      <Tabs.Screen
        name='profil'
        options={
          {
            title:'Profil',
            tabBarIcon: ({ color, size }) => ( <Ionicons name="person" size={size} color={color} /> )
          }
        }
      />
    </Tabs>
  );
}
