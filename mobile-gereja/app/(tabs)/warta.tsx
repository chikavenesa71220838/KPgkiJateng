import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  useWindowDimensions,
  RefreshControl,
} from "react-native";
import { API_URL } from "../../utils/api";
import { fetchWartaAPI } from "../../services/profileAPI";
import { Ionicons } from "@expo/vector-icons";
import RenderHTML from "react-native-render-html";
import { Colors, FontSize, Layout, Shadows } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";

interface WartaItem {
  id: string;
  judul: string;
  isiWarta: string | { document: any };
  masaBerlaku?: string;
  tanggalPelaksanaan?: string;
  kategori?: { nama: string };
  gambar?: { url: string };
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

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

    if (node.type === "divider") {
      return "<hr />";
    }

    if (node.children) {
      const childrenHtml = node.children.map(serializeNode).join("");

      switch (node.type) {
        case "paragraph":
          return `<p>${childrenHtml}</p>`;
        case "heading":
          return `<h${node.level || 2}>${childrenHtml}</h${node.level || 2}>`;
        case "numbered-list":
        case "ordered-list":
          return `<ol>${childrenHtml}</ol>`;
        case "bulleted-list":
        case "unordered-list":
          return `<ul>${childrenHtml}</ul>`;
        case "list-item":
          return `<li>${childrenHtml}</li>`;
        case "list-item-content":
          return childrenHtml;
        case "link":
          return `<a href="${node.href}">${childrenHtml}</a>`;
        default:
          return childrenHtml;
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

export default function Warta(): React.ReactElement {
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState("");
  const [warta, setWarta] = useState<WartaItem[]>([]);
  const [filteredData, setFilteredData] = useState<WartaItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchWarta = async (showFullLoader = true) => {
    try {
      if (showFullLoader) setLoading(true);
      const data = await fetchWartaAPI();
      setWarta(data);
      setFilteredData(data);
      setError(null);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWarta(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchWarta();
  }, []);

  useEffect(() => {
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();

    let data = warta.filter((item) => {
      if (!item.masaBerlaku) return false;
      const d = new Date(item.masaBerlaku);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    setFilteredData(data);
  }, [selectedDate, warta]);

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 8, color: Colors.textMuted }}>
          Memuat warta gereja...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.danger }}>Gagal memuat data: {error}</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 50,
          paddingTop: 10, // 🔹 Ditambahkan agar posisi title konsisten
          paddingHorizontal: Layout.paddingSmall,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
        }
      >
        <Text style={styles.title}>Warta</Text>

        {/* 🔹 BENTUK DATE PICKER DISAMAKAN (PILL MODERN) */}
        <View style={styles.datePickerContainer}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          </Text>

          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {filteredData.length > 0 ? (
          filteredData.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <View key={item.id} style={styles.cardContainer}>
                {/* Bagian utama kartu */}
                <View style={styles.cardRow}>
                  <View style={styles.leftBox}>
                    {item.gambar?.url ? (
                      <Image
                        source={{
                          uri: `${API_URL.replace("/api/graphql", "")}${
                            item.gambar.url
                          }`,
                        }}
                        style={styles.image}
                      />
                    ) : (
                      <View style={styles.imagePlaceholder} />
                    )}
                  </View>

                  <View style={styles.rightBox}>
                    <View style={styles.tagContainer}>
                      <Text style={styles.tagText}>
                        {item.kategori?.nama || "Umum"}
                      </Text>
                    </View>
                    <Text style={styles.judul}>{item.judul}</Text>
                    <Text style={styles.tanggalPelaksanaan}>
                      {formatDate(item.tanggalPelaksanaan)}
                    </Text>

                    {/* Masa berlaku di pojok kanan bawah */}
                    <Text style={styles.masaBerlaku}>
                      {formatDate(item.masaBerlaku)}
                    </Text>
                  </View>
                </View>
                <View style={styles.dividerWithShadow} />

                {/* Bagian isi warta (expand) */}
                {isExpanded && item.isiWarta && (
                  <View style={styles.detail}>
                    <RenderHTML
                      contentWidth={width}
                      source={{
                        html:
                          typeof item.isiWarta === "object" &&
                          Array.isArray(item.isiWarta.document)
                            ? keystoneDocumentToHtml(item.isiWarta.document)
                            : (item.isiWarta as string),
                      }}
                      tagsStyles={{
                        a: {
                          color: Colors.primary,
                          textDecorationLine: "underline",
                          fontWeight: "bold",
                        },
                        hr: {
                          backgroundColor: Colors.border,
                          height: 1,
                          marginVertical: 10,
                          width: "100%",
                        },
                        p: {
                          fontSize: 13,
                          color: Colors.text,
                          marginBottom: 6,
                        },
                        strong: { fontWeight: "bold" },
                        em: { fontStyle: "italic" },
                        u: { textDecorationLine: "underline" },
                        ol: {
                          paddingLeft: 20,
                          marginBottom: 10,
                        },
                        ul: {
                          paddingLeft: 20,
                          marginBottom: 10,
                        },
                        li: {
                          marginBottom: 4,
                          fontSize: 13,
                          color: Colors.text,
                        },

                        h1: {
                          fontSize: 22,
                          fontWeight: "bold",
                          color: Colors.black,
                          marginVertical: 8,
                        },
                        h2: {
                          fontSize: 20,
                          fontWeight: "bold",
                          color: Colors.black,
                          marginVertical: 6,
                        },
                        h3: {
                          fontSize: 18,
                          fontWeight: "600",
                          color: Colors.black,
                          marginVertical: 4,
                        },
                      }}
                    />
                  </View>
                )}
                <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                  <Text style={styles.expandToggle}>
                    {isExpanded ? "▲ Tutup" : "▼ Baca Selengkapnya"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>Tidak ada warta untuk bulan ini.</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Layout.paddingSmall,
  },

  title: {
    fontSize: FontSize.h1,
    fontWeight: "bold",
    color: Colors.primary,
    marginVertical: Layout.gap,
  },

  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: Layout.radius,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: FontSize.custom.titleCard,
    marginBottom: 12,
  },

  // 🔹 UPDATE STYLE DATE SELECTOR DISINI
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 50,
    marginBottom: 20,
    ...Shadows.shdows,
  },

  dateText: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.text,
  },

