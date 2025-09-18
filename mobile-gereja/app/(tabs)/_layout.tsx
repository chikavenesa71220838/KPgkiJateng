import { withLayoutContext } from 'expo-router';
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons} from '@expo/vector-icons';
import { View } from 'react-native';
import { Background } from '@react-navigation/elements';

const { Navigator } = createMaterialTopTabNavigator();
const Tabs = withLayoutContext(Navigator);

export default function TabLayout() {

  return (
    <Tabs
      tabBarPosition="bottom"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "gray",
        tabBarShowLabel: true,
        tabBarPosition: "bottom",
        tabBarStyle: {
          backgroundColor: "#FFF",
          borderTopWidth: 0,
          elevation: 0
        },
        tabBarIndicatorStyle: {
          backgroundColor: "#000",
          height: 3,
          borderRadius: 2,
          top: 0
        },
        tabBarIcon: ({ focused, color}) => {
          const size = focused ? 24 : 24;
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "jadwalIbadah") {
            iconName = "calendar";
          } else if (route.name === "warta") {
            iconName = "newspaper";
          } else if (route.name === "Riwayat") {
            iconName = "time";
          } else if (route.name === "profil") {
            iconName = "person";
          }

          return (
            <View style={{ alignItems: "center"}}> 
              <Ionicons name={iconName} size={size} color={color}/>
            </View>
          )
        }
      })}
    >
      <Tabs.Screen name="jadwalIbadah" options={{ title: "Jadwal" }} />
      <Tabs.Screen name="warta" options={{ title: "Warta" }} />
      <Tabs.Screen name="Riwayat" options={{ title: "Riwayat" }} />
      <Tabs.Screen name="profil" options={{ title: "Profil" }} />
    </Tabs>
  );
}
