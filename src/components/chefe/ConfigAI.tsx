import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Cpu, 
  Loader2, 
  Phone, 
  MapPin, 
  Compass, 
  Search, 
  Check, 
  Sliders,
  Store,
  User,
  Play,
  Square,
  Navigation,
  Database,
  Smartphone
} from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";
import { configAssistantChat, type ChatMessage } from "@/lib/config-ai.functions";

// Leaflet é carregado via CDN (script tag) para evitar dependência npm.
// CSS já vem do __root.tsx via <link rel="stylesheet"> do unpkg.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletNS = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { L?: any } }

function loadLeaflet(): Promise<LeafletNS> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.L) return Promise.resolve(window.L);
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("leaflet-cdn-script") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(window.L));
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.id = "leaflet-cdn-script";
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.async = true;
    s.onload = () => resolve(window.L);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

type ChatMsg = { role: "user" | "assistant"; content: string };

// Toast helper local extremamente polido e bonito para evitar crashes caso 'sonner' não esteja importável
const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
  const container = document.getElementById("toast-container");
  if (!container) return;
  
  const toastEl = document.createElement("div");
  toastEl.className = `flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold transform translate-y-2 opacity-0 transition-all duration-300 ${
    type === "success" 
      ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/30" 
      : type === "error"
      ? "bg-rose-950/90 text-rose-300 border-rose-500/30"
      : "bg-sky-950/90 text-sky-300 border-sky-500/30"
  }`;
  
  toastEl.innerHTML = `
    <span class="w-2 h-2 rounded-full ${type === 'success' ? 'bg-emerald-400' : type === 'error' ? 'bg-rose-400' : 'bg-sky-400'} animate-ping"></span>
    <span>${message}</span>
  `;
  
  container.appendChild(toastEl);
  setTimeout(() => {
    toastEl.classList.remove("translate-y-2", "opacity-0");
  }, 10);
  
  setTimeout(() => {
    toastEl.classList.add("translate-y-2", "opacity-0");
    setTimeout(() => toastEl.remove(), 300);
  }, 4000);
};

