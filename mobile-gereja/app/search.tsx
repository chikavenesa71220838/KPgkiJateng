import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  Image,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  useWindowDimensions,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack, useNavigation } from "expo-router";
import { API_URL } from "../utils/api";
import { Colors, FontSize, Layout, Shadows } from "../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import RenderHTML from "react-native-render-html";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function keystoneDocumentToHtml(document: any[]): string {
  if (!Array.isArray(document)) return "";

  const serializeNode = (node: any): string => {
    if (!node) return "";
    if (node.type === "divider") return "<hr />";
    if (node.children) {
      const childrenHtml = node.children.map(serializeNode).join("");
      switch (node.type) {
        case "paragraph": return `<p>${childrenHtml}</p>`;
        case "heading": return `<h${node.level || 2}>${childrenHtml}</h${node.level || 2}>`;
        case "numbered-list":
        case "ordered-list": return `<ol>${childrenHtml}</ol>`;
        case "bulleted-list":
        case "unordered-list": return `<ul>${childrenHtml}</ul>`;
        case "list-item": return `<li>${childrenHtml}</li>`;
        case "list-item-content": return childrenHtml;
        case "link": return `<a href="${node.href}">${childrenHtml}</a>`;
        default: return childrenHtml;
      }
    }
    let text = node.text || "";
    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    if (node.strikethrough) text = `<s>${text}</s>`;
    if (node.code) text = `<code>${text}</code>`;
    return text;
  };
  return document.map(serializeNode).join("");
}

