"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Archive, ArrowUp, Check, ChevronDown, ChevronRight, CircleHelp, Code2, Copy,
  Download, File, FileText, Folder, Image as ImageIcon, Keyboard, LogOut, Menu,
  MessageCircle, Mic, MoreHorizontal, Paperclip, Pencil, Plus, Search, Send,
  Settings, Share, Sparkles, Trash2, UserCircle, X
} from "lucide-react";

type Chat = { id: string; title: string };

const initialChats: Chat[] = [
  { id: "1", title: "ChatGPT UI Clone Tips" }, { id: "2", title: "Finite Automata Theory" },
  { id: "3", title: "Internship Platforms List" }, { id: "4", title: "Open Shared Chat Link" },
  { id: "5", title: "First X Post Idea" }, { id: "6", title: "Personal Tech Blog Plan" },
  { id: "7", title: "Max Value Calculation" }, { id: "8", title: "AI Internship Skills 2026" },
  { id: "9", title: "RailYatra Health Monitor" }, { id: "10", title: "Fashion Marketplace for Gen-Z" },
  { id: "11", title: "Production health check inc..." }, { id: "12", title: "Tech Stack Expansion" },
  { id: "13", title: "Production health check blocke..." }, { id: "14", title: "Claude Code Setup Guide" },
  { id: "15", title: "GitHub Pack Activation Timeline" }
];

const projects = ["INTERNAL AI", "EASY TRIP", "RAIL YATRA", "Vaani Sutra"];