export function ConfigAI() {
  const store = useChefeStore();
  const [activeTab, setActiveTab] = useState<"ai" | "mapa" | "cadastro">("ai");
  
  // Chat state
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "👊 CHEFE, este é seu canal de comando direto. Qualquer ordem que você digitar aqui vira instrução ao vivo para sua atendente virtual (que fala com seus clientes no chat público). Também posso alterar o banco em tempo real via SQL. Manda a ordem que eu executo.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Cadastro de Telefone state
  const [phoneInput, setPhoneInput] = useState(store.telefone);
  const [savingPhone, setSavingPhone] = useState(false);

  // Autocomplete endereço state
  const [addressInput, setAddressInput] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mapa leaflet refs
  const mapRef = useRef<any>(null);
  const salonMarkerRef = useRef<any>(null);
  const clientMarkerRef = useRef<any>(null);
  const mapContainerId = "leaflet-salon-map";
  
  // Simulation interval ref
  const simIntervalRef = useRef<any>(null);
  const [simProgress, setSimProgress] = useState(0);

  // Rola o chat para o final ao receber mensagens
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, activeTab]);

  // Sincroniza campos quando hidratados
  useEffect(() => {
    store.hydrate();
  }, []);

  useEffect(() => {
    setPhoneInput(store.telefone);
  }, [store.telefone]);

  // Efeito para Geolocalização Real (GPS)
  useEffect(() => {
    if (!store.isTracking) return;

    showToast("🛰️ GPS Ativado! Monitorando sua localização em tempo real...", "info");

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        store.updateClienteCoords(latitude, longitude);
      },
      (error) => {
        console.error("Erro no GPS:", error);
        showToast("⚠️ Falha ao ler GPS. Certifique-se de dar permissão de localização.", "error");
        store.setTrackingState(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [store.isTracking]);

  // Inicialização do Mapa Leaflet
  useEffect(() => {
    // Apenas inicializa o mapa se a aba mapa estiver ativa e o elemento existir
    if (activeTab !== "mapa") return;

    let isMounted = true;
    
    // Carrega dinamicamente o Leaflet via CDN
    loadLeaflet().then((L) => {
      if (!isMounted) return;
      if (mapRef.current) return; // Evita inicialização dupla

      const container = document.getElementById(mapContainerId);
      if (!container) return;

      console.log("Inicializando Mapa Leaflet em:", store.latitude, store.longitude);

      // Instancia o mapa centrado na localização salva do salão
      const map = L.map(mapContainerId, {
        zoomControl: false,
        attributionControl: false
      }).setView([store.latitude, store.longitude], 15);

      // Adiciona camada de mapas do OpenStreetMap (leve e gratuita)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 20,
      }).addTo(map);

      // Cria ícone personalizado e divertido para o estabelecimento (Barbearia/Salão)
      const salonIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center w-11 h-11 bg-gradient-to-tr from-fuchsia-500 to-rose-500 rounded-2xl border-2 border-white/60 shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all">
            <div class="absolute -top-1 -right-1 flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow"><path d="M3 9 12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
        `,
        className: "",
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      // Fixa o marcador do salão no mapa
      const salonMarker = L.marker([store.latitude, store.longitude], { icon: salonIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-2 bg-zinc-950 text-white rounded-lg border border-white/10 font-sans text-xs">
            <p class="font-black text-rose-400 uppercase tracking-wider">Seu Salão 💈</p>
            <p class="text-[10px] mt-1 text-zinc-300">${store.endereco}</p>
          </div>
        `);

      mapRef.current = map;
      salonMarkerRef.current = salonMarker;

      // Se já houver coordenadas do cliente, desenha o marcador dele também
      if (store.cliente_latitude !== null && store.cliente_longitude !== null) {
        updateOrCreateClientMarker(L, store.cliente_latitude, store.cliente_longitude);
      }
    });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        salonMarkerRef.current = null;
        clientMarkerRef.current = null;
      }
    };
  }, [activeTab]);

  // Efeito reativo para reposicionar o marcador do salão no mapa caso mude por busca de endereço
  useEffect(() => {
    if (mapRef.current && salonMarkerRef.current) {
      salonMarkerRef.current.setLatLng([store.latitude, store.longitude]);
      mapRef.current.panTo([store.latitude, store.longitude]);
    }
  }, [store.latitude, store.longitude]);

  // Função interna para criar/atualizar o marcador do cliente em movimento no mapa
  const updateOrCreateClientMarker = (L: any, lat: number, lon: number) => {
    if (!mapRef.current) return;

    // Ícone divertido do Cliente se movendo (Bonequinho/Carrinho em Degradê Azul)
    const clientIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center w-11 h-11 bg-gradient-to-tr from-sky-400 to-blue-600 rounded-full border-2 border-white/70 shadow-2xl map-user-pulse">
          <div class="absolute inset-0 rounded-full bg-sky-400/30 animate-ping"></div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
        </div>
      `,
      className: "",
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    if (!clientMarkerRef.current) {
      const marker = L.marker([lat, lon], { icon: clientIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div class="p-1.5 bg-zinc-950 text-white rounded-lg border border-white/10 font-sans text-xs">
            <p class="font-bold text-sky-400">Cliente a caminho! 🚗</p>
            <p class="text-[9px] text-zinc-400">Atualizado via GPS em tempo real</p>
          </div>
        `);
      clientMarkerRef.current = marker;
    } else {
      clientMarkerRef.current.setLatLng([lat, lon]);
    }

    // Ajusta o enquadramento do mapa para exibir o estabelecimento e o cliente simultaneamente
    if (salonMarkerRef.current && clientMarkerRef.current) {
      const group = L.featureGroup([salonMarkerRef.current, clientMarkerRef.current]);
      mapRef.current.fitBounds(group.getBounds().pad(0.2));
    }
  };

  // Efeito reativo que atualiza a posição do marcador do cliente na tela conforme dados da store mudam
  useEffect(() => {
    if (store.cliente_latitude !== null && store.cliente_longitude !== null) {
      loadLeaflet().then((L) => {
        updateOrCreateClientMarker(L, store.cliente_latitude!, store.cliente_longitude!);
      });
    } else {
      if (clientMarkerRef.current) {
        clientMarkerRef.current.remove();
        clientMarkerRef.current = null;
      }
    }
  }, [store.cliente_latitude, store.cliente_longitude]);

  // 1. AÇÃO: SALVAR TELEFONE MANUAL
  async function handleSavePhone() {
    if (!phoneInput.trim()) {
      showToast("Por favor, insira um telefone válido.", "error");
      return;
    }
    setSavingPhone(true);
    const success = await store.setTelefone(phoneInput.trim());
    setSavingPhone(false);
    if (success) {
      showToast("📱 Telefone oficial gravado no Supabase com sucesso!");
    } else {
      showToast("⚠️ Falha ao salvar no banco.", "error");
    }
  }

  // 2. AÇÃO: BUSCA DE ENDEREÇO COM NOMINATIM (AUTO-COMPLETE)
  async function handleSearchAddress(val: string) {
    setAddressInput(val);
    if (val.trim().length < 4) {
      setSuggestions([]);
      return;
    }

    setSearchingAddress(true);
    try {
      // Faz requisição direta para o OpenStreetMap Nominatim API (público e gratuito)
      // Limitamos a resultados do Brasil (countrycodes=br) para respostas extremamente precisas
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=br`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error("Erro na busca de endereço:", err);
    } finally {
      setSearchingAddress(false);
    }
  }

  // Ao selecionar um endereço sugerido
  async function handleSelectSuggestion(sug: any) {
    const lat = parseFloat(sug.lat);
    const lon = parseFloat(sug.lon);
    const formattedAddress = sug.display_name;

    setShowSuggestions(false);
    setAddressInput(formattedAddress);
    setSuggestions([]);

    const success = await store.setLocalizacao(formattedAddress, lat, lon);
    if (success) {
      showToast("📍 Localização fixa atualizada e salva no Supabase!");
      if (mapRef.current) {
        mapRef.current.setView([lat, lon], 16);
      }
    } else {
      showToast("⚠️ Erro ao salvar coordenadas.", "error");
    }
  }

  // 3. AÇÃO: SIMULADOR DE MOVIMENTO (99/IFOOD DIVERTIDO)
  function toggleSimulator() {
    if (store.simulating) {
      // Para o simulador
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      store.setSimulating(false);
      store.updateClienteCoords(null as any, null as any); // Remove pin do cliente
      setSimProgress(0);
      showToast("Simulador parado.", "info");
    } else {
      // Inicia o simulador
      if (store.isTracking) store.setTrackingState(false); // Desativa GPS Real
      
      store.setSimulating(true);
      setSimProgress(0);
      showToast("🚗 Simulador Iniciado! Cliente saindo da rota de entrega...");

      // Define uma rota simulada partindo de uns 600m de distância
      const startLat = store.latitude + 0.005;
      const startLon = store.longitude - 0.006;
      
      let step = 0;
      const totalSteps = 25; // 25 segundos de animação
      
      store.updateClienteCoords(startLat, startLon);

      simIntervalRef.current = setInterval(() => {
        step++;
        const progress = step / totalSteps;
        setSimProgress(Math.round(progress * 100));

        // Interpolação linear da rota em direção ao salão
        const currLat = startLat + (store.latitude - startLat) * progress;
        const currLon = startLon + (store.longitude - startLon) * progress;
        
        store.updateClienteCoords(currLat, currLon);

        if (step >= totalSteps) {
          clearInterval(simIntervalRef.current);
          store.setSimulating(false);
          setSimProgress(100);
          showToast("🎉 O cliente CHEGOU ao estabelecimento! Excelente espera!", "success");
        }
      }, 1000);
    }
  }

  // Desliga intervalos se componente desmontar
  useEffect(() => {
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  // 4. AÇÃO: CHAT AI MESTRE FAIXA PRETA (SQL)
  async function sendChatMessage() {
    const v = chatInput.trim();
    if (!v || busy) return;
    
    const next: ChatMsg[] = [...messages, { role: "user", content: v }];
    setMessages(next);
    setChatInput("");
    setBusy(true);
    
    try {
      const res = await configAssistantChat({
        data: { messages: next.map((m) => ({ role: m.role, content: m.content })) },
      });
      const reply = res.text || "✅ Operação efetuada.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      
      if (res.changes && res.changes.length > 0) {
        showToast(`✨ ${res.changes.join(" · ")}`);
        await store.hydrate();
      }
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "⚠️ Erro ao processar comando. Tente novamente." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden p-[1.5px] bg-gradient-to-br from-sky-400 via-fuchsia-500 to-rose-500 shadow-2xl">
      {/* Container de Toasts Locais */}
      <div id="toast-container" className="absolute top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"></div>

      <div className="rounded-[calc(1.5rem-1.5px)] bg-zinc-950/95 backdrop-blur-xl text-white p-4 sm:p-6">
        
        {/* Header Superior com Status de Sincronia Supabase */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-sky-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/20">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-fuchsia-300 to-rose-300">
                CHEFE AI · PAINEL PRO MOTOR
              </h1>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Conexão Supabase Ativa · Postgres Real-Time
              </p>
            </div>
          </div>

          {/* Seletor de Abas Estilo Segmentado para Celular */}
          <div className="flex bg-white/[0.04] p-1 rounded-xl ring-1 ring-white/10 text-xs font-bold gap-1 self-start sm:self-center">
            <button
              onClick={() => setActiveTab("mapa")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "mapa" 
                  ? "bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white shadow-md" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              Mapa & GPS
            </button>
            <button
              onClick={() => setActiveTab("cadastro")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "cadastro" 
                  ? "bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white shadow-md" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              Cadastro
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "ai" 
                  ? "bg-gradient-to-r from-rose-500 to-sky-500 text-white shadow-md" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              Chefe AI
            </button>
          </div>
        </div>

        {/* Corpo Reativo baseado na Aba Ativa */}
        <div className="min-h-[440px]">
          
          <AnimatePresence mode="wait">
            
            {/* ----------------- ABA 1: MAPA DINÂMICO & RASTREAMENTO GPS ----------------- */}
            {activeTab === "mapa" && (
              <motion.div
                key="mapa-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Cards de Métricas Rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Coordenadas do Salão */}
                  <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                        <Store className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Local do Salão (Fixo)</p>
                        <p className="text-xs font-semibold text-white mt-0.5 max-w-[200px] truncate" title={store.endereco}>
                          {store.endereco}
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[10px] text-zinc-500">
                      <p>Lat: {store.latitude.toFixed(4)}</p>
                      <p>Lon: {store.longitude.toFixed(4)}</p>
                    </div>
                  </div>

                  {/* Coordenadas do Cliente / Status do GPS */}
                  <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${store.cliente_latitude ? 'bg-sky-500/20 text-sky-400' : 'bg-zinc-800 text-zinc-500'}`}>
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Local do Cliente (Tempo Real)</p>
                        <p className="text-xs font-semibold text-white mt-0.5">
                          {store.cliente_latitude 
                            ? `A caminho (${simProgress ? `${simProgress}% concluído` : "Rastreando"})` 
                            : "Aguardando GPS/Simulador..."
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[10px] text-zinc-500">
                      {store.cliente_latitude ? (
                        <>
                          <p>Lat: {store.cliente_latitude.toFixed(4)}</p>
                          <p>Lon: {store.cliente_longitude?.toFixed(4)}</p>
                        </>
                      ) : (
                        <p className="italic">Inativo</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bloco do Mapa e Controles Flutuantes */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 h-[320px] sm:h-[350px]">
                  
                  {/* Div onde o Leaflet se injetará */}
                  <div id={mapContainerId} className="w-full h-full z-10"></div>

                  {/* Overlay se o Leaflet falhar ou estiver recarregando */}
                  <div className="absolute inset-0 bg-black/40 pointer-events-none z-20 flex flex-col justify-between p-4">
                    <div className="flex justify-between items-start">
                      <span className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/10 text-rose-400 flex items-center gap-1.5 shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                        💈 SALÃO PIN
                      </span>

                      {store.cliente_latitude && (
                        <span className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/10 text-sky-400 flex items-center gap-1.5 shadow-lg animate-bounce">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                          🚗 CLIENTE MOVENTE
                        </span>
                      )}
                    </div>

                    {/* Botões rápidos de controle flutuante sobre o mapa */}
                    <div className="flex flex-wrap gap-2 pointer-events-auto mt-auto">
                      <button
                        onClick={() => {
                          if (mapRef.current) {
                            mapRef.current.setView([store.latitude, store.longitude], 16);
                            showToast("Foco centralizado no salão!", "info");
                          }
                        }}
                        className="bg-black/85 hover:bg-black backdrop-blur-md text-white text-[11px] font-bold px-3 py-2 rounded-xl border border-white/15 flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
                      >
                        <Store className="h-3.5 w-3.5 text-rose-400" />
                        Focar Estabelecimento
                      </button>

                      {store.cliente_latitude && (
                        <button
                          onClick={() => {
                            if (mapRef.current && store.cliente_latitude && store.cliente_longitude) {
                              mapRef.current.setView([store.cliente_latitude, store.cliente_longitude], 16);
                              showToast("Foco centralizado no cliente!", "info");
                            }
                          }}
                          className="bg-black/85 hover:bg-black backdrop-blur-md text-white text-[11px] font-bold px-3 py-2 rounded-xl border border-white/15 flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
                        >
                          <User className="h-3.5 w-3.5 text-sky-400" />
                          Focar Cliente
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controles de Rastreamento (Simulador ou GPS Real) */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-sky-300">
                        Painel de Simulação & GPS Celular
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Ative o simulador divertido de trajeto do cliente estilo 99 ou use o GPS real do aparelho.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {/* Botão Simulador Divertido */}
                      <button
                        onClick={toggleSimulator}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95 ${
                          store.simulating
                            ? "bg-amber-600 hover:bg-amber-500 text-white animate-pulse"
                            : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white"
                        }`}
                      >
                        {store.simulating ? (
                          <>
                            <Square className="h-3.5 w-3.5" />
                            Parar Simulação ({simProgress}%)
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 fill-current" />
                            Simular Chegada Cliente 🚗
                          </>
                        )}
                      </button>

                      {/* Botão GPS Real do Celular */}
                      <button
                        onClick={() => {
                          if (store.simulating) {
                            showToast("Desligue o simulador antes de usar o GPS real.", "error");
                            return;
                          }
                          store.setTrackingState(!store.isTracking);
                          if (store.isTracking) {
                            store.updateClienteCoords(null as any, null as any);
                          }
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95 ${
                          store.isTracking
                            ? "bg-rose-600 hover:bg-rose-500 text-white"
                            : "bg-white/[0.06] hover:bg-white/10 text-white border border-white/10"
                        }`}
                      >
                        <Smartphone className={`h-3.5 w-3.5 ${store.isTracking ? 'animate-bounce' : ''}`} />
                        {store.isTracking ? "Desativar GPS Real" : "Rastrear Meu GPS 🛰️"}
                      </button>
                    </div>
                  </div>

                  {/* Barra de Progresso Divertida do Simulador */}
                  {store.simulating && (
                    <div className="mt-3.5 space-y-1">
                      <div className="flex justify-between text-[10px] font-black tracking-wide text-zinc-400">
                        <span>ESTRADA DO CLIENTE</span>
                        <span>{simProgress}% DE DISTÂNCIA</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-2.5 border border-white/5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-sky-400 via-indigo-500 to-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${simProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* ----------------- ABA 2: CADASTRO DE TELEFONE & BUSCA DE ENDEREÇO ----------------- */}
            {activeTab === "cadastro" && (
              <motion.div
                key="cadastro-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                
                {/* 1. SEÇÃO: INPUT MANUAL DE TELEFONE */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <div className="p-2 bg-fuchsia-500/10 text-fuchsia-400 rounded-lg">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider text-fuchsia-300">
                        Telefone Oficial do Estabelecimento
                      </h2>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Defina o telefone de atendimento salvo na tabela correspondente do Supabase.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Ex: +55 (11) 98765-4321"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full rounded-xl bg-white/[0.04] pl-10 pr-4 py-3.5 text-sm text-white ring-1 ring-white/10 outline-none placeholder:text-zinc-600 focus:ring-fuchsia-400/50"
                      />
                    </div>
                    <button
                      onClick={handleSavePhone}
                      disabled={savingPhone}
                      className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-rose-500 text-xs font-black text-white hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {savingPhone ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Salvar Telefone
                    </button>
                  </div>
                </div>

                {/* 2. SEÇÃO: BUSCA INTELIGENTE DE ENDEREÇO (ESTILO UBER/IFOOD) */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl relative">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider text-sky-300">
                        Busca Inteligente de Endereço (Estilo iFood)
                      </h2>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Digite o endereço para extrair Latitude & Longitude e salvar de forma fixa no banco de dados.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Comece a digitar o endereço (ex: Avenida Paulista, São Paulo...)"
                      value={addressInput}
                      onChange={(e) => handleSearchAddress(e.target.value)}
                      onFocus={() => addressInput.length > 3 && setShowSuggestions(true)}
                      className="w-full rounded-xl bg-white/[0.04] pl-10 pr-10 py-3.5 text-sm text-white ring-1 ring-white/10 outline-none placeholder:text-zinc-600 focus:ring-sky-400/50"
                    />
                    {searchingAddress && (
                      <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-sky-400" />
                    )}
                  </div>

                  {/* Dropdown de Sugestões Auto-Complete Estilo Uber */}
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 right-0 z-50 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-[220px] overflow-y-auto"
                      >
                        {suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectSuggestion(sug)}
                            className="w-full text-left px-4 py-3 hover:bg-white/[0.04] border-b border-white/5 transition-colors flex items-start gap-3 text-xs"
                          >
                            <MapPin className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-white leading-tight">
                                {sug.display_name.split(",")[0]}
                              </p>
                              <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                                {sug.display_name}
                              </p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Coordenadas Atuais Salvas */}
                  <div className="flex flex-col sm:flex-row gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5 text-xs">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Endereço Ativo no Supabase</p>
                      <p className="text-white font-medium mt-1">{store.endereco}</p>
                    </div>
                    <div className="sm:w-[180px] shrink-0 border-t sm:border-t-0 sm:border-l border-white/5 sm:pl-3 pt-2 sm:pt-0 flex justify-between sm:flex-col justify-center">
                      <div>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase">Latitude</p>
                        <p className="font-mono text-rose-400 font-bold">{store.latitude}</p>
                      </div>
                      <div className="mt-1">
                        <p className="text-[9px] font-bold text-zinc-500 uppercase">Longitude</p>
                        <p className="font-mono text-sky-400 font-bold">{store.longitude}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* ----------------- ABA 3: CHEFE AI CHAT (INALTERADA E TURBINADA) ----------------- */}
            {activeTab === "ai" && (
              <motion.div
                key="ai-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {/* Chat Message Window */}
                <div className="flex max-h-[350px] min-h-[300px] flex-col gap-2.5 overflow-y-auto pr-1 bg-white/[0.01] rounded-2xl p-3 border border-white/5">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[13px] leading-snug ${
                        m.role === "assistant"
                          ? "self-start bg-fuchsia-500/10 text-fuchsia-50 ring-1 ring-fuchsia-400/20"
                          : "self-end bg-gradient-to-r from-sky-500 via-indigo-500 to-blue-500 text-white shadow-md"
                      }`}
                    >
                      {m.content}
                    </div>
                  ))}
                  {busy && (
                    <div className="flex items-center gap-2 self-start text-[11px] text-zinc-400 bg-white/[0.02] px-3 py-1.5 rounded-full border border-white/5">
                      <Loader2 className="h-3 w-3 animate-spin text-fuchsia-400" /> 
                      Processando no Postgres...
                    </div>
                  )}
                  <div ref={endRef} />
                </div>

                {/* Input Bar */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: muda o preço pra R$ 30 ou cria uma tabela para lava-rápido..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                    className="flex-1 rounded-xl bg-white/[0.04] px-4 py-3.5 text-sm text-white ring-1 ring-white/10 outline-none placeholder:text-zinc-600 focus:ring-fuchsia-400/50"
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={busy}
                    className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-sky-500 via-fuchsia-500 to-rose-500 text-white shadow-lg active:scale-95 disabled:opacity-50 transition-transform"
                    aria-label="Enviar"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
