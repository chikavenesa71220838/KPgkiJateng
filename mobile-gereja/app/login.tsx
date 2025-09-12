import React from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
    const navigation = useNavigation();

    const handleGoogleSignIn = () => {
        //buat login google
    };

    const handleGuestLogin = () => {
        //buat login tamu
    };

    return (
        <View style={style.container}>
            <Text style={style.title}>Masuk</Text>
            <View style={style.buttonContainer}>
                <TouchableOpacity style={style.googleButton} onPress={handleGoogleSignIn}>
                    <Text style={style.googleButtonText}>Masuk dengan Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.guestButton} onPress={handleGuestLogin}>
                    <Text style={style.guestButtonText}>Masuk sebagai Tamu</Text>
                </TouchableOpacity>
            </View>
        </View>
    )

}

const style = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, backgroundColor: '#FFF' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 40 },
    buttonContainer: { alignItems: 'center', width: '100%' },
    googleButton: { backgroundColor: '#6A8BFF', paddingVertical: 15, borderRadius: 25, width: '80%', marginBottom: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    googleButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    icon: { marginRight: 10 },
    guestButton: { backgroundColor: '#E0E0E0', paddingVertical: 15, borderRadius: 25, alignItems: 'center', justifyContent: 'center', width: '80%' },
    guestButtonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
})