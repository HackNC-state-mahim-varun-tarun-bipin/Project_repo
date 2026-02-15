import React, { useEffect, useMemo, useState } from "react";
import { Button } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import Settings from "./Settings";

type Citation = {
  url?: string;
  source?: string;
  snippet?: string;
  stance?: string;
};

const App: React.FC = () => {
  const [clipboardText, setClipboardText] = useState("Waiting for clipboard text...");
  const [truthLabel, setTruthLabel] = useState<string>("UNKNOWN");
  const [confidence, setConfidence] = useState<number>(0);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const palette = useMemo(() => {
    const label = truthLabel.toLowerCase();
    if (label === "likely true") {
      return {
        bg: "#07130c",
        card: "#0e2216",
        card2: "#133120",
        text: "#e8fff1",
        muted: "#9ed8b6",
        accent: "#35d07f",
        accentDim: "#1f7a4a",
        border: "#1c4d33"
      };
    }
    if (label === "unknown" || label === "mixed/uncertain") {
      return {
        bg: "#181006",
        card: "#2a1a08",
        card2: "#35240f",
        text: "#fff8e8",
        muted: "#e6cb92",
        accent: "#ffc64d",
        accentDim: "#8f6421",
        border: "#6e4c18"
      };
    }
    if (label === "likely false") {
      return {
        bg: "#1b0909",
        card: "#2a1010",
        card2: "#3b1717",
        text: "#fff0f0",
        muted: "#efaaaa",
        accent: "#ff6e6e",
        accentDim: "#8f2e2e",
        border: "#6f2a2a"
      };
    }
    return {
      bg: "#10141b",
      card: "#1a2230",
      card2: "#202b3d",
      text: "#eef4ff",
      muted: "#a9bddf",
      accent: "#7ba8ff",
      accentDim: "#32508b",
      border: "#2f4265"
    };
  }, [truthLabel]);

  useEffect(() => {
    const { ipcRenderer } = window.require("electron");

    ipcRenderer.on("clipboard-update", (_event: any, text: string) => {
      setClipboardText(text);
      setTruthLabel("UNKNOWN");
      setConfidence(0);
      setCitations([]);
      setSource("");
      setLoading(true);
      setExpanded(false);
    });

    ipcRenderer.on("verification-result", (_event: any, response: any) => {
      setLoading(false);
      if (!response) {
        return;
      }
      if (response.verdict) {
        setTruthLabel(response.verdict);
      }
      if (response.confidence !== undefined) {
        setConfidence(response.confidence);
      }
      if (response.citations) {
        setCitations(response.citations);
      }
      if (response.source) {
        setSource(response.source);
      }
    });

    ipcRenderer.on("open-settings", () => {
      setShowSettings(true);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        ipcRenderer.send("hide-window");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (showSettings) {
    return <Settings onBack={() => setShowSettings(false)} />;
  }

  const confidencePct = Math.round(Math.abs(confidence) * 100);

  return (
    <div
      style={{
        margin: 0,
        minHeight: "100vh",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(180deg, ${palette.bg}, ${palette.card})`,
        color: palette.text,
        fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          borderRadius: "18px",
          background: palette.card,
          border: `1px solid ${palette.border}`,
          boxShadow: "0 20px 40px rgba(0,0,0,.6)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            borderBottom: `1px solid ${palette.border}`
          }}
        >
          <div style={{ color: palette.muted, fontSize: "12px", letterSpacing: "0.6px" }}>HeartOverflow</div>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setShowSettings(true)}
            size="small"
            style={{ background: "transparent", border: "none", color: palette.muted }}
          />
        </div>

        <div
          style={{
            padding: "9px 18px 10px",
            cursor: "pointer",
            transition: "background .2s ease"
          }}
          onClick={() => setExpanded((v) => !v)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: palette.accentDim,
                color: "#03150c",
                fontWeight: 900,
                display: "grid",
                placeItems: "center",
                flexShrink: 0
              }}
            >
              {loading ? "..." : truthLabel.toLowerCase() === "likely false" ? "!" : "?"}
            </div>
            <div style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "0.3px" }}>
              {loading ? "Checking..." : truthLabel}
            </div>
            <div style={{ marginLeft: "auto", color: palette.muted, width: "24px", height: "24px" }}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .3s" }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        <div
          style={{
            maxHeight: expanded ? "520px" : "0px",
            overflow: "hidden",
            transition: "max-height .45s ease",
            background: palette.card2,
            borderTop: `1px solid ${palette.border}`
          }}
        >
          <div style={{ padding: "12px 18px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: palette.muted, marginBottom: "8px" }}>
              <span style={{ color: palette.accent, fontWeight: 600 }}>{confidencePct}% confidence</span>
              {source && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    padding: "3px 8px",
                    background: "rgba(61,208,127,.1)",
                    border: "1px solid rgba(61,208,127,.3)",
                    borderRadius: "4px",
                    color: palette.muted
                  }}
                >
                  {source}
                </span>
              )}
            </div>

            <div
              style={{
                background: "rgba(0, 0, 0, 0.25)",
                border: `1px solid ${palette.border}`,
                borderRadius: "10px",
                padding: "12px",
                fontSize: "14px",
                lineHeight: 1.45,
                marginBottom: "16px"
              }}
            >
              {clipboardText}
            </div>

            {citations.length > 0 && (
              <>
                <div style={{ fontSize: "12px", letterSpacing: "1px", color: palette.muted, marginBottom: "8px" }}>SOURCES</div>
                <div style={{ maxHeight: "220px", overflowY: "auto", paddingRight: "6px" }}>
                  {citations.map((citation, index) => (
                    <div key={index} style={{ marginBottom: "10px" }}>
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: palette.accent, textDecoration: "none", fontWeight: 500 }}
                      >
                        {citation.source || citation.url || `Source ${index + 1}`}
                      </a>
                      {citation.snippet && <p style={{ margin: "3px 0 0", fontSize: "13px", color: palette.muted }}>{citation.snippet}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;