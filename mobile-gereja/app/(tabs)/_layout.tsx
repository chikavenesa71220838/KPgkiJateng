import { withLayoutContext } from "expo-router";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, Image, Text, StyleSheet } from "react-native";

const { Navigator } = createBottomTabNavigator();
const Tabs = withLayoutContext(Navigator);

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Header custom */}
      <View style={styles.header}>
        <Image
          source={require("../../../mobile-gereja/assets/images/logogereja.png")}
          style={styles.logo}
        />
        <Text style={styles.headerText}>GKI Ngupasan</Text>
      </View>

      {/* Bottom Tabs */}
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#ffd000ff",
          tabBarInactiveTintColor: "white",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#207163ff",
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarIcon: ({ color }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "home";
            if (route.name === "home") iconName = "home";
            else if (route.name === "jadwalIbadah") iconName = "calendar";
            else if (route.name === "warta") iconName = "newspaper";
            else if (route.name === "Riwayat") iconName = "time";
            else if (route.name === "profil") iconName = "person";

            return (
              <View style={{ alignItems: "center" }}>
                <Ionicons name={iconName} size={24} color={color} />
              </View>
            );
          },
        })}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="jadwalIbadah" />
        <Tabs.Screen name="warta" />
        <Tabs.Screen name="Riwayat" />
        <Tabs.Screen name="profil" />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#207163ff",
  },
});