const referenceAnswer = [
  ["Backend", "Next.js API routes initially, or a separate backend if the hackathon requires it."],
  ["AI", "OpenAI API or another permitted model provider"],
  ["Persistence", "PostgreSQL + Prisma"]
];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountSwitcher, setAccountSwitcher] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState("1");
  const [chats, setChats] = useState(initialChats);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); }
      if (event.key === "Escape") { setSearchOpen(false); setChatMenuOpen(false); setHelpOpen(false); setAccountSwitcher(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const selectedTitle = chats.find((chat) => chat.id === selectedChat)?.title ?? "New chat";
  const filteredChats = useMemo(() => chats.filter((chat) => chat.title.toLowerCase().includes(draft.toLowerCase())), [chats, draft]);

  function newChat() {
    setSelectedChat("new"); setSent(false); setDraft(""); setAttachments([]); setMobileSidebar(false);
  }

  function sendMessage() {
    if (!draft.trim() && !attachments.length) return;
    const title = draft.trim().slice(0, 38) || "New conversation";
    const id = crypto.randomUUID();
    setChats((current) => [{ id, title }, ...current]);
    setSelectedChat(id); setSent(true); setDraft(""); setAttachments([]); setMobileSidebar(false);
  }

  return (
    <main className="app-shell">
      {sidebarOpen && <div className="mobile-backdrop" onClick={() => setMobileSidebar(false)} />}
      <aside className={`sidebar ${mobileSidebar ? "mobile-visible" : ""} ${!sidebarOpen ? "desktop-hidden" : ""}`}>
        <header className="sidebar-header">
          <button className="brand-button" onClick={newChat}><span className="brand">ChatGPT <span>Go</span></span></button>
          <div className="header-actions">
            <button className="icon-btn" aria-label="Search" title="Search  Ctrl K" onClick={() => setSearchOpen(true)}><Search size={19}/></button>
            <button className="icon-btn collapse-btn" aria-label="Collapse sidebar" onClick={() => setSidebarOpen(false)}><Menu size={19}/></button>
            <button className="icon-btn mobile-close" onClick={() => setMobileSidebar(false)}><X size={19}/></button>
          </div>
        </header>
        <button className="new-chat" onClick={newChat}><Pencil size={18}/><span>New chat</span></button>
        <div className="divider" />
        <div className="sidebar-scroll">
          <div className="section-label">Chats</div>
          <nav className="chat-list">
            {chats.map((chat) => <button key={chat.id} className={`chat-item ${chat.id === selectedChat ? "active" : ""}`} onClick={() => { setSelectedChat(chat.id); setSent(chat.id !== "new"); setMobileSidebar(false); }}><span>{chat.title}</span></button>)}
          </nav>
          <div className="section-label projects-label">Projects</div>
          <nav className="project-list">{projects.map((project, i) => <button className="project-item" key={project}><span className={`project-icon p-${i}`}>{i === 0 ? "$" : i === 1 ? "✈" : i === 2 ? "⌁" : "♡"}</span><span>{project}</span></button>)}</nav>
        </div>
        <footer className="sidebar-footer">
          <div className="footer-menu-wrap">
            {accountOpen && <div className="account-menu">
              <button className="account-primary" onClick={() => setAccountSwitcher((v) => !v)}><div className="avatar">PA</div><div className="account-name-block"><strong>parthkrishna</strong><span>Go</span></div><ChevronRight size={18}/></button>
              <div className="menu-divider" />
              <MenuButton icon={<Sparkles size={18}/>} label="Upgrade plan" onClick={() => { setUpgradeOpen(true); setAccountOpen(false); }}/>
              <MenuButton icon={<Sparkles size={18}/>} label="Personalization" onClick={() => setSettingsOpen(true)}/>
              <MenuButton icon={<UserCircle size={18}/>} label="Profile" onClick={() => setProfileOpen(true)}/>
              <MenuButton icon={<Settings size={18}/>} label="Settings" onClick={() => setSettingsOpen(true)}/>
              <div className="menu-divider" />
              <div className="submenu-wrap"><MenuButton icon={<CircleHelp size={18}/>} label="Help" onClick={() => setHelpOpen((v) => !v)} suffix={<ChevronRight size={16}/>}/>{helpOpen && <HelpSubmenu/>}</div>
              <MenuButton icon={<LogOut size={18}/>} label="Log out"/>
              {accountSwitcher && <AccountSwitcher/>}
            </div>}
            <button className="user-footer" onClick={() => setAccountOpen((v) => !v)}><div className="avatar">PA</div><div className="account-name-block"><strong>parthkrishna</strong><span>Go</span></div><span className="store-icon">▤</span></button>
          </div>
        </footer>
      </aside>
      {!sidebarOpen && <button className="reopen-sidebar" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Menu size={20}/></button>}

      <section className="main-panel">
        <header className="topbar"><div className="mobile-title">{selectedTitle}</div><div className="topbar-actions"><button className="topbar-btn"><Share size={18}/><span>Share</span></button><div className="chat-menu-wrap"><button className="topbar-btn icon-only" onClick={() => setChatMenuOpen((v) => !v)}><MoreHorizontal size={20}/></button>{chatMenuOpen && <ChatMenu onDelete={() => { setChatMenuOpen(false); setChats((c) => c.filter((x) => x.id !== selectedChat)); newChat(); }}/>}</div></div></header>
        <div className="conversation">
          {!sent && <div className="empty-state"><div className="empty-logo">✦</div><h1>How can I help you today?</h1><div className="suggestions"><button onClick={() => setDraft("Help me plan my day")}>Plan my day</button><button onClick={() => setDraft("Explain a difficult concept")}>Explain a concept</button><button onClick={() => setDraft("Write some code")}>Write code</button></div></div>}
          {sent && <article className="message-block">
            <div className="user-message">{selectedTitle}</div>
            <div className="assistant-row"><div className="assistant-mark">✦</div><div className="assistant-content">
              {referenceAnswer.map(([heading, text]) => <div key={heading}><h3>{heading}</h3><p>• {text}</p></div>)}
              <p>But <strong>don't over-engineer the backend on day one.</strong> The UI is the competition-critical part if the challenge is visual cloning.</p><hr/><h2>One more thing</h2>
              <p>Since you specifically said <strong>“exactly same as current version”</strong>, the interface should be treated as a visual specification rather than a rough inspiration.</p>
              <p>The clone should reproduce the visible layout, states, menus, settings, composer behavior, responsive sidebar, and interaction details represented by the reference screenshots.</p>
              <div className="code-demo"><div className="code-head"><span>typescript</span><button><Copy size={14}/> Copy</button></div><pre>{`const ui = {\n  sidebar: "responsive",\n  composer: "sticky",\n  menus: "interactive"\n};`}</pre></div>
              <div className="message-actions"><button title="Copy"><Copy size={16}/></button><button title="Good response">♡</button><button title="Share"><Share size={16}/></button><button title="Regenerate">↻</button><button title="More"><MoreHorizontal size={17}/></button></div>
            </div></div>
          </article>}
        </div>
        <div className="composer-wrap"><div className={`composer ${attachments.length ? "composer-with-files" : ""}`}>
          {attachments.length > 0 && <div className="attachment-row">{attachments.map((item) => <div className="attachment-chip" key={item}><FileText size={14}/><span>{item}</span><button onClick={() => setAttachments((p) => p.filter((x) => x !== item))}>×</button></div>)}</div>}
          <div className="composer-row"><label className="composer-plus" title="Add files"><Plus size={21}/><input type="file" multiple hidden onChange={(e) => { const files = Array.from(e.target.files ?? []); setAttachments((p) => [...p, ...files.map((f) => f.name)]); }}/></label><input autoFocus className="composer-input" placeholder="Ask anything" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}/><div className="composer-actions"><button className="composer-tool think"><Sparkles size={18}/><span>Think</span></button><button className="composer-tool" title="Voice"><Mic size={18}/></button><button className="composer-tool blue-icon" title="AI tools"><Sparkles size={19}/></button><button className={`send-btn ${draft.trim() || attachments.length ? "ready" : ""}`} onClick={sendMessage} aria-label="Send">{draft.trim() || attachments.length ? <ArrowUp size={19} strokeWidth={2.4}/> : <div className="wave-icon">▮▮▮</div>}</button></div></div>
        </div></div>
      </section>
      {searchOpen && <SearchModal chats={filteredChats} onClose={() => setSearchOpen(false)} onSelect={(id) => { setSelectedChat(id); setSent(true); setSearchOpen(false); }} />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)}/>} {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)}/>} {upgradeOpen && <UpgradePage onClose={() => setUpgradeOpen(false)}/>} 
    </main>
  );
}

