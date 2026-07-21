import { useEffect, useRef, useState } from "react";
import { Radar, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChefeStore } from "@/lib/chefe-store";
import { ensureLeaflet } from "@/lib/leaflet-loader";

interface ClientPing {
  cliente_id: string;
  lat: number;
  lng: number;
  distance_km: number;
  eta_min: number;
  ts: number;
}

export function AdminMap() {
  const profile = useChefeStore((s) => s.profile);
  const salonLat = profile.latitude ?? -23.68735;
  const salonLon = profile.longitude ?? -46.50292;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [pings, setPings] = useState<Record<string, ClientPing>>({});
  const [alertOn, setAlertOn] = useState(false);
  const alertedRef = useRef<Set<string>>(new Set());

  // Init map
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
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);
      const salonIcon = L.divIcon({
        className: "chefe-marker-salon",
        html: `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#e94179,#8a2be2);display:grid;place-items:center;box-shadow:0 0 22px rgba(233,65,121,.8);border:2px solid #fff"><span style="font-size:17px">✂️</span></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      L.marker([salonLat, salonLon], { icon: salonIcon }).addTo(map);
      mapRef.current = map;
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [salonLat, salonLon]);

  // Subscribe realtime
  useEffect(() => {
    const ch = supabase.channel("painel_operacao");
    ch.on("broadcast", { event: "client-location" }, (msg) => {
      const p = msg.payload as ClientPing;
      if (!p?.cliente_id) return;
      setPings((prev) => ({ ...prev, [p.cliente_id]: p }));
    });
    ch.subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  // Update markers + alert
  useEffect(() => {
    (async () => {
      if (!mapRef.current) return;
      const L = await ensureLeaflet();
      const map = mapRef.current;
      let anyClose = false;
      for (const p of Object.values(pings)) {
        const latlng: [number, number] = [p.lat, p.lng];
        let m = markersRef.current.get(p.cliente_id);
        if (!m) {
          const icon = L.divIcon({
            className: "chefe-marker-radar",
            html: `<div style="position:relative;width:24px;height:24px"><div style="position:absolute;inset:0;border-radius:50%;background:#22c55e;box-shadow:0 0 0 6px rgba(34,197,94,.25),0 0 20px rgba(34,197,94,.9);border:2px solid #0a0f19"></div></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });
          m = L.marker(latlng, { icon }).addTo(map);
          m.bindTooltip(`Cliente · ${p.distance_km.toFixed(1)} km · ~${p.eta_min} min`, {
            direction: "top",
            offset: [0, -8],
          });
          markersRef.current.set(p.cliente_id, m);
        } else {
          m.setLatLng(latlng);
          m.setTooltipContent(
            `Cliente · ${p.distance_km.toFixed(1)} km · ~${p.eta_min} min`,
          );
        }
        if (p.distance_km < 0.5) {
          anyClose = true;
          if (!alertedRef.current.has(p.cliente_id)) {
            alertedRef.current.add(p.cliente_id);
            try {
              const ctx = new ((window as any).AudioContext ||
                (window as any).webkitAudioContext)();
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              o.type = "square";
              o.frequency.value = 880;
              o.connect(g);
              g.connect(ctx.destination);
              g.gain.value = 0.08;
              o.start();
              setTimeout(() => {
                o.stop();
                ctx.close();
              }, 500);
            } catch {}
          }
        } else if (p.distance_km > 0.7) {
          alertedRef.current.delete(p.cliente_id);
        }
      }
      setAlertOn(anyClose);
    })();
  }, [pings]);

  const list = Object.values(pings).sort((a, b) => a.distance_km - b.distance_km);

  return (
    <section
      className="mb-4 overflow-hidden rounded-3xl"
      style={{
        border: "1px solid rgba(14,165,233,0.35)",
        boxShadow: "0 0 24px rgba(14,165,233,0.2)",
        background: "rgba(10,15,25,0.7)",
      }}
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <Radar className="h-4 w-4 text-sky-400" />
          <p className="text-[11px] font-black uppercase tracking-widest text-sky-300">
            Radar de Clientes · Ao Vivo
          </p>
        </div>
        <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-black tabular-nums text-sky-300 ring-1 ring-sky-400/30">
          {list.length}
        </span>
      </div>
      {alertOn && (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-2xl bg-rose-500/15 px-3 py-2 text-xs font-black text-rose-200 ring-1 ring-rose-400/40">
          <AlertTriangle className="h-4 w-4 animate-pulse" />
          🚨 CLIENTE CHEGANDO NA BARBEARIA!
        </div>
      )}
      <div ref={containerRef} className="mt-3 w-full" style={{ height: 260, background: "#0a0f19" }} />
      {list.length > 0 && (
        <ul className="space-y-1.5 p-3">
          {list.slice(0, 5).map((p) => (
            <li
              key={p.cliente_id}
              className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 text-[11px]"
            >
              <span className="font-mono text-muted-foreground">
                {p.cliente_id.slice(0, 8)}
              </span>
              <span className="font-bold text-sky-200 tabular-nums">
                {p.distance_km.toFixed(2)} km · ~{p.eta_min} min
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}