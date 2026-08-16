"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  ChevronRight,
  CircleHelp,
  Code2,
  Download,
  Ellipsis,
  FileText,
  Folder,
  LogOut,
  Menu,
  MessageSquare,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Send,
  Settings,
  Share,
  Sparkles,
  Trash2,
  UserCircle,
  X,
} from "lucide-react";

const chats = [
  "ChatGPT UI Clone Tips",
  "Finite Automata Theory",
  "Internship Platforms List",
  "Open Shared Chat Link",
  "First X Post Idea",
  "Personal Tech Blog Plan",
  "Max Value Calculation",
  "AI Internship Skills 2026",
  "RailYatra Health Monitor",
  "Fashion Marketplace for Gen-Z",
  "Production health check inc...",
  "Tech Stack Expansion",
  "Production health check blocke...",
  "Claude Code Setup Guide",
  "GitHub Pack Activation Timeline",
];

const projects = ["INTERNAL AI", "EASY TRIP", "RAIL YATRA", "Vaani Sutra"];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);

  const filteredChats = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? chats.filter((chat) => chat.toLowerCase().includes(value)) : chats;
  }, [query]);

  return (
    <main className="app-shell">
      {sidebarOpen ? (
        <aside className="sidebar">
          <header className="sidebar-header">
            <div className="brand">ChatGPT <span>Go</span></div>
            <div className="header-actions">
              <button className="icon-btn" aria-label="Search" onClick={() => setQuery(query ? "" : "chat")}>
                <Search size={19} strokeWidth={1.9} />
              </button>
              <button className="icon-btn" aria-label="Collapse sidebar" onClick={() => setSidebarOpen(false)}>
                <Menu size={19} strokeWidth={1.9} />
              </button>
            </div>
          </header>

          <button className="new-chat" onClick={() => setQuery("")}>
            <Pencil size={19} strokeWidth={1.9} />
            <span>New chat</span>
          </button>

          <div className="divider" />

          <section className="sidebar-scroll">
            <div className="section-label">Chats</div>
            <nav className="chat-list">
              {filteredChats.map((chat, index) => (
                <button className={`chat-item ${index === 0 && !query ? "active" : ""}`} key={chat}>
                  <MessageSquare size={15} strokeWidth={1.8} />
                  <span>{chat}</span>
                </button>
              ))}
            </nav>

            <div className="section-label projects-label">Projects</div>
            <nav className="project-list">
              {projects.map((project, index) => (
                <button className="project-item" key={project}>
                  <span className={`project-icon p-${index}`} />
                  <span>{project}</span>
                </button>
              ))}
            </nav>
          </section>

          <footer className="sidebar-footer">
            <div className="footer-menu-wrap">
              {accountOpen && (
                <div className="account-menu">
                  <button className="account-primary" onClick={() => setAccountOpen(false)}>
                    <div className="avatar">PA</div>
                    <div className="account-name-block">
                      <strong>parthkrishna</strong>
                      <span>Go</span>
                    </div>
                    <ChevronRight size={18} />
                  </button>
                  <div className="menu-divider" />
                  <MenuButton icon={<Sparkles size={18} />} label="Upgrade plan" onClick={() => setUpgradeOpen(true)} />
                  <MenuButton icon={<Sparkles size={18} />} label="Personalization" />
                  <MenuButton icon={<UserCircle size={18} />} label="Profile" onClick={() => setProfileOpen(true)} />
                  <MenuButton icon={<Settings size={18} />} label="Settings" onClick={() => setSettingsOpen(true)} />
                  <div className="menu-divider" />
                  <div className="submenu-wrap">
                    <MenuButton icon={<CircleHelp size={18} />} label="Help" onClick={() => setHelpOpen((v) => !v)} suffix={<ChevronRight size={16} />} />
                    {helpOpen && <HelpSubmenu />}
                  </div>
                  <MenuButton icon={<LogOut size={18} />} label="Log out" />
                </div>
              )}

              <button className="user-footer" onClick={() => setAccountOpen((v) => !v)}>
                <div className="avatar">PA</div>
                <div className="account-name-block">
                  <strong>parthkrishna</strong>
                  <span>Go</span>
                </div>
                <div className="store-icon">▤</div>
              </button>
            </div>
          </footer>
        </aside>
      ) : (
        <aside className="sidebar-collapsed">
          <button className="icon-btn" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Menu size={19} /></button>
          <button className="icon-btn" aria-label="New chat"><Plus size={19} /></button>
        </aside>
      )}

      <section className="main-panel">
        <header className="topbar">
          <div />
          <div className="topbar-actions">
            <button className="topbar-btn"><Share size={18} /> <span>Share</span></button>
            <div className="chat-menu-wrap">
              <button className="topbar-btn icon-only" onClick={() => setChatMenuOpen((v) => !v)}><Ellipsis size={20} /></button>
              {chatMenuOpen && <ChatMenu />}
            </div>
          </div>
        </header>

        <div className="conversation">
          <article className="message-block">
            <h3>Backend</h3>
            <p>• Next.js API routes initially, or a separate backend if the hackathon requires it.</p>
            <h3>AI</h3>
            <p>• OpenAI API or another permitted model provider</p>
            <h3>Persistence</h3>
            <p>• PostgreSQL + Prisma</p>
            <p>But <strong>don't over-engineer the backend on day one.</strong> The UI is the competition-critical part if the challenge is visual cloning.</p>
            <hr />
            <h2>One more thing</h2>
            <p>Since you specifically said <strong>“exactly same as current version”</strong>, we should not rely on my memory of the interface.</p>
            <p>We need to work from the actual <strong>current ChatGPT UI</strong> and systematically inspect it. The interface changes over time, and today's version is what matters for your hackathon.</p>
            <p>I can help you build this from zero → <strong>deployment</strong>, including the component architecture, styling system, responsive behavior, animations, state management, backend, testing, and final visual QA.</p>
            <p><strong>Best next step:</strong> send me the hackathon rules/task statement + judging criteria + deadline, and if they provided a reference URL/screenshot/video, send that too. Then we'll turn it into a concrete build plan rather than randomly coding components.</p>
            <div className="message-actions"><button>▢</button><button>♡</button><button>↥</button><button>↻</button><button>•••</button></div>
          </article>
        </div>

        <div className="composer-wrap">
          <div className={`composer ${attachments.length ? "composer-with-files" : ""}`}>
            {attachments.length > 0 && (
              <div className="attachment-row">
                {attachments.map((item) => <div className="attachment-chip" key={item}><FileText size={14} />{item}<button onClick={() => setAttachments((prev) => prev.filter((x) => x !== item))}>×</button></div>)}
              </div>
            )}
            <div className="composer-row">
              <label className="composer-plus">
                <Plus size={21} />
                <input type="file" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) setAttachments((prev) => [...prev, file.name]); }} />
              </label>
              <input className="composer-input" placeholder="Ask anything" value={query} onChange={(e) => setQuery(e.target.value)} />
              <div className="composer-actions">
                <button className="composer-tool"><Sparkles size={18} /> <span>Think</span></button>
                <button className="composer-tool" aria-label="Voice">◌</button>
                <button className="composer-tool blue-icon" aria-label="AI tools"><Sparkles size={18} /></button>
                <button className={`send-btn ${query.trim() ? "ready" : ""}`} aria-label="Send"><Send size={18} fill="currentColor" /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
      {upgradeOpen && <UpgradePage onClose={() => setUpgradeOpen(false)} />}
    </main>
  );
}

