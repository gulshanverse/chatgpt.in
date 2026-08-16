"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Chat route error", error); }, [error]);

  return (
    <main className="functional-chat functional-route-error">
      <section className="functional-error-card" role="alert">
        <div className="functional-loading-mark">!</div>
        <h1>Something went wrong</h1>
        <p>The chat could not be loaded. Your saved conversations remain in this browser.</p>
        <button type="button" className="functional-reset" onClick={() => reset()}>Try again</button>
      </section>
    </main>
  );
}
