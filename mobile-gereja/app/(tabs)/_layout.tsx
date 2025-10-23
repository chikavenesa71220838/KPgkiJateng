import { withLayoutContext } from 'expo-router';
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons} from '@expo/vector-icons';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Background } from '@react-navigation/elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


const { Navigator } = createBottomTabNavigator();
const Tabs = withLayoutContext(Navigator);

export default function TabLayout() {

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Image source={require("../../../mobile-gereja/assets/images/logogereja.png")}
        style={styles.logo}
      />
      <Text style={styles.headerText}>GKI Ngupasan</Text>
    </View>

    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#ffd000ff",
        tabBarInactiveTintColor: "white",
        tabBarShowLabel: false,
        tabBarPosition: "bottom",
        tabBarStyle: {
          backgroundColor: "#207163ff",
          borderTopWidth: 0,
          elevation: 0
        },
        tabBarIndicatorStyle: {
          backgroundColor: "#ffd000ff",
          height: 5,
          borderRadius: 2,
          top: 0
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 5
        },

        tabBarIcon: ({ focused, color}) => {
          const size = focused ? 24 : 24;
          let iconName: keyof typeof Ionicons.glyphMap = "home";
          
          if (route.name === "home") {
            iconName = "home";
          } else if (route.name === "jadwalIbadah") {
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
      <text></text>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="jadwalIbadah" />
      <Tabs.Screen name="warta"  />
      <Tabs.Screen name="Riwayat"  />
      <Tabs.Screen name="profil"/>
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