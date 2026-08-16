"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import styles from "./model-selector.module.css";

export type ChatModel = { id: string; label: string; description: string };

export const CHAT_MODELS: ChatModel[] = [
  { id: "gpt-5.6", label: "GPT-5.6", description: "Best for everyday work" },
  { id: "gpt-5.4-mini", label: "GPT-5.4 mini", description: "Fast and efficient" },
];

export function ModelSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = CHAT_MODELS.find((model) => model.id === value) ?? CHAT_MODELS[0];

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={ref}>
      <button ref={triggerRef} type="button" className={styles.trigger} onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-haspopup="listbox">
        <Sparkles size={15} /> <span>{selected.label}</span> <ChevronDown size={14} />
      </button>
      {open && <div className={styles.menu} role="listbox" aria-label="Choose a model">
        <div className={styles.title}>Choose a model</div>
        {CHAT_MODELS.map((model) => <button type="button" role="option" aria-selected={model.id === selected.id} key={model.id} className={styles.option} onClick={() => { onChange(model.id); setOpen(false); triggerRef.current?.focus(); }}>
          <span><strong>{model.label}</strong><small>{model.description}</small></span>
          {model.id === selected.id && <Check size={16} />}
        </button>)}
      </div>}
    </div>
  );
}
