export default function Loading() {
  return (
    <main className="functional-chat" aria-busy="true" aria-label="Loading chat">
      <aside className="functional-sidebar" aria-hidden="true">
        <div className="functional-sidebar-top"><div className="functional-skeleton functional-skeleton-brand" /><div className="functional-skeleton functional-skeleton-icon" /></div>
        <div className="functional-skeleton functional-skeleton-new" />
        <div className="functional-skeleton functional-skeleton-search" />
        <div className="functional-skeleton functional-skeleton-row" />
        <div className="functional-skeleton functional-skeleton-row short" />
      </aside>
      <section className="functional-main">
        <header className="functional-header"><div className="functional-skeleton functional-skeleton-title" /></header>
        <div className="functional-loading-center"><div className="functional-loading-mark">✦</div><span>Loading your chats…</span></div>
      </section>
    </main>
  );
}
