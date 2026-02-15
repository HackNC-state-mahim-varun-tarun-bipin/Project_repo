"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const antd_1 = require("antd");
const icons_1 = require("@ant-design/icons");
const Settings_1 = __importDefault(require("./Settings"));
const App = () => {
    const [clipboardText, setClipboardText] = (0, react_1.useState)("Waiting for clipboard text...");
    const [truthLabel, setTruthLabel] = (0, react_1.useState)("UNKNOWN");
    const [confidence, setConfidence] = (0, react_1.useState)(0);
    const [citations, setCitations] = (0, react_1.useState)([]);
    const [source, setSource] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [showSettings, setShowSettings] = (0, react_1.useState)(false);
    const [expanded, setExpanded] = (0, react_1.useState)(false);
    const palette = (0, react_1.useMemo)(() => {
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
    (0, react_1.useEffect)(() => {
        const { ipcRenderer } = window.require("electron");
        ipcRenderer.on("clipboard-update", (_event, text) => {
            setClipboardText(text);
            setTruthLabel("UNKNOWN");
            setConfidence(0);
            setCitations([]);
            setSource("");
            setLoading(true);
            setExpanded(false);
        });
        ipcRenderer.on("verification-result", (_event, response) => {
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
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                ipcRenderer.send("hide-window");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    if (showSettings) {
        return react_1.default.createElement(Settings_1.default, { onBack: () => setShowSettings(false) });
    }
    const confidencePct = Math.round(Math.abs(confidence) * 100);
    return (react_1.default.createElement("div", { style: {
            margin: 0,
            minHeight: "100vh",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(180deg, ${palette.bg}, ${palette.card})`,
            color: palette.text,
            fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
        } },
        react_1.default.createElement("div", { style: {
                width: "100%",
                maxWidth: "640px",
                borderRadius: "18px",
                background: palette.card,
                border: `1px solid ${palette.border}`,
                boxShadow: "0 20px 40px rgba(0,0,0,.6)",
                overflow: "hidden"
            } },
            react_1.default.createElement("div", { style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderBottom: `1px solid ${palette.border}`
                } },
                react_1.default.createElement("div", { style: { color: palette.muted, fontSize: "12px", letterSpacing: "0.6px" } }, "HeartOverflow"),
                react_1.default.createElement(antd_1.Button, { icon: react_1.default.createElement(icons_1.SettingOutlined, null), onClick: () => setShowSettings(true), size: "small", style: { background: "transparent", border: "none", color: palette.muted } })),
            react_1.default.createElement("div", { style: {
                    padding: "9px 18px 10px",
                    cursor: "pointer",
                    transition: "background .2s ease"
                }, onClick: () => setExpanded((v) => !v) },
                react_1.default.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px" } },
                    react_1.default.createElement("div", { style: {
                            width: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            background: palette.accentDim,
                            color: "#03150c",
                            fontWeight: 900,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0
                        } }, loading ? "..." : truthLabel.toLowerCase() === "likely false" ? "!" : "?"),
                    react_1.default.createElement("div", { style: { fontSize: "22px", fontWeight: 600, letterSpacing: "0.3px" } }, loading ? "Checking..." : truthLabel),
                    react_1.default.createElement("div", { style: { marginLeft: "auto", color: palette.muted, width: "24px", height: "24px" } },
                        react_1.default.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", style: { transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .3s" } },
                            react_1.default.createElement("polyline", { points: "6 9 12 15 18 9" }))))),
            react_1.default.createElement("div", { style: {
                    maxHeight: expanded ? "520px" : "0px",
                    overflow: "hidden",
                    transition: "max-height .45s ease",
                    background: palette.card2,
                    borderTop: `1px solid ${palette.border}`
                } },
                react_1.default.createElement("div", { style: { padding: "12px 18px 18px" } },
                    react_1.default.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: palette.muted, marginBottom: "8px" } },
                        react_1.default.createElement("span", { style: { color: palette.accent, fontWeight: 600 } },
                            confidencePct,
                            "% confidence"),
                        source && (react_1.default.createElement("span", { style: {
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "12px",
                                padding: "3px 8px",
                                background: "rgba(61,208,127,.1)",
                                border: "1px solid rgba(61,208,127,.3)",
                                borderRadius: "4px",
                                color: palette.muted
                            } }, source))),
                    react_1.default.createElement("div", { style: {
                            background: "rgba(0, 0, 0, 0.25)",
                            border: `1px solid ${palette.border}`,
                            borderRadius: "10px",
                            padding: "12px",
                            fontSize: "14px",
                            lineHeight: 1.45,
                            marginBottom: "16px"
                        } }, clipboardText),
                    citations.length > 0 && (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement("div", { style: { fontSize: "12px", letterSpacing: "1px", color: palette.muted, marginBottom: "8px" } }, "SOURCES"),
                        react_1.default.createElement("div", { style: { maxHeight: "220px", overflowY: "auto", paddingRight: "6px" } }, citations.map((citation, index) => (react_1.default.createElement("div", { key: index, style: { marginBottom: "10px" } },
                            react_1.default.createElement("a", { href: citation.url, target: "_blank", rel: "noopener noreferrer", style: { color: palette.accent, textDecoration: "none", fontWeight: 500 } }, citation.source || citation.url || `Source ${index + 1}`),
                            citation.snippet && react_1.default.createElement("p", { style: { margin: "3px 0 0", fontSize: "13px", color: palette.muted } }, citation.snippet))))))))))));
};
exports.default = App;
