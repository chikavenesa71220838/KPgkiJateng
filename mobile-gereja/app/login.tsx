import React, { useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';


export default function LoginScreen() {
    const navigation = useNavigation();
    
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '117724603836-fvv3rpskks8svt7mo33oeodtlddn328s.apps.googleusercontent.com',
            offlineAccess: true,
        });
    }, []);

    const handleGoogleSignIn = async () => {
        try {

            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.user.idToken;
            await loginWithKeystone(idToken);

        } catch (error:any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('Login dibatalkan oleh user');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Login sedang berjalan');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Google Play Services tidak tersedia');
            } else {
                console.error('Terjadi kesalahan:', error);
            }
        }
    };

    const loginWithKeystone = async (idToken:string) => {
        try {

            const response = await fetch('http://localhost:3000/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Login berhasil:', data);

            } else {
                console.error('Login gagal di server:', data);
            }
        } catch (error) {
            console.error('Terjadi kesalahan saat menghubungi server:', error);
        }
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