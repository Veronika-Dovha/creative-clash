import { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://htlsjqkkljdtjlprftic.supabase.co";
const SUPABASE_ANON_KEY = "PASTE_YOUR_ANON_KEY_HERE";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const S = {
  blue: "#0048CE", blueHover: "#0039A6", blueLite: "#E6EEFB", blueLight2: "#CCE0FF",
  text: "#171D26", textSecondary: "#485F7D", textMuted: "#8299B4",
  border: "#BDC9DB", borderLight: "#E2EAF2",
  bg: "#FFFFFF", bgGray: "#F4F7FA", bgGray2: "#EBF0F6",
  shadow: "0 2px 0 rgba(72,95,125,0.2)", shadowCard: "0 4px 16px rgba(72,95,125,0.12)",
  radius: "5px", radiusMd: "8px", radiusLg: "12px", font: "'Poppins', sans-serif",
};

const PACKS = [
  { id: "art", icon: "🎨", label: "Art & Artists", desc: "Bauhaus, Warhol, Surrealism and more", color: S.blue, bg: S.blueLite,
    prompts: ["Pick an art style that describes your Monday morning","Which artist would design your dream portfolio website?","If you were an art movement, which one would you be?","Which artist's color palette matches your current mood?","Pick an art style for a 'coming soon' landing page","Which artist would make the best UX designer?","Your design process is most like which art movement?","Which art style should NEVER be used in web design?"],
    options: ["Bauhaus","Surrealism","Pop Art","Minimalism","Brutalism","Memphis","Art Nouveau","Constructivism"] },
  { id: "brands", icon: "🏷️", label: "Iconic Brands", desc: "Nike, Apple, Coca-Cola and the greats", color: "#1B8A5A", bg: "#E6F5EF",
    prompts: ["Which brand are you before your morning coffee?","Which brand best describes your design aesthetic?","Pick a brand whose logo you secretly wish you designed","Which brand would you rebrand first if you could?","Which brand's design system would you steal for a day?","Pick a brand that matches your presentation style","Which brand's color palette do you overuse?","Which brand would make the worst design client?"],
    options: ["Nike","Apple","Coca-Cola","IKEA","Google","Spotify","Netflix","Airbnb"] },
  { id: "teammates", icon: "👤", label: "Tag a Teammate", desc: "The spicy pack — who's who on the team?", color: "#7C3AED", bg: "#F3EEFF",
    prompts: ["Who on the team is the most Bauhaus designer?","Who would survive a full Comic Sans brief without crying?","Who is the Nike of the team — iconic, bold, consistent?","Who would redesign the team Slack with zero prompting?","Who is the secret minimalism fan on the team?","Who would win a 10-minute logo challenge?","Who gives feedback like a Brutalist building — raw and honest?","Who is the Warhol of the team — makes everything cool?"],
    options: [] },
];

const TOTAL_ROUNDS = 5;
const avatarColors = [["#E6EEFB","#0048CE"],["#E6F5EF","#1B8A5A"],["#F3EEFF","#7C3AED"],["#FFF4E6","#C67500"],["#FFE6E6","#C53030"],["#E6F9FF","#0077A8"],["#FFF8E6","#B45309"],["#F0FFF4","#166534"]];

function genRoomCode() { return Math.random().toString(36).slice(2,7).toUpperCase(); }

function Avatar({ name, idx, size = 36 }) {
  const [bg, fg] = avatarColors[idx % avatarColors.length];
  return <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: S.font, fontWeight: 600, fontSize: size * 0.38, flexShrink: 0, border: `1.5px solid ${fg}33` }}>{name[0].toUpperCase()}</div>;
}

function Btn({ children, onClick, disabled, full, secondary, small }) {
  const [hov, setHov] = useState(false);
  const base = { fontFamily: S.font, fontWeight: 500, fontSize: small ? 14 : 16, cursor: disabled ? "not-allowed" : "pointer", borderRadius: S.radius, padding: small ? "8px 18px" : "12px 32px", width: full ? "100%" : "auto", transition: "background 0.15s", border: "none" };
  if (secondary) return <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ ...base, background: hov ? S.blueLite : "#fff", color: S.blue, border: `1.5px solid ${S.blue}` }}>{children}</button>;
  return <button onClick={onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ ...base, background: disabled ? S.bgGray2 : hov ? S.blueHover : S.blue, color: disabled ? S.textMuted : "#fff", boxShadow: disabled ? "none" : S.shadow }}>{children}</button>;
}

