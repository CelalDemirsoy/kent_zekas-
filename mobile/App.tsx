import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ResultItem = {
  kategori: string;
  etiket: string;
  guven: number;
  risk: string;
  aciklama: string;
};

type AnalyzeResponse = {
  basarili: boolean;
  sonuclar: ResultItem[];
  ozet: string;
};

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [status, setStatus] = useState("KentAI mobil saha denetimi hazýr.");

  // Kamera fotoðrafýný base64 alýp Go backend'e gönderir.
  async function captureAndAnalyze() {
    if (!cameraRef.current || loading) return;

    setLoading(true);
    setStatus("Görüntü alýndý, KVKK anonimleþtirme ve analiz baþlýyor...");

    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.75 });
      const image = `data:image/jpeg;base64,${photo?.base64 ?? ""}`;

      const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, dosyaAdi: "expo-camera.jpg" }),
      });

      const data = (await response.json()) as AnalyzeResponse;
      if (!response.ok || !data.basarili) throw new Error("Analiz baþarýsýz");

      setResults(data.sonuclar ?? []);
      setStatus(data.ozet || "Analiz tamamlandý.");
    } catch {
      setResults([
        {
          kategori: "moloz",
          etiket: "Moloz",
          guven: 94,
          risk: "yüksek",
          aciklama: "Mobil fallback: Güngören bölgesinde 2m² atýk birikimi tespit edildi.",
        },
        {
          kategori: "isgaliye",
          etiket: "Ýþgaliye",
          guven: 88,
          risk: "orta",
          aciklama: "Mobil fallback: Kaldýrým iþgali tespit edildi, zabýta birimine loglandý.",
        },
      ]);
      setStatus("Backend yanýt veremedi; güvenli mock fallback kullanýldý.");
    } finally {
      setLoading(false);
    }
  }

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.title}>KentAI Mobile</Text>
          <Text style={styles.muted}>Canlý saha denetimi için kamera izni gerekli.</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Kamera Ýzni Ver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>KentAI</Text>
        <Text style={styles.subtitle}>Mobil Saha Denetimi</Text>

        <View style={styles.cameraWrap}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        </View>

        <TouchableOpacity style={styles.button} onPress={captureAndAnalyze} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Analiz Ediliyor..." : "Fotoðraf Çek ve Analiz Et"}</Text>
        </TouchableOpacity>

        <Text style={styles.status}>{status}</Text>

        {results.map((item) => (
          <View key={`${item.kategori}-${item.guven}`} style={styles.card}>
            <Text style={styles.cardTitle}>{item.etiket} · %{item.guven}</Text>
            <Text style={styles.cardText}>{item.aciklama}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 20, gap: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#020617" },
  logo: { color: "#f97316", fontSize: 34, fontWeight: "900" },
  title: { color: "#f8fafc", fontSize: 28, fontWeight: "800", marginBottom: 8 },
  subtitle: { color: "#94a3b8", fontSize: 14 },
  muted: { color: "#94a3b8", textAlign: "center", marginBottom: 20 },
  cameraWrap: { height: 420, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "#1e293b" },
  camera: { flex: 1 },
  button: { backgroundColor: "#f97316", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "800" },
  status: { color: "#cbd5e1", fontSize: 13, lineHeight: 20 },
  card: { borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, padding: 16, backgroundColor: "#0f172a" },
  cardTitle: { color: "#f8fafc", fontWeight: "800", marginBottom: 4 },
  cardMeta: { color: "#f97316", fontSize: 12, marginBottom: 8 },
  cardText: { color: "#94a3b8", fontSize: 13, lineHeight: 19 },
});
