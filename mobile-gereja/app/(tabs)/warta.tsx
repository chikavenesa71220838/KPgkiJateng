import React, { useEffect, useState } from "react";
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
} from "react-native";
import { API_URL } from "../../utils/api";
import { Ionicons } from "@expo/vector-icons";
import RenderHTML from "react-native-render-html";
import { Colors, FontSize, Layout } from "../../constants/theme";

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
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchWarta = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
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
      if (result.errors)
        throw new Error(result.errors[0]?.message || "GraphQL Error");

      const data = result.data?.wartas || [];
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
        {/* UBAH WARNA LOADING */}
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 50,
        paddingHorizontal: Layout.paddingSmall,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Warta</Text>

      <View style={styles.datePickerContainer}>
        <TouchableOpacity onPress={handlePrevMonth}>
          <Ionicons name="chevron-back" size={20} color={Colors.primary} />
        </TouchableOpacity>

        <Text style={styles.dateText}>
          {selectedDate.toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          })}
        </Text>

        <TouchableOpacity onPress={handleNextMonth}>
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
                  <Text style={styles.category}>
                    {item.kategori?.nama || "Umum"}
                  </Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
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

  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  dateText: {
    fontSize: FontSize.body,
    fontWeight: "bold",
    color: Colors.text,
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
    backgroundColor: Colors.primary,
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
    color: Colors.white,
    fontWeight: "bold",
    fontSize: FontSize.small,
    marginBottom: 2,
  },

  judul: {
    color: Colors.white,
    fontSize: FontSize.custom.titleCard,
    fontWeight: "600",
    marginBottom: 2,
  },

  tanggalPelaksanaan: {
    color: Colors.white,
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