function RoundBar({ round, pack }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", gap: 5 }}>
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => <div key={i} style={{ width: 26, height: 4, borderRadius: 2, background: i < round ? pack.color : S.borderLight }} />)}
      </div>
      <span style={{ fontSize: 13, color: S.textSecondary, fontWeight: 500 }}>Round {round} of {TOTAL_ROUNDS}</span>
    </div>
  );
}

function PromptCard({ prompt, pack }) {
  return (
    <div style={{ background: S.bgGray, border: `1px solid ${S.borderLight}`, borderLeft: `4px solid ${pack.color}`, borderRadius: S.radiusMd, padding: "20px", marginBottom: "1.5rem" }}>
      <p style={{ fontSize: 18, fontWeight: 600, color: S.text, margin: 0, lineHeight: 1.45 }}>"{prompt}"</p>
    </div>
  );
}

async function getRoom(code) {
  const { data, error } = await supabase.from("rooms").select("data").eq("code", code).single();
  if (error || !data) return null;
  return data.data;
}

async function saveRoom(room) {
  await supabase.from("rooms").upsert({ code: room.code, data: room, updated_at: new Date().toISOString() });
}

export default function App() {
  const [screen, setScreen] = useState("name");
  const [myName, setMyName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [room, setRoom] = useState(null);
  const [myAnswer, setMyAnswer] = useState(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const pollRef = useRef(null);

  const pack = room ? PACKS.find(p => p.id === room.packId) : null;
  const currentPrompt = room ? room.prompts?.[room.round - 1] : "";
  const options = room && pack ? (pack.id === "teammates" ? room.players : pack.options) : [];

  useEffect(() => {
    if (!roomCode || !["wait","answer","reveal","lobby","end"].includes(screen)) return;
    const poll = async () => {
      const data = await getRoom(roomCode);
      if (!data) return;
      setRoom(data);
      if (screen === "wait" && data.phase === "answer") { setMyAnswer(null); setScreen("answer"); }
      if (screen === "answer" && data.phase === "reveal") setScreen("reveal");
      if (screen === "reveal" && data.phase === "answer") { setMyAnswer(null); setScreen("answer"); }
      if (["reveal","answer","wait"].includes(screen) && data.phase === "end") setScreen("end");
    };
    pollRef.current = setInterval(poll, 1500);
    return () => clearInterval(pollRef.current);
  }, [screen, roomCode]);

  const handleName = () => { const n = nameInput.trim(); if (!n) return; setMyName(n); setScreen("lobby"); };

  const createRoom = async () => {
    const code = genRoomCode();
    const data = { code, phase: "pack", hostName: myName, players: [myName], round: 1, packId: null, prompts: [], answers: {}, reactions: {} };
    await saveRoom(data);
    setRoom(data); setRoomCode(code); setIsHost(true);
  };

  const joinRoom = async () => {
    const code = joinInput.trim().toUpperCase();
    if (!code) return;
    const data = await getRoom(code);
    if (!data) { setErr("Room not found. Check the code and try again."); return; }
    if (data.players.includes(myName)) { setErr("That name is already taken in this room."); return; }
    data.players.push(myName);
    await saveRoom(data);
    setRoom(data); setRoomCode(code); setIsHost(false);
    setScreen(data.phase === "answer" ? "answer" : "wait");
  };

  const selectPack = async (packId) => {
    const packData = PACKS.find(p => p.id === packId);
    const prompts = [...packData.prompts].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);
    const data = { ...room, packId, prompts, phase: "answer", round: 1, answers: {}, reactions: {} };
    await saveRoom(data); setRoom(data); setMyAnswer(null); setScreen("answer");
  };

  const submitAnswer = async () => {
    if (!myAnswer) return;
    const data = { ...room, answers: { ...room.answers, [myName]: myAnswer } };
    const allAnswered = room.players.every(p => data.answers[p]);
    if (allAnswered) data.phase = "reveal";
    await saveRoom(data); setRoom(data);
    setScreen(allAnswered ? "reveal" : "wait");
  };

  const nextRound = async () => {
    if (room.round >= TOTAL_ROUNDS) {
      const data = { ...room, phase: "end" };
      await saveRoom(data); setRoom(data); setScreen("end");
    } else {
      const data = { ...room, round: room.round + 1, phase: "answer", answers: {}, reactions: {} };
      await saveRoom(data); setRoom(data); setMyAnswer(null); setScreen("answer");
    }
  };

  const addReaction = async (player) => {
    const data = { ...room, reactions: { ...room.reactions, [player]: (room.reactions?.[player] || 0) + 1 } };
    await saveRoom(data); setRoom(data);
  };

  const copyCode = () => { navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const reset = () => { setScreen("name"); setRoomCode(""); setMyName(""); setNameInput(""); setRoom(null); setIsHost(false); setMyAnswer(null); };

  return (
    <div style={{ fontFamily: S.font, background: S.bg, minHeight: "100vh", maxWidth: 480, margin: "0 auto" }}>

      {/* NAME */}
      {screen === "name" && (
        <div style={{ padding: "3rem 1.5rem 2rem" }}>
          <div style={{ width: 56, height: 56, borderRadius: S.radiusLg, background: S.blueLite, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: "1.5rem" }}>🎨</div>
          <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 700, color: S.text, letterSpacing: "-0.4px" }}>Creative Clash</h1>
          <p style={{ margin: "0 0 2rem", fontSize: 15, color: S.textSecondary, lineHeight: 1.5 }}>The design team icebreaker. Pick, answer, and reveal together.</p>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: S.text, marginBottom: 8 }}>What's your name?</label>
          <input value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleName()} placeholder="e.g. Alex, Maya, Jordan…" autoFocus
            style={{ width: "100%", padding: "12px 14px", borderRadius: S.radius, border: `1.5px solid ${S.border}`, fontFamily: S.font, fontSize: 16, color: S.text, outline: "none", boxSizing: "border-box", marginBottom: "1rem" }} />
          <Btn onClick={handleName} disabled={!nameInput.trim()} full>Continue →</Btn>
          <div style={{ marginTop: "2.5rem", borderTop: `1px solid ${S.borderLight}`, paddingTop: "1.5rem" }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: S.textMuted, textTransform: "uppercase", letterSpacing: "0.6px" }}>3 game modes</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PACKS.map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: S.bgGray, borderRadius: S.radiusMd, border: `1px solid ${S.borderLight}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: S.radius, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{p.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: S.text }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: S.textSecondary }}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LOBBY */}
      {screen === "lobby" && !roomCode && (
        <div style={{ padding: "2.5rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2rem" }}>
            <Avatar name={myName} idx={0} size={40} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, color: S.text }}>Hey, {myName}! 👋</div>
              <div style={{ fontSize: 13, color: S.textSecondary }}>Create a room or join one</div>
            </div>
          </div>
          <div style={{ background: S.bgGray, borderRadius: S.radiusMd, padding: "20px", marginBottom: "1rem", border: `1px solid ${S.borderLight}` }}>
            <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 15, color: S.text }}>Start a new game</p>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: S.textSecondary }}>You'll be the host and pick the mode</p>
            <Btn onClick={createRoom} full>Create room</Btn>
          </div>
          <div style={{ background: S.bgGray, borderRadius: S.radiusMd, padding: "20px", border: `1px solid ${S.borderLight}` }}>
            <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 15, color: S.text }}>Join a room</p>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: S.textSecondary }}>Enter the code from your host</p>
            <input value={joinInput} onChange={e => { setJoinInput(e.target.value.toUpperCase()); setErr(""); }} onKeyDown={e => e.key === "Enter" && joinRoom()} placeholder="Room code e.g. XK9TW"
              style={{ width: "100%", padding: "11px 14px", borderRadius: S.radius, border: `1.5px solid ${err ? "#E53935" : S.border}`, fontFamily: S.font, fontSize: 16, color: S.text, outline: "none", boxSizing: "border-box", marginBottom: 10, letterSpacing: "2px", textTransform: "uppercase" }} />
            {err && <p style={{ margin: "0 0 8px", fontSize: 13, color: "#E53935" }}>{err}</p>}
            <Btn onClick={joinRoom} disabled={!joinInput.trim()} full>Join room</Btn>
          </div>
        </div>
      )}

      {/* HOST LOBBY */}
      {screen === "lobby" && roomCode && isHost && room && (
        <div style={{ padding: "2.5rem 1.5rem" }}>
          <div style={{ background: S.blueLite, border: `1px solid ${S.blueLight2}`, borderRadius: S.radiusMd, padding: "16px 18px", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: S.blue, textTransform: "uppercase", letterSpacing: "0.6px" }}>Room code — share this!</p>
              <p style={{ margin: 0, fontSize: 30, fontWeight: 700, color: S.blue, letterSpacing: "6px" }}>{roomCode}</p>
            </div>
            <button onClick={copyCode} style={{ background: copied ? S.blue : "#fff", color: copied ? "#fff" : S.blue, border: `1.5px solid ${S.blue}`, borderRadius: S.radius, padding: "8px 16px", fontFamily: S.font, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: S.text }}>Players joined ({room.players.length})</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {room.players.map((p, i) => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: S.bgGray, borderRadius: S.radius, border: `1px solid ${S.borderLight}` }}>
                  <Avatar name={p} idx={i} size={30} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: S.text }}>{p}</span>
                  {p === myName && <span style={{ marginLeft: "auto", fontSize: 11, background: S.blueLite, color: S.blue, borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>Host</span>}
                </div>
              ))}
            </div>
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: S.text }}>Pick a mode to start</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PACKS.map(p => (
              <button key={p.id} onClick={() => selectPack(p.id)}
                style={{ background: "#fff", border: `1.5px solid ${S.borderLight}`, borderRadius: S.radiusMd, padding: "14px 16px", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, boxShadow: S.shadowCard, transition: "border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = p.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = S.borderLight}>
                <div style={{ width: 42, height: 42, borderRadius: S.radiusMd, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: S.text }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: S.textSecondary, marginTop: 2 }}>{p.desc}</div>
                </div>
                <div style={{ color: S.border, fontSize: 18 }}>›</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* WAIT */}
      {screen === "wait" && room && (
        <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: S.blueLite, margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>⏳</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: S.text }}>Answer locked in!</h2>
          <p style={{ color: S.textSecondary, fontSize: 15, margin: "0 0 2rem" }}>Waiting for everyone else…</p>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16 }}>
            {room.players.map((p, i) => {
              const answered = room.answers?.[p];
              return (
                <div key={p} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ position: "relative" }}>
                    <Avatar name={p} idx={i} size={44} />
                    <div style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: answered ? "#1B8A5A" : S.border, border: "2px solid #fff" }} />
                  </div>
                  <span style={{ fontSize: 11, color: answered ? "#1B8A5A" : S.textMuted, fontWeight: 500 }}>{p === myName ? "You ✓" : p}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ANSWER */}
      {screen === "answer" && room && pack && (
        <div style={{ padding: "2rem 1.5rem" }}>
          <RoundBar round={room.round} pack={pack} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
            <div style={{ width: 30, height: 30, borderRadius: S.radius, background: pack.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{pack.icon}</div>
            <span style={{ fontSize: 13, color: pack.color, fontWeight: 600 }}>{pack.label}</span>
          </div>
          <PromptCard prompt={currentPrompt} pack={pack} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "1.5rem" }}>
            {options.map(opt => {
              const sel = myAnswer === opt;
              return (
                <button key={opt} onClick={() => setMyAnswer(opt)} style={{ padding: "11px 12px", borderRadius: S.radius, border: `1.5px solid ${sel ? pack.color : S.borderLight}`, background: sel ? pack.bg : "#fff", color: sel ? pack.color : S.text, fontFamily: S.font, fontWeight: sel ? 600 : 400, cursor: "pointer", fontSize: 14, textAlign: "left", transition: "all 0.15s" }}>
                  {opt}
                </button>
              );
            })}
          </div>
          <Btn onClick={submitAnswer} disabled={!myAnswer} full>Lock in answer →</Btn>
        </div>
      )}

      {/* REVEAL */}
      {screen === "reveal" && room && pack && (
        <div style={{ padding: "2rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: S.text }}>The reveal 👀</h2>
            <span style={{ background: pack.bg, color: pack.color, borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 600 }}>Round {room.round}</span>
          </div>
          <div style={{ background: S.bgGray, borderLeft: `4px solid ${pack.color}`, borderRadius: S.radiusMd, padding: "14px 18px", marginBottom: "1.5rem", border: `1px solid ${S.borderLight}` }}>
            <p style={{ fontSize: 12, color: S.textMuted, margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>The prompt</p>
            <p style={{ fontWeight: 500, color: S.text, margin: 0, fontSize: 15 }}>"{currentPrompt}"</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.5rem" }}>
            {room.players.map((p, i) => (
              <div key={p} style={{ background: "#fff", border: `1px solid ${S.borderLight}`, borderRadius: S.radiusMd, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(72,95,125,0.07)" }}>
                <Avatar name={p} idx={i} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: S.textMuted, marginBottom: 2 }}>{p}{p === myName ? " (you)" : ""}</div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: S.text }}>{room.answers?.[p] || "…"}</div>
                </div>
                <button onClick={() => addReaction(p)} style={{ background: (room.reactions?.[p] || 0) > 0 ? "#FFF0F5" : S.bgGray, border: `1px solid ${(room.reactions?.[p] || 0) > 0 ? "#F9C8D9" : S.borderLight}`, borderRadius: 20, padding: "5px 11px", cursor: "pointer", fontSize: 14, color: "#C53030", fontWeight: 600, fontFamily: S.font }}>
                  ❤️ {room.reactions?.[p] || ""}
                </button>
              </div>
            ))}
          </div>
          {isHost
            ? <Btn onClick={nextRound} full>{room.round >= TOTAL_ROUNDS ? "See results 🎉" : "Next round →"}</Btn>
            : <div style={{ textAlign: "center", padding: 12, background: S.bgGray, borderRadius: S.radiusMd, border: `1px solid ${S.borderLight}`, fontSize: 14, color: S.textSecondary }}>Waiting for the host to continue…</div>
          }
        </div>
      )}

      {/* END */}
      {screen === "end" && room && (
        <div style={{ padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: S.radiusLg, background: S.blueLite, margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🎨</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: S.text, margin: "0 0 6px" }}>That's a wrap!</h2>
          <p style={{ color: S.textSecondary, marginBottom: "2rem" }}>Hope you learned something new about your team ✨</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "2rem", textAlign: "left" }}>
            {[...room.players].sort((a, b) => (room.reactions?.[b] || 0) - (room.reactions?.[a] || 0)).map((p, i) => {
              const hearts = room.reactions?.[p] || 0;
              const idx = room.players.indexOf(p);
              return (
                <div key={p} style={{ background: i === 0 ? S.blueLite : "#fff", border: `1px solid ${i === 0 ? S.blueLight2 : S.borderLight}`, borderRadius: S.radiusMd, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: S.bgGray, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: i === 0 ? S.blue : S.textMuted }}>{i + 1}</div>
                  <Avatar name={p} idx={idx} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: S.text }}>{p}</div>
                    <div style={{ fontSize: 12, color: S.textMuted }}>{hearts} ❤️ from the team</div>
                  </div>
                  {i === 0 && <span style={{ background: S.blue, color: "#fff", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>Most loved</span>}
                </div>
              );
            })}
          </div>
          <Btn onClick={reset} full>Play again 🎨</Btn>
        </div>
      )}
    </div>
  );
}
