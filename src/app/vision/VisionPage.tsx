import { useState } from "react";

type CaptureEvent = {
  event_id: number;
  event_dir: string;
  frame_path: string;
  roi_path?: string | null;
  event_json_path: string;
};

type CaptureResponse = {
  status?: string;
  event?: CaptureEvent;
  error?: string;
};

export default function VisionPage() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [eventData, setEventData] = useState<CaptureResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    setLoading(true);
    setImageUrl(null);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/vision/capture", {
        method: "POST",
      });

      const data: CaptureResponse = await response.json();
      console.log("Response:", data);

      if (!response.ok || data.error) {
        throw new Error(data.error || "Error en captura");
      }

      setEventData(data);

      // 🔥 fallback inteligente
      const imagePath =
        data?.event?.roi_path || data?.event?.frame_path || null;

      if (imagePath) {
        const fullUrl = `http://127.0.0.1:8000/${imagePath}`;
        setImageUrl(fullUrl);
      }

    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error desconocido";
      console.error("Error capturando:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Vision Scanner</h1>

      <button onClick={handleCapture} disabled={loading}>
        {loading ? "Capturando..." : "Capturar código"}
      </button>

      {/* 🔴 Error */}
      {error && (
        <div style={{ marginTop: 20, color: "red" }}>
          {error}
        </div>
      )}

      {/* 🖼️ Imagen */}
      {imageUrl && (
        <div style={{ marginTop: 20 }}>
          <h3>Imagen capturada</h3>
          <img
            src={imageUrl}
            alt="Captura"
            width={400}
            style={{
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
        </div>
      )}

      {/* 📦 JSON */}
      {eventData && (
        <pre style={{ marginTop: 20 }}>
          {JSON.stringify(eventData, null, 2)}
        </pre>
      )}
    </div>
  );
}