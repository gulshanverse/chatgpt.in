"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import styles from "./model-selector.module.css";

export type ChatModel = { id: string; label: string; description: string };

export const CHAT_MODELS: ChatModel[] = [
  { id: "gpt-5.6", label: "GPT-5.6", description: "Best for everyday work" },
  { id: "gpt-5.6-mini", label: "GPT-5.6 mini", description: "Fast and efficient" },
];

export function ModelSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = CHAT_MODELS.find((model) => model.id === value) ?? CHAT_MODELS[0];

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className={styles.root} ref={ref}>
      <button type="button" className={styles.trigger} onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <Sparkles size={15} /> <span>{selected.label}</span> <ChevronDown size={14} />
      </button>
      {open && <div className={styles.menu}>
        <div className={styles.title}>Choose a model</div>
        {CHAT_MODELS.map((model) => <button type="button" key={model.id} className={styles.option} onClick={() => { onChange(model.id); setOpen(false); }}>
          <span><strong>{model.label}</strong><small>{model.description}</small></span>
          {model.id === selected.id && <Check size={16} />}
        </button>)}
      </div>}
    </div>
  );
}
