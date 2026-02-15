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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const { ipcRenderer } = window.require("electron");
const Notification = () => {
    const [truthLabel, setTruthLabel] = (0, react_1.useState)("Checking...");
    const [confidence, setConfidence] = (0, react_1.useState)(0);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const handleTruthLabel = (_event, label) => {
            setTruthLabel(label);
            setLoading(label === "Checking...");
        };
        const handleConfidence = (_event, conf) => {
            setConfidence(conf);
        };
        ipcRenderer.on("truth-label", handleTruthLabel);
        ipcRenderer.on("confidence", handleConfidence);
        return () => {
            ipcRenderer.removeListener("truth-label", handleTruthLabel);
            ipcRenderer.removeListener("confidence", handleConfidence);
        };
    }, []);
    const palette = (0, react_1.useMemo)(() => {
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
    return (react_1.default.createElement("div", { onClick: handleClick, style: {
            margin: 0,
            background: "transparent",
            cursor: "pointer",
            userSelect: "none",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
        } },
        react_1.default.createElement("div", { style: {
                width: "286px",
                borderRadius: "14px",
                background: palette.card,
                border: `1px solid ${palette.border}`,
                boxShadow: "0 20px 40px rgba(0,0,0,.6)",
                padding: "10px 12px"
            } },
            react_1.default.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
                react_1.default.createElement("div", { style: {
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
                    } }, loading ? "..." : truthLabel.toLowerCase() === "likely false" ? "!" : "?"),
                react_1.default.createElement("div", { style: { color: palette.text, fontSize: "16px", fontWeight: 600 } }, loading ? "Checking..." : truthLabel),
                react_1.default.createElement("div", { style: { marginLeft: "auto", color: palette.accent, fontWeight: 700, fontSize: "12px" } },
                    confidencePct,
                    "%")),
            react_1.default.createElement("div", { style: { marginTop: "4px", color: palette.muted, fontSize: "11px" } }, "Click for details"))));
};
exports.default = Notification;