function MenuButton({icon,label,onClick,suffix}:{icon:ReactNode;label:string;onClick?:()=>void;suffix?:ReactNode}) { return <button className="menu-btn" onClick={onClick}>{icon}<span>{label}</span>{suffix && <span className="menu-suffix">{suffix}</span>}</button>; }

function AccountSwitcher(){ return <div className="account-switcher"><div className="switch-email"><UserCircle size={18}/> <span>gulshankumari...@gmail.com</span></div><button className="switch-account"><div className="avatar small">PA</div><span>parthkrishna</span><Check size={17}/></button><div className="menu-divider"/><button className="add-account"><Plus size={20}/> Add account</button></div>; }

function HelpSubmenu(){ return <div className="help-submenu"><MenuButton icon={<CircleHelp size={18}/>} label="Help center"/><MenuButton icon={<Pencil size={18}/>} label="Release notes"/><MenuButton icon={<Download size={18}/>} label="Download apps"/><MenuButton icon={<Keyboard size={18}/>} label="Keyboard shortcuts"/><div className="menu-divider"/><MenuButton icon={<FileText size={18}/>} label="Terms of Service"/><MenuButton icon={<CircleHelp size={18}/>} label="Privacy Policy"/><MenuButton icon={<CircleHelp size={18}/>} label="Report a bug"/></div>; }

function ChatMenu({onDelete}:{onDelete:()=>void}){ return <div className="chat-popover"><MenuButton icon={<Folder size={18}/>} label="View files in chat"/><MenuButton icon={<Sparkles size={18}/>} label="Pin chat"/><MenuButton icon={<Archive size={18}/>} label="Archive"/><MenuButton icon={<Trash2 size={18}/>} label="Delete" onClick={onDelete}/><div className="menu-divider"/><MenuButton icon={<Folder size={18}/>} label="Move to project" suffix={<ChevronRight size={16}/>}/></div>; }

function SearchModal({chats,onClose,onSelect}:{chats:Chat[];onClose:()=>void;onSelect:(id:string)=>void}){ const [value,setValue]=useState(""); const results=chats.filter((c)=>c.title.toLowerCase().includes(value.toLowerCase())); return <div className="search-overlay" onMouseDown={onClose}><div className="search-dialog" onMouseDown={(e)=>e.stopPropagation()}><div className="search-input-row"><Search size={19}/><input autoFocus placeholder="Search chats" value={value} onChange={(e)=>setValue(e.target.value)}/><kbd>Esc</kbd></div><div className="search-results">{results.length ? results.map((c)=><button key={c.id} onClick={()=>onSelect(c.id)}><MessageCircle size={17}/><span>{c.title}</span></button>) : <div className="no-results">No chats found</div>}</div></div></div>; }

