import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Scissors, Trash2 } from "lucide-react";
import { useChefeStore, type QueueClient } from "@/lib/chefe-store";
import { toast } from "sonner";

export function SortableQueue() {
  const queue = useChefeStore((s) => s.queue);
  const reorderQueue = useChefeStore((s) => s.reorderQueue);
  const startCut = useChefeStore((s) => s.startCut);
  const removeClient = useChefeStore((s) => s.removeClient);

  const [items, setItems] = useState<QueueClient[]>(queue);
  useEffect(() => setItems(queue), [queue]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    reorderQueue(next.map((i) => i.id)).catch(() => toast.error("Erro ao reordenar"));
  };

  if (items.length === 0) {
    return (
      <p className="rounded-2xl bg-white/[0.03] px-4 py-6 text-center text-xs text-muted-foreground">
        Fila vazia. Aceite solicitações pra popular.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {items.map((c, i) => (
            <Row
              key={c.id}
              client={c}
              index={i}
              onCadeira={
                i === 0
                  ? undefined
                  : async () => {
                      const next = [c, ...items.filter((x) => x.id !== c.id)];
                      setItems(next);
                      await reorderQueue(next.map((x) => x.id));
                      await startCut();
                      toast.success(`${c.name} na cadeira 🪑`);
                    }
              }
              onRemove={async () => {
                if (!confirm(`Remover ${c.name} da fila?`)) return;
                await removeClient(c.id);
                toast(`${c.name} removido`);
              }}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function Row({
  client,
  index,
  onCadeira,
  onRemove,
}: {
  client: QueueClient;
  index: number;
  onCadeira?: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: client.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto" as const,
    opacity: isDragging ? 0.85 : 1,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 ring-1 ${
        index === 0 ? "bg-neon/10 ring-neon/40" : "bg-white/[0.03] ring-white/5"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Arrastar"
        className="touch-none text-muted-foreground hover:text-white"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-black">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{client.name}</p>
        {client.phone && (
          <p className="truncate text-[11px] text-muted-foreground">{client.phone}</p>
        )}
      </div>
      {onCadeira && (
        <button
          onClick={onCadeira}
          className="rounded-xl bg-gradient-ig px-2.5 py-1.5 text-[10px] font-black text-white"
        >
          <Scissors className="inline h-3 w-3" /> Cadeira
        </button>
      )}
      <button
        onClick={onRemove}
        className="rounded-xl bg-rose-500/15 px-2 py-1.5 text-rose-300 ring-1 ring-rose-400/30"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}