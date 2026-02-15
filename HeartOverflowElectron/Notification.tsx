import React, { useEffect, useMemo, useState } from "react";

const { ipcRenderer } = window.require("electron");

const Notification: React.FC = () => {
  const [truthLabel, setTruthLabel] = useState("Checking...");
  const [confidence, setConfidence] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleTruthLabel = (_event: any, label: string) => {
      setTruthLabel(label);
      setLoading(label === "Checking...");
    };

    const handleConfidence = (_event: any, conf: number) => {
      setConfidence(conf);
    };

    ipcRenderer.on("truth-label", handleTruthLabel);
    ipcRenderer.on("confidence", handleConfidence);

    return () => {
      ipcRenderer.removeListener("truth-label", handleTruthLabel);
      ipcRenderer.removeListener("confidence", handleConfidence);
    };
  }, []);

  const palette = useMemo(() => {
    const label = truthLabel.toLowerCase();
    if (label === "likely true") {
      return {
        card: "#0e2216",
        border: "#1c4d33",
        accent: "#35d07f",
        accentDim: "#1f7a4a",
        muted: "#9ed8b6",
        text: "#e8fff1"
      };
    }
    if (label === "unknown" || label === "mixed/uncertain") {
      return {
        card: "#2a1a08",
        border: "#6e4c18",
        accent: "#ffc64d",
        accentDim: "#8f6421",
        muted: "#e6cb92",
        text: "#fff8e8"
      };
    }
    if (label === "likely false") {
      return {
        card: "#2a1010",
        border: "#6f2a2a",
        accent: "#ff6e6e",
        accentDim: "#8f2e2e",
        muted: "#efaaaa",
        text: "#fff0f0"
      };
    }
    return {
      card: "#1a2230",
      border: "#2f4265",
      accent: "#7ba8ff",
      accentDim: "#32508b",
      muted: "#a9bddf",
      text: "#eef4ff"
    };
  }, [truthLabel]);

  const handleClick = () => {
    ipcRenderer.send("open-dashboard");
  };

  const confidencePct = Math.round(Math.abs(confidence) * 100);

  return (
    <div
      onClick={handleClick}
      style={{
        margin: 0,
        background: "transparent",
        cursor: "pointer",
        userSelect: "none",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
      }}
    >
      <div
        style={{
          width: "286px",
          borderRadius: "14px",
          background: palette.card,
          border: `1px solid ${palette.border}`,
          boxShadow: "0 20px 40px rgba(0,0,0,.6)",
          padding: "10px 12px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "7px",
              background: palette.accentDim,
              color: "#03150c",
              fontWeight: 900,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              fontSize: "14px"
            }}
          >
            {loading ? "..." : truthLabel.toLowerCase() === "likely false" ? "!" : "?"}
          </div>
          <div style={{ color: palette.text, fontSize: "16px", fontWeight: 600 }}>
            {loading ? "Checking..." : truthLabel}
          </div>
          <div style={{ marginLeft: "auto", color: palette.accent, fontWeight: 700, fontSize: "12px" }}>{confidencePct}%</div>
        </div>
        <div style={{ marginTop: "4px", color: palette.muted, fontSize: "11px" }}>Click for details</div>
      </div>
    </div>
  );
};

export default Notification;