function SettingsModal({onClose}:{onClose:()=>void}){ const [section,setSection]=useState("General"); const items=["General","Notifications","Personalization","Plugins","Voice","Billing","Data controls","Storage","Safety","Security and login","Parental controls","Trusted contact","Account","Keyboard"]; return <div className="overlay"><div className="settings-modal"><button className="modal-close" onClick={onClose}><X size={20}/></button><aside className="settings-side"><div className="settings-search"><Search size={16}/><input placeholder="Search settings"/></div><nav className="settings-nav">{items.map((item)=><button key={item} className={section===item?"selected":""} onClick={()=>setSection(item)}>{item}</button>)}</nav></aside><section className="settings-content"><h2>{section}</h2><div className="security-card"><div className="security-icon">♙</div><div><strong>Secure your account</strong><p>Add multi-factor authentication (MFA), like a text message or authenticator app, to help protect your account when logging in.</p><button>Set up MFA</button></div><button className="dismiss">×</button></div>{section==="Personalization"?<Personalization/>:<GeneralSettings section={section}/>}</section></div></div>; }

function GeneralSettings({section}:{section:string}){ const rows=section==="General"?["Appearance","Contrast","Accent color","Icon color","Language","Higher intelligence","Enable Dictation"]:["Notifications","Email notifications","Push notifications","Product updates","Data preferences"]; return <div className="settings-rows">{rows.map((row,i)=><div className="settings-row" key={row}><div><strong>{row}</strong>{(row==="Higher intelligence"||row==="Enable Dictation")&&<p>{row==="Higher intelligence"?"ChatGPT can automatically use a higher intelligence setting when you ask a complex question.":"Use dictation in the chat composer."}</p>}</div><span>{i<5&&section==="General"?"System⌄":<i className={`toggle ${i%2===0?"on":""}`}/>}</span></div>)}</div>; }

function Personalization(){ return <div className="settings-rows"><SettingSelect title="Base style and tone" description="Set the style and tone of how ChatGPT responds to you."/><SettingSelect title="Characteristics" description="Choose additional customizations on top of your base style and tone."/>{["Warm","Enthusiastic","Headers & Lists","Emoji"].map((x)=><div className="settings-row" key={x}><strong>{x}</strong><span>Default⌄</span></div>)}<div className="settings-row"><div><strong>Fast answers</strong><p>ChatGPT can sometimes use its general knowledge to give fast, in-depth answers.</p></div><i className="toggle on"/></div><div className="custom-instructions"><strong>Custom instructions</strong><textarea defaultValue="Talk like a member of Gen Z. Be talkative and conversational. Tell it like it is; don't sugar-coat responses. Have a traditional outlook, valuing the past and how things have always been done. Take a forward-thinking view."/></div></div>; }
function SettingSelect({title,description}:{title:string;description:string}){return <div className="settings-row"><div><strong>{title}</strong><p>{description}</p></div><span>Default⌄</span></div>;}

function ProfileModal({onClose}:{onClose:()=>void}){return <div className="overlay profile-overlay"><div className="profile-modal"><h2>Edit profile</h2><div className="profile-avatar">PA<button>◉</button></div><label>Display name<input defaultValue="parthkrishna"/></label><label>Username<input defaultValue="parthkrishna"/></label><p>Your profile helps people recognize you in group chats.</p><div className="profile-actions"><button onClick={onClose}>Cancel</button><button className="primary" onClick={onClose}>Save</button></div></div></div>;}

function UpgradePage({onClose}:{onClose:()=>void}){const plans=[{name:"Go",price:"₹399",sub:"Keep chatting with expanded access",current:true,items:["Core model","More messages and uploads","More image creation","Longer memory","Expanded voice mode"]},{name:"Plus",price:"₹1,999",sub:"Unlock the full experience",items:["Advanced models","Advanced image creation with Thinking","Expanded memory across chats","Work agent for multi-step tasks","Codex agent for coding","Expanded deep research","Projects and custom GPTs"]},{name:"Pro",price:"₹10,699",sub:"Maximize your productivity",items:["5x more usage than Plus","Frontier Pro model","Maximum access to Codex agent","Maximum access to Work agent","Unlimited core chat","Unlimited and faster image creation","Maximum memory and context","Early access to experimental features"]}];return <div className="upgrade-screen"><button className="upgrade-close" onClick={onClose}><X size={22}/></button><h1>Upgrade your plan</h1><div className="billing-toggle"><span className="selected">Personal</span><span>Business</span></div><div className="plans">{plans.map((p)=><article className="plan-card" key={p.name}><h2>{p.name}</h2><div className="plan-price">{p.price}<small> INR / month (inclusive of GST)</small></div><strong>{p.sub}</strong><button className={p.current?"current":"primary"}>{p.current?"Your current plan":`Upgrade to ${p.name}`}</button><ul>{p.items.map((item)=><li key={item}><Sparkles size={16}/>{item}</li>)}</ul>{p.current&&<small className="plan-foot">This plan may include ads. Learn more</small>}</article>)}</div></div>;}
