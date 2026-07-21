import { useChefeStore } from "@/lib/chefe-store";
import { MapPin, Navigation2 } from "lucide-react";

export function SalonMap() {
  const profile = useChefeStore((s) => s.profile);
  const endereco = useChefeStore((s) => s.endereco);
  const lat = profile.latitude ?? -23.68735;
  const lon = profile.longitude ?? -46.50292;
  const delta = 0.006;
  const bbox = `${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}`;
  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  const wazeUrl = `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;

  return (
    <div
      className="overflow-hidden rounded-3xl"
      style={{
        border: "1px solid rgba(14,165,233,0.35)",
        boxShadow: "0 0 20px rgba(14,165,233,0.15)",
        background: "rgba(10,15,25,0.6)",
      }}
    >
      <div className="flex items-center gap-2 px-4 pt-4">
        <MapPin className="h-4 w-4 text-sky-400" />
        <p className="text-[11px] font-black uppercase tracking-widest text-sky-300">
          Localização do Salão
        </p>
      </div>
      <p className="px-4 pt-1 text-xs leading-snug text-muted-foreground">
        {endereco || "Rua Renato Russo, 100 - Bloco 7, AP 16 - CDHU / Jardim Santo André, Santo André - SP"}
      </p>
      <div className="mt-3 aspect-[16/11] w-full">
        <iframe
          title="Mapa CHEFE"
          src={embedSrc}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
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