function MenuButton({ icon, label, onClick, suffix }: { icon: React.ReactNode; label: string; onClick?: () => void; suffix?: React.ReactNode }) {
  return <button className="menu-btn" onClick={onClick}>{icon}<span>{label}</span>{suffix && <span className="menu-suffix">{suffix}</span>}</button>;
}

function HelpSubmenu() {
  return <div className="help-submenu">
    <MenuButton icon={<CircleHelp size={18} />} label="Help center" />
    <MenuButton icon={<Pencil size={18} />} label="Release notes" />
    <MenuButton icon={<Download size={18} />} label="Download apps" />
    <MenuButton icon={<Code2 size={18} />} label="Keyboard shortcuts" />
    <div className="menu-divider" />
    <MenuButton icon={<FileText size={18} />} label="Terms of Service" />
    <MenuButton icon={<CircleHelp size={18} />} label="Privacy Policy" />
    <MenuButton icon={<CircleHelp size={18} />} label="Report a bug" />
  </div>;
}

function ChatMenu() {
  return <div className="chat-popover">
    <MenuButton icon={<Folder size={18} />} label="View files in chat" />
    <MenuButton icon={<Sparkles size={18} />} label="Pin chat" />
    <MenuButton icon={<Archive size={18} />} label="Archive" />
    <MenuButton icon={<Trash2 size={18} />} label="Delete" />
    <div className="menu-divider" />
    <MenuButton icon={<Folder size={18} />} label="Move to project" suffix={<ChevronRight size={16} />} />
  </div>;
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [section, setSection] = useState("General");
  const items = ["General", "Notifications", "Personalization", "Plugins", "Voice", "Billing", "Data controls", "Storage", "Safety", "Security and login", "Parental controls", "Trusted contact", "Account", "Keyboard"];
  return <div className="overlay">
    <div className="settings-modal">
      <button className="modal-close" onClick={onClose}><X size={20} /></button>
      <aside className="settings-side">
        <div className="settings-search"><Search size={16} /><input placeholder="Search settings" /></div>
        <div className="settings-nav">{items.map((item) => <button key={item} className={section === item ? "selected" : ""} onClick={() => setSection(item)}>{item}</button>)}</div>
      </aside>
      <section className="settings-content">
        <h2>{section}</h2>
        <div className="security-card"><div className="security-icon">♙</div><div><strong>Secure your account</strong><p>Add multi-factor authentication (MFA), like a text message or authenticator app, to help protect your account when logging in.</p><button>Set up MFA</button></div><span>×</span></div>
        {section === "Personalization" ? <Personalization /> : <GeneralSettings />}
      </section>
    </div>
  </div>;
}

