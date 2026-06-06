import { useState, useRef, useEffect } from "react";

const ANTHROPIC_MODEL = "claude-sonnet-4-5";
const API_KEY = import.meta.env.VITE_API_KEY; // substitua pela sua chave

const theme = {
  bg: "#f4f9f4", card: "#ffffff", primary: "#2d7a3a", primaryLight: "#e8f5e9",
  secondary: "#66bb6a", accent: "#a5d6a7", text: "#1b3a1f", muted: "#6b8f71",
  danger: "#c0392b", dangerLight: "#fdecea", border: "#d0e8d2", garden: "#795548", gardenLight: "#efebe9",
};

const S = {
  app: { minHeight: "100vh", background: theme.bg, fontFamily: "'Segoe UI', sans-serif", color: theme.text, maxWidth: 480, margin: "0 auto" },
  header: { background: `linear-gradient(135deg, ${theme.primary}, #1b5e20)`, padding: "20px 24px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" },
  logo: { fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: 1 },
  tagline: { color: theme.accent, fontSize: 13, marginTop: 2 },
  tabs: { display: "flex", margin: "20px 16px 0", gap: 8 },
  tab: (active, variant) => {
    const colors = { danger: theme.danger, garden: theme.garden, primary: theme.primary };
    const c = colors[variant] || theme.primary;
    return {
      flex: 1, padding: "10px 4px", borderRadius: 12, border: "none", cursor: "pointer",
      fontWeight: 600, fontSize: 12, background: active ? c : theme.card,
      color: active ? "#fff" : c, boxShadow: active ? "0 2px 8px rgba(0,0,0,0.15)" : "0 1px 4px rgba(0,0,0,0.07)",
      transition: "all 0.2s",
    };
  },
  body: { padding: "16px" },
  card: { background: theme.card, borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: `1px solid ${theme.border}`, marginBottom: 16 },
  uploadArea: (dragging, variant) => {
    const c = variant === "danger" ? theme.danger : theme.primary;
    const bg = variant === "danger" ? theme.dangerLight : theme.primaryLight;
    return { border: `2px dashed ${dragging ? c : theme.border}`, borderRadius: 14, padding: "32px 16px", textAlign: "center", cursor: "pointer", background: dragging ? bg : theme.bg, transition: "all 0.2s" };
  },
  preview: { width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 12, marginTop: 12 },
  btn: (variant) => {
    const bg = variant === "danger" ? theme.danger : variant === "garden" ? theme.garden : `linear-gradient(135deg, ${theme.primary}, #1b5e20)`;
    return { width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", background: bg, color: "#fff", fontWeight: 700, fontSize: 15, marginTop: 12, boxShadow: "0 3px 10px rgba(0,0,0,0.15)" };
  },
  smallBtn: (variant) => ({
    padding: "7px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
    background: variant === "danger" ? theme.dangerLight : variant === "garden" ? theme.gardenLight : theme.primaryLight,
    color: variant === "danger" ? theme.danger : variant === "garden" ? theme.garden : theme.primary,
  }),
  loader: { textAlign: "center", padding: "32px 0", color: theme.muted },
  spinnerWrap: { display: "flex", justifyContent: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: theme.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, marginTop: 14 },
  infoRow: { display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" },
  infoIcon: { fontSize: 16, minWidth: 22 },
  infoText: { fontSize: 14, lineHeight: 1.5, color: theme.text },
  diagnosisBadge: (sev) => ({
    display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
    background: sev === "alta" ? "#fdecea" : sev === "média" ? "#fff8e1" : "#e8f5e9",
    color: sev === "alta" ? theme.danger : sev === "média" ? "#f57f17" : theme.primary, marginBottom: 12,
  }),
  step: { display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" },
  stepNum: { minWidth: 24, height: 24, borderRadius: "50%", background: theme.primaryLight, color: theme.primary, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" },
  stepText: { fontSize: 14, lineHeight: 1.5, color: theme.text, paddingTop: 2 },
  resetBtn: { background: "none", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "8px 16px", color: theme.muted, cursor: "pointer", fontSize: 13, marginTop: 8 },
  errorBox: { background: theme.dangerLight, border: `1px solid #f5c6cb`, borderRadius: 12, padding: "14px 16px", color: theme.danger, fontSize: 14, marginTop: 12 },
  plantCard: { background: theme.card, borderRadius: 14, border: `1px solid ${theme.border}`, marginBottom: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer" },
  plantCardImg: { width: "100%", height: 140, objectFit: "cover" },
  plantCardBody: { padding: "12px 14px" },
  plantCardName: { fontWeight: 700, fontSize: 16, color: theme.text },
  plantCardSci: { fontSize: 12, color: theme.muted, fontStyle: "italic", marginTop: 2 },
  plantCardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  emptyState: { textAlign: "center", padding: "40px 20px", color: theme.muted },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  modal: { background: theme.card, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto", padding: "24px 20px 32px" },
  modalImg: { width: "100%", height: 200, objectFit: "cover", borderRadius: 12, marginBottom: 16 },
  modalName: { fontSize: 22, fontWeight: 800, color: theme.primary },
  modalSci: { fontSize: 14, color: theme.muted, fontStyle: "italic", marginTop: 2, marginBottom: 16 },
  saveNotice: { background: theme.primaryLight, border: `1px solid ${theme.accent}`, borderRadius: 12, padding: "12px 16px", fontSize: 13, color: theme.primary, marginTop: 12, display: "flex", alignItems: "center", gap: 8 },
};

function Spinner({ color }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="16" fill="none" stroke={color || theme.accent} strokeWidth="3" strokeDasharray="80" strokeDashoffset="20" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="0.9s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function UploadCard({ variant, label, icon, onImageSelect, image }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);
  const handle = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onImageSelect(e.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={S.uploadArea(drag, variant)}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
      onClick={() => inputRef.current.click()}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handle(e.target.files[0])} />
      <div style={{ fontSize: 48, marginBottom: 8 }}>{icon}</div>
      <div><strong style={{ color: variant === "danger" ? theme.danger : theme.primary }}>{label}</strong><br /><span style={{ color: theme.muted, fontSize: 14 }}>Toque aqui ou arraste uma imagem</span></div>
      {image && <img src={image} alt="preview" style={S.preview} />}
    </div>
  );
}

function PlantDetail({ data, image, onClose }) {
  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        {image && <img src={image} alt={data.name} style={S.modalImg} />}
        <div style={S.modalName}>{data.name}</div>
        {data.scientific && <div style={S.modalSci}>{data.scientific}</div>}
        <div style={S.sectionTitle}>📋 Cuidados Essenciais</div>
        {(data.care || []).map((item, i) => (
          <div key={i} style={S.infoRow}>
            <span style={S.infoIcon}>{item.icon}</span>
            <span style={S.infoText}><strong>{item.label}:</strong> {item.value}</span>
          </div>
        ))}
        {data.curiosity && (
          <>
            <div style={S.sectionTitle}>✨ Curiosidade</div>
            <div style={{ ...S.infoText, background: theme.primaryLight, borderRadius: 10, padding: "10px 14px" }}>{data.curiosity}</div>
          </>
        )}
        <div style={S.saveNotice}>✅ Planta salva no Meu Jardim</div>
        <button style={{ ...S.resetBtn, marginTop: 16, width: "100%" }} onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

function MyGarden({ plants, onView, onDelete }) {
  if (plants.length === 0) return (
    <div style={S.emptyState}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>🪴</div>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Seu jardim está vazio</div>
      <div style={{ fontSize: 14 }}>Identifique uma planta e salve-a aqui para acessar suas informações sempre que quiser.</div>
    </div>
  );
  return (
    <div>
      <div style={{ fontSize: 13, color: theme.muted, marginBottom: 12 }}>{plants.length} planta{plants.length > 1 ? "s" : ""} salva{plants.length > 1 ? "s" : ""}</div>
      {plants.map(p => (
        <div key={p.id} style={S.plantCard}>
          {p.image && <img src={p.image} alt={p.name} style={S.plantCardImg} />}
          <div style={S.plantCardBody}>
            <div style={S.plantCardName}>{p.name}</div>
            <div style={S.plantCardSci}>{p.scientific}</div>
            <div style={S.plantCardFooter}>
              <button style={S.smallBtn("garden")} onClick={() => onView(p)}>Ver detalhes</button>
              <button style={S.smallBtn("danger")} onClick={() => onDelete(p.id)}>🗑 Remover</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GardenApp() {
  const [tab, setTab] = useState("identify");
  const [image, setImage] = useState(null);
  const [imageB64, setImageB64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [diagImage, setDiagImage] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagResult, setDiagResult] = useState(null);
  const [diagError, setDiagError] = useState(null);
  const [savedPlants, setSavedPlants] = useState([]);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("garden_plants");
    if (stored) setSavedPlants(JSON.parse(stored));
  }, []);

  const persist = (plants) => {
    setSavedPlants(plants);
    localStorage.setItem("garden_plants", JSON.stringify(plants));
  };

  const resetIdentify = () => { setImage(null); setImageB64(null); setResult(null); setError(null); };
  const resetDiag = () => { setDiagImage(null); setDiagResult(null); setDiagError(null); };

  const handleImage = (dataUrl) => {
    setImage(dataUrl);
    setImageB64(dataUrl.split(",")[1]);
    setResult(null); setError(null);
  };

  const callAPI = async (b64, prompt) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 1000, messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } }, { type: "text", text: prompt }] }] })
  });
  const data = await res.json();
  if (!data.content) throw new Error(JSON.stringify(data));
  const text = data.content?.map(b => b.text || "").join("").trim();
  return JSON.parse(text.replace(/```json|```/g, "").trim());
};

  const analyze = async () => {
    if (!imageB64) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const r = await callAPI(imageB64, `Você é um especialista em botânica. Analise a imagem e identifique a planta. Responda APENAS com JSON válido, sem markdown: {"name":"Nome popular","scientific":"Nome científico","care":[{"icon":"💧","label":"Rega","value":"..."},{"icon":"☀️","label":"Luz","value":"..."},{"icon":"🌱","label":"Solo","value":"..."},{"icon":"🌡️","label":"Temperatura","value":"..."},{"icon":"🧪","label":"Fertilização","value":"..."}],"curiosity":"Uma curiosidade"}`);
      setResult(r);
    }  catch(e) { setError("Erro: " + e.message); }
    setLoading(false);
  };

  const analyzeDiag = async () => {
    if (!diagImage) return;
    setDiagLoading(true); setDiagError(null); setDiagResult(null);
    try {
      const r = await callAPI(diagImage.split(",")[1], `Você é um fitopatologista. Analise a imagem e identifique pragas, doenças ou deficiências. Responda APENAS com JSON válido, sem markdown: {"diagnosis":"Nome do problema","severity":"Alta|Média|Baixa","description":"Descrição breve","treatment":["Passo 1","Passo 2","Passo 3"],"prevention":["Dica 1","Dica 2"]}`);
      setDiagResult(r);
    } catch { setDiagError("Não foi possível analisar. Tente com uma foto mais clara da área afetada."); }
    setDiagLoading(false);
  };

  const savePlant = () => {
    if (!result) return;
    const plant = { id: Date.now(), savedAt: Date.now(), image, ...result };
    const updated = [plant, ...savedPlants];
    persist(updated);
    setModal({ plant, image });
  };

  const deletePlant = (id) => {
    const updated = savedPlants.filter(p => p.id !== id);
    persist(updated);
    if (modal?.plant?.id === id) setModal(null);
  };

  const isAlreadySaved = result && savedPlants.some(p => p.name === result.name && p.scientific === result.scientific);

  return (
    <div style={S.app}>
      <div style={S.header}>
        <div>
          <div style={S.logo}>🌱 Garden</div>
          <div style={S.tagline}>Cuide das suas plantas com inteligência</div>
        </div>
      </div>

      <div style={S.tabs}>
        <button style={S.tab(tab === "identify", "primary")} onClick={() => setTab("identify")}>🌿 Identificar</button>
        <button style={S.tab(tab === "diagnose", "danger")} onClick={() => setTab("diagnose")}>🔍 Diagnosticar</button>
        <button style={S.tab(tab === "garden", "garden")} onClick={() => setTab("garden")}>🪴 Meu Jardim</button>
      </div>

      <div style={S.body}>
        {tab === "identify" && (
          <>
            <div style={S.card}>
              <UploadCard variant="primary" icon="🌿" label="Fotografe ou envie sua planta" onImageSelect={handleImage} image={image} />
              {image && !result && !loading && <button style={S.btn("primary")} onClick={analyze}>🌿 Identificar Planta</button>}
            </div>
            {loading && <div style={S.loader}><div style={S.spinnerWrap}><Spinner color={theme.primary} /></div>Identificando sua planta…</div>}
            {error && <div style={S.errorBox}>⚠️ {error}</div>}
            {result && (
              <div style={S.card}>
                <div style={{ fontSize: 20, fontWeight: 700, color: theme.primary, marginBottom: 4 }}>{result.name}</div>
                {result.scientific && <div style={{ fontSize: 13, color: theme.muted, fontStyle: "italic", marginBottom: 14 }}>{result.scientific}</div>}
                <div style={S.sectionTitle}>📋 Cuidados Essenciais</div>
                {(result.care || []).map((item, i) => (
                  <div key={i} style={S.infoRow}><span style={S.infoIcon}>{item.icon}</span><span style={S.infoText}><strong>{item.label}:</strong> {item.value}</span></div>
                ))}
                {result.curiosity && (<><div style={S.sectionTitle}>✨ Curiosidade</div><div style={{ ...S.infoText, background: theme.primaryLight, borderRadius: 10, padding: "10px 14px" }}>{result.curiosity}</div></>)}
                {!isAlreadySaved
                  ? <button style={S.btn("garden")} onClick={savePlant}>🌻 Salvar no Meu Jardim</button>
                  : <div style={S.saveNotice}>✅ Planta já salva no Meu Jardim</div>}
                <button style={S.resetBtn} onClick={resetIdentify}>← Nova identificação</button>
              </div>
            )}
          </>
        )}

        {tab === "diagnose" && (
          <>
            <div style={S.card}>
              <UploadCard variant="danger" icon="🔍" label="Fotografe folhas ou caules com problema" onImageSelect={setDiagImage} image={diagImage} />
              {diagImage && !diagResult && !diagLoading && <button style={S.btn("danger")} onClick={analyzeDiag}>🔬 Analisar Problema</button>}
            </div>
            {diagLoading && <div style={S.loader}><div style={S.spinnerWrap}><Spinner color={theme.danger} /></div>Analisando sinais de pragas e doenças…</div>}
            {diagError && <div style={S.errorBox}>⚠️ {diagError}</div>}
            {diagResult && (
              <div style={S.card}>
                <div style={{ fontSize: 20, fontWeight: 700, color: theme.danger, marginBottom: 4 }}>{diagResult.diagnosis}</div>
                {diagResult.severity && <div style={S.diagnosisBadge(diagResult.severity?.toLowerCase())}>Severidade: {diagResult.severity}</div>}
                {diagResult.description && <><div style={S.sectionTitle}>🔬 O que foi identificado</div><div style={{ ...S.infoText, marginBottom: 8 }}>{diagResult.description}</div></>}
                {(diagResult.treatment || []).length > 0 && (<><div style={S.sectionTitle}>💊 Tratamento</div>{diagResult.treatment.map((s, i) => (<div key={i} style={S.step}><div style={S.stepNum}>{i + 1}</div><div style={S.stepText}>{s}</div></div>))}</>)}
                {(diagResult.prevention || []).length > 0 && (<><div style={S.sectionTitle}>🛡️ Prevenção</div>{diagResult.prevention.map((t, i) => (<div key={i} style={S.infoRow}><span style={S.infoIcon}>•</span><span style={S.infoText}>{t}</span></div>))}</>)}
                <button style={S.resetBtn} onClick={resetDiag}>← Novo diagnóstico</button>
              </div>
            )}
          </>
        )}

        {tab === "garden" && (
          <MyGarden plants={savedPlants} onView={p => setModal({ plant: p, image: p.image })} onDelete={deletePlant} />
        )}
      </div>

      {modal && <PlantDetail data={modal.plant} image={modal.image} onClose={() => setModal(null)} />}
    </div>
  );
}