export default function SearchScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [jadwalData, setJadwalData] = useState<any[]>([]);
  const [wartaData, setWartaData] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ HeaderShown: false });
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    Keyboard.dismiss();
    router.back();
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              jadwalIbadahs(orderBy: { tanggal: desc }) {
                id
                tanggal
                topik
                detailIbadah {
                  id
                  jam
                  url
                  pengkhotbah { nama }
                  banner { url }
                }
              }
              wartas(orderBy: { masaBerlaku: desc }) {
                id
                judul
                isiWarta { document } 
                masaBerlaku
                tanggalPelaksanaan
                kategori { nama }
                gambar { url }
              }
            }
          `,
        }),
      });

      const result = await res.json();
      setJadwalData(result.data?.jadwalIbadahs || []);
      setWartaData(result.data?.wartas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setResults([]);
      return;
    }

    const text = searchQuery.toLowerCase();

    const jadwalFiltered = jadwalData.flatMap((item) =>
      item.detailIbadah
        .filter((d: any) => {
          const topik = item.topik ? item.topik.toLowerCase() : "";
          const pengkhotbah = d.pengkhotbah?.nama
            ? d.pengkhotbah.nama.toLowerCase()
            : "";
          return topik.includes(text) || pengkhotbah.includes(text);
        })
        .map((d: any) => ({
          type: "jadwal",
          id: d.id,
          tanggal: item.tanggal,
          topik: item.topik,
          jam: d.jam,
          url: d.url,
          pengkhotbah: d.pengkhotbah?.nama,
          banner: d.banner?.url,
        }))
    );

    const wartaFiltered = wartaData
      .filter((item) => {
        const judul = item.judul ? item.judul.toLowerCase() : "";
        const kategori = item.kategori?.nama
          ? item.kategori.nama.toLowerCase()
          : "";
        return judul.includes(text) || kategori.includes(text);
      })
      .map((item) => ({
        type: "warta",
        id: item.id,
        judul: item.judul,
        kategori: item.kategori?.nama,
        masaBerlaku: item.masaBerlaku,
        tanggalPelaksanaan: item.tanggalPelaksanaan,
        file: item.gambar?.url,
        isiWarta: item.isiWarta,
      }));

    setResults([...jadwalFiltered, ...wartaFiltered]);
  }, [searchQuery, jadwalData, wartaData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.container}>
        
        {/* Header Konsisten */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Pencarian</Text>
        </View>

        {/* Input Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Cari jadwal dan warta..."
            placeholderTextColor={Colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
             <TouchableOpacity onPress={() => setSearchQuery("")} style={{ padding: 4 }}>
               <Ionicons name="close-circle" size={18} color={Colors.placeholder} />
             </TouchableOpacity>
          )}
        </View>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ color: Colors.textMuted, marginTop: 8 }}>
              Mencari data...
            </Text>
          </View>
        )}

        {!loading && (
          <ScrollView
            style={{ marginTop: 14 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          >
            {results.length > 0 ? (
              results.map((item, index) => {
                const uniqueId = `${item.type}-${item.id}-${index}`;
                const isExpanded = expandedId === uniqueId;

                return (
                  <View key={uniqueId} style={styles.cardContainer}>
                    {item.type === "jadwal" ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={async () => {
                          if (item.url) {
                            const supported = await Linking.canOpenURL(item.url);
                            if (supported) await Linking.openURL(item.url);
                          }
                        }}
                      >
                        <View style={styles.cardRow}>
                          <View style={styles.leftBox}>
                            {item.banner ? (
                              <Image
                                source={{ uri: `${API_URL.replace("/api/graphql", "")}${item.banner}` }}
                                style={styles.image}
                              />
                            ) : (
                              <View style={styles.imagePlaceholder}>
                                 <Ionicons name="image-outline" size={24} color={Colors.placeholder} />
                              </View>
                            )}
                            
                          </View>

                          <View style={styles.rightBox}>
                            <View style={styles.tagContainer}>
                              <Text style={styles.tagText} numberOfLines={1}>
                                {item.topik || "Umum"}
                              </Text>
                            </View>
                            <Text style={styles.judul} numberOfLines={2}>
                              {formatDate(item.tanggal)}
                            </Text>
                            <View style={styles.infoRow}>
                              <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                              <Text style={styles.isiCard}>{item.jam} WIB</Text>
                            </View>
                            <View style={styles.infoRow}>
                              <Ionicons name="person-outline" size={14} color={Colors.textMuted} />
                              <Text style={styles.isiCard} numberOfLines={1}>
                                {item.pengkhotbah || "-"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View>
                        <View style={styles.cardRow}>
                          <View style={styles.leftBox}>
                            {item.file ? (
                              <Image
                                source={{ uri: `${API_URL.replace("/api/graphql", "")}${item.file}` }}
                                style={styles.image}
                              />
                            ) : (
                              <View style={styles.imagePlaceholder}>
                                 <Ionicons name="image-outline" size={24} color={Colors.placeholder} />
                              </View>
                            )}
                          </View>

                          <View style={styles.rightBox}>
                            <View style={styles.tagContainer}>
                              <Text style={styles.tagText} numberOfLines={1}>
                                {item.kategori || "Umum"}
                              </Text>
                            </View>
                            <Text style={styles.judul} numberOfLines={2}>{item.judul}</Text>
                            <View style={styles.infoRow}>
                              <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                              <Text style={styles.isiCard} numberOfLines={1}>
                                {formatDate(item.tanggalPelaksanaan)}
                              </Text>
                            </View>
                            <View style={styles.infoRow}>
                              <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
                              <Text style={styles.isiCard} numberOfLines={1}>
                                S/d {formatDate(item.masaBerlaku)}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Garis Pembatas Halus */}
                        <View style={styles.dividerWithShadow} />

                        {/* Konten Expandable */}
                        {isExpanded && item.isiWarta && (
                          <View style={styles.detail}>
                            <RenderHTML
                              contentWidth={width}
                              source={{
                                html: typeof item.isiWarta === "object" && Array.isArray(item.isiWarta.document)
                                    ? keystoneDocumentToHtml(item.isiWarta.document)
                                    : (item.isiWarta as string),
                              }}
                              tagsStyles={{
                                a: { color: Colors.primary, textDecorationLine: "underline", fontWeight: "bold" },
                                hr: { backgroundColor: Colors.border, height: 1, marginVertical: 10, width: "100%" },
                                p: { fontSize: 13, color: Colors.text, marginBottom: 6 },
                                strong: { fontWeight: "bold" },
                                em: { fontStyle: "italic" },
                                u: { textDecorationLine: "underline" },
                                ol: { paddingLeft: 20, marginBottom: 10 },
                                ul: { paddingLeft: 20, marginBottom: 10 },
                                li: { marginBottom: 4, fontSize: 13, color: Colors.text },
                                h1: { fontSize: 22, fontWeight: "bold", color: Colors.black, marginVertical: 8 },
                                h2: { fontSize: 20, fontWeight: "bold", color: Colors.black, marginVertical: 6 },
                                h3: { fontSize: 18, fontWeight: "600", color: Colors.black, marginVertical: 4 },
                              }}
                            />
                          </View>
                        )}
                        <TouchableOpacity onPress={() => toggleExpand(uniqueId)}>
                          <Text style={styles.expandToggle}>
                            {isExpanded ? "▲ Tutup" : "▼ Baca Selengkapnya"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            ) : searchQuery.trim() !== "" ? (
              <Text style={styles.emptyText}>Tidak ada hasil ditemukan.</Text>
            ) : null}
          </ScrollView>
        )}
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Layout.paddingSmall,
    paddingTop: 10, 
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
    paddingHorizontal: 6,
  },
  backButton: {
    marginRight: 10,
  },
  headerText: {
    fontSize: FontSize.h1, 
    fontWeight: "bold",
    color: Colors.primary,
  },
  
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 50, 
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginHorizontal: 4,
    ...Shadows.shdows,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    paddingVertical: 8,
  } as any,
  ...(Platform.OS === "web" && {
    input: {
      flex: 1,
      fontSize: 14,
      color: Colors.text,
      paddingVertical: 8,
      outlineStyle: "none" as any,
    },
  }),
  
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },

  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: Layout.radiusLarge,
    marginBottom: 14,
    marginHorizontal: 4, 
    ...Shadows.shdows,
    overflow: "hidden",
  },
  cardRow: {
    flexDirection: "row",
    height: 130,
    borderRadius: Layout.radiusLarge,
    overflow: "hidden",
  },
  leftBox: {
    width: 120,
    backgroundColor: Colors.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  rightBox: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 12,
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.inputBackground,
    justifyContent: "center",
    alignItems: "center",
  },

  tagContainer: {
    backgroundColor: Colors.muda,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  tagText: {
    color: Colors.primary,
    fontWeight: "800",
    fontSize: 10,
    textTransform: "uppercase",
  },
  judul: {
    color: Colors.text, 
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    gap: 4,
  },
  isiCard: {
    color: Colors.textMuted,
    fontSize: 12,
    flexShrink: 1,
    fontWeight: "500",
  },

  dividerWithShadow: {
    height: 1,
    backgroundColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 4,
  },
  detail: {
    padding: 12,
    backgroundColor: Colors.cardBackground,
  },
  expandToggle: {
    color: Colors.textMuted,
    fontStyle: "italic",
    fontSize: 12,
    textAlign: "right",
    padding: 8,
    paddingRight: 12,
  },

  emptyText: {
    textAlign: "center",
    color: Colors.textMuted,
    marginTop: 40,
    fontSize: 15,
  },
});