  navButton: {
    padding: 4,
  },

  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: Layout.radiusLarge,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    elevation: 2,
  },

  cardRow: {
    flexDirection: "row",
    height: 90,
    borderRadius: Layout.radiusLarge,
    overflow: "hidden",
  },

  leftBox: {
    flex: 1,
    backgroundColor: Colors.black,
  },

  rightBox: {
    flex: 1.3,
    backgroundColor: Colors.white,
    padding: Layout.paddingSmall,
    justifyContent: "center",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.black,
  },

  category: {
    color: Colors.primary,
    fontWeight: "bold",
    fontSize: FontSize.small,
    marginBottom: 2,
  },

  judul: {
    color: Colors.primary,
    fontSize: FontSize.custom.titleCard,
    fontWeight: "600",
    marginBottom: 2,
  },

  tanggalPelaksanaan: {
    color: Colors.primary,
    fontSize: FontSize.custom.dateCard,
  },

  masaBerlaku: {
    position: "absolute",
    bottom: 6,
    right: 8,
    color: Colors.white,
    fontSize: FontSize.caption,
  },

  detail: {
    padding: 8,
    backgroundColor: Colors.cardBackground,
  },

  expandToggle: {
    color: Colors.primary,
    fontStyle: "italic",
    fontSize: FontSize.small,
    textAlign: "right",
    padding: 6,
  },

  tagContainer: {
    backgroundColor: Colors.muda,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  tagText: {
    color: Colors.primary,
    fontWeight: "800", // Tebal kayak di gambar
    fontSize: 10,
    textTransform: "uppercase",
  },

  dividerWithShadow: {
    height: 1,
    backgroundColor: Colors.border, // Garis halus
    shadowColor: "#000", // Efek shadow biar tegas seperti garis merah
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 4, // Jarak dengan teks expand
  },

  emptyText: {
    textAlign: "center",
    color: Colors.textMuted,
    marginTop: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