function GeneralSettings() {
  const rows = ["Appearance", "Contrast", "Accent color", "Icon color", "Language", "Higher intelligence", "Enable Dictation"];
  return <div className="settings-rows">{rows.map((row, i) => <div className="settings-row" key={row}><div><strong>{row}</strong>{i >= 5 && <p>{i === 5 ? "ChatGPT can automatically use a higher intelligence setting when you ask a complex question." : "Use dictation in the chat composer."}</p>}</div><span>{i < 5 ? "System⌄" : <i className="toggle on" />}</span></div>)}</div>;
}

function Personalization() {
  return <div className="settings-rows"><div className="settings-row"><div><strong>Base style and tone</strong><p>Set the style and tone of how ChatGPT responds to you.</p></div><span>Default⌄</span></div><div className="settings-row"><div><strong>Characteristics</strong><p>Choose additional customizations on top of your base style and tone.</p></div><span>Default⌄</span></div>{["Warm", "Enthusiastic", "Headers & Lists", "Emoji"].map((x) => <div className="settings-row" key={x}><strong>{x}</strong><span>Default⌄</span></div>)}<div className="settings-row"><div><strong>Fast answers</strong><p>ChatGPT can sometimes use its general knowledge to give fast, in-depth answers.</p></div><span><i className="toggle on" /></span></div><div className="custom-instructions"><strong>Custom instructions</strong><textarea defaultValue="Talk like a member of Gen Z. Be talkative and conversational. Tell it like it is; don't sugar-coat responses. Have a traditional outlook, valuing the past and how things have always been done. Take a forward-thinking view." /></div></div>;
}

function ProfileModal({ onClose }: { onClose: () => void }) {
  return <div className="overlay light-overlay"><div className="profile-modal"><h2>Edit profile</h2><div className="profile-avatar">PA<button>◉</button></div><label>Display name<input defaultValue="parthkrishna" /></label><label>Username<input defaultValue="parthkrishna" /></label><p>Your profile helps people recognize you in group chats.</p><div className="profile-actions"><button onClick={onClose}>Cancel</button><button className="primary" onClick={onClose}>Save</button></div></div></div>;
}

function UpgradePage({ onClose }: { onClose: () => void }) {
  const plans = [
    { name: "Go", price: "₹399", sub: "Keep chatting with expanded access", current: true, items: ["Core model", "More messages and uploads", "More image creation", "Longer memory", "Expanded voice mode"] },
    { name: "Plus", price: "₹1,999", sub: "Unlock the full experience", items: ["Advanced models", "Advanced image creation with Thinking", "Expanded memory across chats", "Work agent for multi-step tasks", "Codex agent for coding", "Expanded deep research", "Projects and custom GPTs"] },
    { name: "Pro", price: "₹10,699", sub: "Maximize your productivity", items: ["5x more usage than Plus", "Frontier Pro model", "Maximum access to Codex agent", "Maximum access to Work agent", "Unlimited core chat", "Unlimited and faster image creation", "Maximum memory and context", "Early access to experimental features"] },
  ];
  return <div className="upgrade-screen"><button className="upgrade-close" onClick={onClose}><X /></button><h1>Upgrade your plan</h1><div className="billing-toggle"><span className="selected">Personal</span><span>Business</span></div><div className="plans">{plans.map((plan) => <div className="plan-card" key={plan.name}><h2>{plan.name}</h2><div className="plan-price">{plan.price}<small> INR / month</small></div><strong>{plan.sub}</strong><button className={plan.current ? "disabled" : "primary-wide"}>{plan.current ? "Your current plan" : `Upgrade to ${plan.name}`}</button><div className="features">{plan.items.map((item) => <div key={item}><span>✧</span>{item}</div>)}</div></div>)}</div></div>;
}
