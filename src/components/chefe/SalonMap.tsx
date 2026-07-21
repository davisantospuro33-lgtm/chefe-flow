import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation2 } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";
import { supabase } from "@/integrations/supabase/client";
import { ensureLeaflet } from "@/lib/leaflet-loader";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function SalonMap() {
  const profile = useChefeStore((s) => s.profile);
  const endereco = useChefeStore((s) => s.endereco);
  const setDistance = useChefeStore((s) => s.setDistance);
  const extra = useChefeStore((s) => s.extraMinutes);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const salonMarkerRef = useRef<any>(null);
  const clientMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const clientIdRef = useRef<string>("");
  const [geoStatus, setGeoStatus] = useState<"idle" | "asking" | "ok" | "denied">("idle");
  const [clientPos, setClientPos] = useState<{ lat: number; lon: number } | null>(null);

  const salonLat = profile.latitude ?? -23.68735;
  const salonLon = profile.longitude ?? -46.50292;
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${salonLat},${salonLon}`;
  const wazeUrl = `https://waze.com/ul?ll=${salonLat},${salonLon}&navigate=yes`;

  // Client id persistente (para o painel identificar o mesmo cliente)
  useEffect(() => {
    if (typeof window === "undefined") return;
    let id = localStorage.getItem("chefe_client_id");
    if (!id) {
      id = `c_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem("chefe_client_id", id);
    }
    clientIdRef.current = id;
  }, []);

  // Inicializa Leaflet + tiles DARK
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await ensureLeaflet();
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, {
        center: [salonLat, salonLon],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19, subdomains: "abcd" },
      ).addTo(map);
      const salonIcon = L.divIcon({
        className: "chefe-marker-salon",
        html: `<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#e94179,#8a2be2);display:grid;place-items:center;box-shadow:0 0 18px rgba(233,65,121,.7);border:2px solid #fff"><span style="font-size:16px">✂️</span></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      salonMarkerRef.current = L.marker([salonLat, salonLon], { icon: salonIcon }).addTo(map);
      mapRef.current = map;
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atualiza posição do salão se profile mudar
  useEffect(() => {
    if (salonMarkerRef.current) {
      salonMarkerRef.current.setLatLng([salonLat, salonLon]);
    }
  }, [salonLat, salonLon]);

  // Canal realtime para publicar a posição
  useEffect(() => {
    const ch = supabase.channel("painel_operacao");
    ch.subscribe();
    channelRef.current = ch;
    return () => {
      supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, []);

  // Watch GPS
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    setGeoStatus("asking");
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setClientPos({ lat, lon });
        setGeoStatus("ok");
        const km = haversineKm(lat, lon, salonLat, salonLon);
        setDistance(km);
        const eta = Math.max(3, Math.round(km * 3) + extra);
        // Broadcast
        try {
          await channelRef.current?.send({
            type: "broadcast",
            event: "client-location",
            payload: {
              cliente_id: clientIdRef.current,
              lat,
              lng: lon,
              distance_km: km,
              eta_min: eta,
              ts: Date.now(),
            },
          });
        } catch {}
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [salonLat, salonLon, extra, setDistance]);

  // Desenha marcador do cliente + polyline
  useEffect(() => {
    (async () => {
      if (!clientPos || !mapRef.current) return;
      const L = await ensureLeaflet();
      const map = mapRef.current;
      const latlng: [number, number] = [clientPos.lat, clientPos.lon];
      if (!clientMarkerRef.current) {
        const icon = L.divIcon({
          className: "chefe-marker-client",
          html: `<div style="width:22px;height:22px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 6px rgba(34,197,94,.25),0 0 18px rgba(34,197,94,.8);border:2px solid #0a0f19"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        clientMarkerRef.current = L.marker(latlng, { icon }).addTo(map);
      } else {
        clientMarkerRef.current.setLatLng(latlng);
      }
      const line: [number, number][] = [latlng, [salonLat, salonLon]];
      if (!polylineRef.current) {
        polylineRef.current = L.polyline(line, {
          color: "#38bdf8",
          weight: 4,
          opacity: 0.85,
          dashArray: "8 8",
        }).addTo(map);
      } else {
        polylineRef.current.setLatLngs(line);
      }
      try {
        map.fitBounds(L.latLngBounds(line).pad(0.35), { animate: true });
      } catch {}
    })();
  }, [clientPos, salonLat, salonLon]);

  return (
    <div
      className="overflow-hidden rounded-3xl"
      style={{
        border: "1px solid rgba(14,165,233,0.35)",
        boxShadow: "0 0 24px rgba(14,165,233,0.2)",
        background: "rgba(10,15,25,0.7)",
      }}
    >
      <div className="flex items-center gap-2 px-4 pt-4">
        <MapPin className="h-4 w-4 text-sky-400" />
        <p className="text-[11px] font-black uppercase tracking-widest text-sky-300">
          Mapa ao Vivo · Rota até o Salão
        </p>
      </div>
      <p className="px-4 pt-1 text-xs leading-snug text-muted-foreground">
        {endereco || "Rua Renato Russo, 100 - Bloco 7, AP 16 - CDHU / Jardim Santo André, Santo André - SP"}
      </p>
      <div
        ref={containerRef}
        className="mt-3 w-full"
        style={{ height: 260, background: "#0a0f19" }}
      />
      {geoStatus !== "ok" && (
        <p className="px-4 pt-2 text-[10px] text-muted-foreground">
          {geoStatus === "asking" && "Solicitando sua localização para traçar a rota..."}
          {geoStatus === "denied" && "Ative o GPS para ver o traçado até o salão."}
          {geoStatus === "idle" && "Ative o GPS para rastreamento em tempo real."}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 p-3">
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-ig px-3 py-2.5 text-xs font-black text-white"
        >
          <Navigation2 className="h-3.5 w-3.5" /> Google Maps
        </a>
        <a
          href={wazeUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-500/20 px-3 py-2.5 text-xs font-black text-sky-200 ring-1 ring-sky-400/40"
        >
          <Navigation2 className="h-3.5 w-3.5" /> Waze
        </a>
      </div>
    </div>
  );
}