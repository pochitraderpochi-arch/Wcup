/* eslint-disable */
import { useState, useEffect, useRef } from "react";

// ============================================================
// GLOBAL CSS - defined once at top level
// ============================================================
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700;900&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; }

  @keyframes ballFly {
    0%   { left: 50%; bottom: 35px; transform: translateX(-50%) scale(1); opacity: 1; }
    40%  { bottom: 110px; opacity: 0.95; }
    100% { left: var(--bx); bottom: var(--by); transform: translateX(-50%) scale(0.55); opacity: 0.7; }
  }
  @keyframes goalPop {
    0%   { transform: scale(0.1) rotate(-15deg); opacity: 0; }
    55%  { transform: scale(1.35) rotate(4deg); opacity: 1; }
    80%  { transform: scale(1.08) rotate(-1deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes goalText {
    0%   { transform: scale(0) translateY(40px); opacity: 0; }
    60%  { transform: scale(1.25) translateY(-8px); opacity: 1; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
  @keyframes netShake {
    0%,100% { transform: translateX(0) rotate(0); }
    15%  { transform: translateX(-7px) rotate(-0.8deg); }
    30%  { transform: translateX(7px)  rotate(0.8deg); }
    50%  { transform: translateX(-4px); }
    70%  { transform: translateX(4px); }
    85%  { transform: translateX(-2px); }
  }
  .net-shake { animation: netShake 0.55s ease-in-out; }

  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-9px); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  .shimmer-btn {
    background: linear-gradient(90deg,#FFD700 0%,#FFA500 25%,#FFD700 50%,#FFA500 75%,#FFD700 100%);
    background-size: 200% auto;
    animation: shimmer 2.2s linear infinite;
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .fade-up { animation: fadeUp 0.45s ease-out forwards; }
  @keyframes pulseGlow {
    0%,100% { box-shadow: 0 0 8px rgba(0,200,100,0.3); }
    50%      { box-shadow: 0 0 22px rgba(0,200,100,0.75); }
  }
  .pulse-glow { animation: pulseGlow 2s ease-in-out infinite; }

  .zone-btn { transition: transform 0.12s, filter 0.12s !important; }
  .zone-btn:hover  { transform: translate(-50%,-50%) scale(1.18) !important; filter: brightness(1.35) !important; }
  .zone-btn:active { transform: translate(-50%,-50%) scale(0.92) !important; }

  .team-card { transition: transform 0.18s, box-shadow 0.18s; }
  .team-card:hover { transform: scale(1.06) translateY(-3px); }

  .nav-tab { transition: color 0.18s; }

  @keyframes suddenDeath {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.6; transform:scale(1.08); }
  }
  .sudden-pulse { animation: suddenDeath 1s ease-in-out infinite; }

  @keyframes confetti {
    0%   { transform: translateY(0) rotate(0deg); opacity:1; }
    100% { transform: translateY(80px) rotate(720deg); opacity:0; }
  }
`;

// ============================================================
// 48 TEAMS
// ============================================================
const TEAMS = [
  { id:1,  name:"Brazil",       code:"BRA", flag:"🇧🇷", group:"A", color:"#009C3B", jersey:"#009C3B" },
  { id:2,  name:"Germany",      code:"GER", flag:"🇩🇪", group:"A", color:"#1a1a1a", jersey:"#FFFFFF" },
  { id:3,  name:"Mexico",       code:"MEX", flag:"🇲🇽", group:"A", color:"#006847", jersey:"#006847" },
  { id:4,  name:"Japan",        code:"JPN", flag:"🇯🇵", group:"A", color:"#003087", jersey:"#003087" },
  { id:5,  name:"France",       code:"FRA", flag:"🇫🇷", group:"B", color:"#002395", jersey:"#002395" },
  { id:6,  name:"Argentina",    code:"ARG", flag:"🇦🇷", group:"B", color:"#43A1D5", jersey:"#43A1D5" },
  { id:7,  name:"Portugal",     code:"POR", flag:"🇵🇹", group:"B", color:"#AD2121", jersey:"#AD2121" },
  { id:8,  name:"South Korea",  code:"KOR", flag:"🇰🇷", group:"B", color:"#CD2E3A", jersey:"#CD2E3A" },
  { id:9,  name:"Spain",        code:"ESP", flag:"🇪🇸", group:"C", color:"#AA151B", jersey:"#AA151B" },
  { id:10, name:"England",      code:"ENG", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", group:"C", color:"#003090", jersey:"#FFFFFF" },
  { id:11, name:"Netherlands",  code:"NED", flag:"🇳🇱", group:"C", color:"#C8522A", jersey:"#FF6600" },
  { id:12, name:"Senegal",      code:"SEN", flag:"🇸🇳", group:"C", color:"#00853F", jersey:"#00853F" },
  { id:13, name:"Italy",        code:"ITA", flag:"🇮🇹", group:"D", color:"#0066CC", jersey:"#0066CC" },
  { id:14, name:"Belgium",      code:"BEL", flag:"🇧🇪", group:"D", color:"#ED2939", jersey:"#ED2939" },
  { id:15, name:"Croatia",      code:"CRO", flag:"🇭🇷", group:"D", color:"#CC0000", jersey:"#CC0000" },
  { id:16, name:"Morocco",      code:"MAR", flag:"🇲🇦", group:"D", color:"#C1272D", jersey:"#006233" },
  { id:17, name:"USA",          code:"USA", flag:"🇺🇸", group:"E", color:"#002868", jersey:"#FFFFFF" },
  { id:18, name:"Colombia",     code:"COL", flag:"🇨🇴", group:"E", color:"#B5922A", jersey:"#FCD116" },
  { id:19, name:"Uruguay",      code:"URU", flag:"🇺🇾", group:"E", color:"#5B9BD5", jersey:"#5B9BD5" },
  { id:20, name:"Ghana",        code:"GHA", flag:"🇬🇭", group:"E", color:"#006B3F", jersey:"#FFFFFF" },
  { id:21, name:"Poland",       code:"POL", flag:"🇵🇱", group:"F", color:"#DC143C", jersey:"#FFFFFF" },
  { id:22, name:"Switzerland",  code:"SUI", flag:"🇨🇭", group:"F", color:"#CC0000", jersey:"#CC0000" },
  { id:23, name:"Denmark",      code:"DEN", flag:"🇩🇰", group:"F", color:"#C60C30", jersey:"#C60C30" },
  { id:24, name:"Nigeria",      code:"NGA", flag:"🇳🇬", group:"F", color:"#008751", jersey:"#008751" },
  { id:25, name:"Australia",    code:"AUS", flag:"🇦🇺", group:"G", color:"#00008B", jersey:"#FFD700" },
  { id:26, name:"Canada",       code:"CAN", flag:"🇨🇦", group:"G", color:"#CC0000", jersey:"#CC0000" },
  { id:27, name:"Saudi Arabia", code:"KSA", flag:"🇸🇦", group:"G", color:"#006C35", jersey:"#FFFFFF" },
  { id:28, name:"Ecuador",      code:"ECU", flag:"🇪🇨", group:"G", color:"#A67C00", jersey:"#FFD100" },
  { id:29, name:"Serbia",       code:"SRB", flag:"🇷🇸", group:"H", color:"#0C4076", jersey:"#FFFFFF" },
  { id:30, name:"Cameroon",     code:"CMR", flag:"🇨🇲", group:"H", color:"#007A5E", jersey:"#009A44" },
  { id:31, name:"Qatar",        code:"QAT", flag:"🇶🇦", group:"H", color:"#8D153A", jersey:"#8D153A" },
  { id:32, name:"Wales",        code:"WAL", flag:"🏴󠁧󠁢󠁷󠁬󠁳󠁿", group:"H", color:"#CC0000", jersey:"#FFFFFF" },
  { id:33, name:"Turkey",       code:"TUR", flag:"🇹🇷", group:"I", color:"#E30A17", jersey:"#E30A17" },
  { id:34, name:"Ukraine",      code:"UKR", flag:"🇺🇦", group:"I", color:"#005BBB", jersey:"#FFD500" },
  { id:35, name:"Austria",      code:"AUT", flag:"🇦🇹", group:"I", color:"#ED2939", jersey:"#FFFFFF" },
  { id:36, name:"Algeria",      code:"ALG", flag:"🇩🇿", group:"I", color:"#006233", jersey:"#FFFFFF" },
  { id:37, name:"Chile",        code:"CHI", flag:"🇨🇱", group:"J", color:"#D52B1E", jersey:"#D52B1E" },
  { id:38, name:"Venezuela",    code:"VEN", flag:"🇻🇪", group:"J", color:"#CF142B", jersey:"#FFFFFF" },
  { id:39, name:"Egypt",        code:"EGY", flag:"🇪🇬", group:"J", color:"#CE1126", jersey:"#FFFFFF" },
  { id:40, name:"Ivory Coast",  code:"CIV", flag:"🇨🇮", group:"J", color:"#F77F00", jersey:"#009A44" },
  { id:41, name:"Sweden",       code:"SWE", flag:"🇸🇪", group:"K", color:"#006AA7", jersey:"#FECC02" },
  { id:42, name:"Czechia",      code:"CZE", flag:"🇨🇿", group:"K", color:"#D7141A", jersey:"#D7141A" },
  { id:43, name:"Iran",         code:"IRN", flag:"🇮🇷", group:"K", color:"#239F40", jersey:"#FFFFFF" },
  { id:44, name:"Honduras",     code:"HON", flag:"🇭🇳", group:"K", color:"#0073CF", jersey:"#FFFFFF" },
  { id:45, name:"New Zealand",  code:"NZL", flag:"🇳🇿", group:"L", color:"#1a1a1a", jersey:"#FFFFFF" },
  { id:46, name:"Peru",         code:"PER", flag:"🇵🇪", group:"L", color:"#D91023", jersey:"#FFFFFF" },
  { id:47, name:"Panama",       code:"PAN", flag:"🇵🇦", group:"L", color:"#DA121A", jersey:"#FFFFFF" },
  { id:48, name:"Costa Rica",   code:"CRC", flag:"🇨🇷", group:"L", color:"#002B7F", jersey:"#FFFFFF" },
];

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

// Zone layout: 9 zones in a 3x3 grid
// id: 0=top-left  1=top-mid  2=top-right
//     3=mid-left  4=center   5=mid-right
//     6=bot-left  7=bot-mid  8=bot-right
const ZONES = [
  { id:0, label:"↖", bx:"18%",  by:"78%" },
  { id:1, label:"⬆", bx:"50%",  by:"80%" },
  { id:2, label:"↗", bx:"82%",  by:"78%" },
  { id:3, label:"◀", bx:"18%",  by:"55%" },
  { id:4, label:"●", bx:"50%",  by:"55%" },
  { id:5, label:"▶", bx:"82%",  by:"55%" },
  { id:6, label:"↙", bx:"18%",  by:"32%" },
  { id:7, label:"⬇", bx:"50%",  by:"30%" },
  { id:8, label:"↘", bx:"82%",  by:"32%" },
];

// GK dive transform per zone
function gkDiveTransform(zoneId) {
  // columns: 0=left, 1=center, 2=right
  // rows:    0=top, 1=mid, 2=bot (bot zones = lower half of goal)
  const col = zoneId % 3;   // 0,1,2
  const row = Math.floor(zoneId / 3); // 0=top,1=mid,2=bot
  let tx = 0, ty = 0, rot = 0;
  if (col === 0) { tx = -72; rot = -22; }
  if (col === 2) { tx =  72; rot =  22; }
  if (row === 0) { ty = -30; }   // top zones → jump up
  if (row === 2) { ty =  18; }   // bottom zones → crouch
  return `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
}

// ============================================================
// SVG JERSEY
// ============================================================
function Jersey({ color, number = "10", size = 40 }) {
  const c = color || "#333";
  const textColor = isLight(c) ? "#000" : "#fff";
  return (
    <svg width={size} height={size} viewBox="0 0 40 42" fill="none">
      {/* sleeves */}
      <path d="M4 9 L12 6 L12 19 L4 19 Z" fill={c} stroke="rgba(255,255,255,0.18)" strokeWidth="0.8"/>
      <path d="M36 9 L28 6 L28 19 L36 19 Z" fill={c} stroke="rgba(255,255,255,0.18)" strokeWidth="0.8"/>
      {/* body */}
      <path d="M12 6 L20 9 L28 6 L30 38 L10 38 Z" fill={c} stroke="rgba(255,255,255,0.18)" strokeWidth="0.8"/>
      {/* collar */}
      <path d="M16 6 C16 6 17.5 11 20 11 C22.5 11 24 6 24 6" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2"/>
      {/* number */}
      <text x="20" y="29" textAnchor="middle" fill={textColor} fontSize="10" fontWeight="bold" fontFamily="Arial" opacity="0.9">{number}</text>
    </svg>
  );
}

function isLight(hex) {
  const h = hex.replace("#","");
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return (r*299 + g*587 + b*114) / 1000 > 160;
}

// ============================================================
// GOAL NET SVG
// ============================================================
function GoalNet({ shaking }) {
  return (
    <svg
      className={shaking ? "net-shake" : ""}
      width="280" height="168" viewBox="0 0 280 168"
      style={{ display:"block", position:"absolute", top:0, left:0 }}
    >
      {/* posts */}
      <rect x="8"  y="8"  width="9" height="152" fill="#bbb" rx="2"/>
      <rect x="263" y="8" width="9" height="152" fill="#bbb" rx="2"/>
      <rect x="8"  y="8"  width="264" height="9" fill="#bbb" rx="2"/>
      {/* back of net (shadow) */}
      <rect x="17" y="17" width="246" height="136" fill="rgba(0,0,0,0.18)" rx="2"/>
      {/* vertical net lines */}
      {Array.from({length:14}).map((_,i)=>(
        <line key={i} x1={17+i*18.9} y1={17} x2={17+i*18.9} y2={153} stroke="rgba(255,255,255,0.22)" strokeWidth="1"/>
      ))}
      {/* horizontal net lines */}
      {Array.from({length:9}).map((_,i)=>(
        <line key={i} x1={17} y1={17+i*15.1} x2={263} y2={17+i*15.1} stroke="rgba(255,255,255,0.22)" strokeWidth="1"/>
      ))}
      {/* ground */}
      <line x1="8" y1="160" x2="272" y2="160" stroke="#bbb" strokeWidth="5" strokeLinecap="round"/>
    </svg>
  );
}

// ============================================================
// GOALKEEPER
// ============================================================
// Full goalkeeper person SVG
function GoalkeeperSVG({ color, size = 64, gloveColor = "#FFDD88" }) {
  const c = color || "#FF6B00";
  const textC = isLight(c) ? "#000" : "#fff";
  const skin = "#F5C09A";
  return (
    <svg width={size} height={size * 1.6} viewBox="0 0 64 100" fill="none">
      {/* Head */}
      <circle cx="32" cy="12" r="10" fill={skin} stroke="rgba(0,0,0,0.15)" strokeWidth="0.8"/>
      {/* Hair */}
      <path d="M22 10 Q32 2 42 10 Q40 4 32 3 Q24 4 22 10Z" fill="#4a3000"/>
      {/* Neck */}
      <rect x="29" y="21" width="6" height="5" fill={skin}/>
      {/* Jersey body */}
      <path d="M16 26 L20 23 L29 26 L35 26 L44 23 L48 26 L46 55 L18 55 Z" fill={c} stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"/>
      {/* Jersey number */}
      <text x="32" y="44" textAnchor="middle" fill={textC} fontSize="10" fontWeight="bold" fontFamily="Arial" opacity="0.9">1</text>
      {/* Left sleeve */}
      <path d="M16 26 L20 23 L14 38 L8 36 Z" fill={c} stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"/>
      {/* Right sleeve */}
      <path d="M48 26 L44 23 L50 38 L56 36 Z" fill={c} stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"/>
      {/* Left arm */}
      <path d="M14 38 L8 36 L6 48 L12 50 Z" fill={skin}/>
      {/* Right arm */}
      <path d="M50 38 L56 36 L58 48 L52 50 Z" fill={skin}/>
      {/* Left glove */}
      <ellipse cx="8" cy="52" rx="7" ry="5" fill={gloveColor} stroke="rgba(0,0,0,0.2)" strokeWidth="0.8"/>
      <path d="M3 50 L5 46 M8 48 L8 44 M13 50 L15 46" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Right glove */}
      <ellipse cx="56" cy="52" rx="7" ry="5" fill={gloveColor} stroke="rgba(0,0,0,0.2)" strokeWidth="0.8"/>
      <path d="M51 50 L49 46 M56 48 L56 44 M61 50 L59 46" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Shorts */}
      <path d="M18 55 L22 72 L32 72 L32 55 Z" fill={isLight(c) ? "#333" : "#111"} opacity="0.85"/>
      <path d="M46 55 L42 72 L32 72 L32 55 Z" fill={isLight(c) ? "#333" : "#111"} opacity="0.85"/>
      {/* Left leg */}
      <rect x="20" y="72" width="10" height="18" rx="4" fill={skin}/>
      {/* Right leg */}
      <rect x="34" y="72" width="10" height="18" rx="4" fill={skin}/>
      {/* Left boot */}
      <path d="M19 88 L31 88 L33 96 L17 96 Z" fill="#222" rx="2"/>
      {/* Right boot */}
      <path d="M33 88 L45 88 L47 96 L31 96 Z" fill="#222" rx="2"/>
    </svg>
  );
}

function Goalkeeper({ diveZone, team, isPlayer }) {
  const c = team ? team.jersey : "#FF6B00";
  const diveStyle = diveZone !== null
    ? { transform: gkDiveTransform(diveZone), transition: "transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)" }
    : { transform: "translate(0,0) rotate(0deg)", transition: "transform 0.32s ease" };
  return (
    <div style={{
      position:"absolute", bottom:"8px", left:"50%",
      transform:"translateX(-50%)", zIndex:8,
    }}>
      <div style={diveStyle}>
        <GoalkeeperSVG color={c} size={38}/>
      </div>
    </div>
  );
}

// ============================================================
// FLYING BALL
// ============================================================
function FlyingBall({ zone, active }) {
  if (!active || zone === null) return null;
  const z = ZONES[zone];
  return (
    <div style={{
      position:"absolute",
      left:"50%", bottom:"35px",
      width:"22px", height:"22px",
      borderRadius:"50%",
      background:"radial-gradient(circle at 35% 30%, #fff 0%, #ccc 55%, #888 100%)",
      boxShadow:"0 3px 10px rgba(0,0,0,0.55)",
      pointerEvents:"none",
      zIndex:20,
      animation:"ballFly 0.42s cubic-bezier(0.22,0.61,0.36,1) forwards",
      "--bx": z.bx,
      "--by": z.by,
    }}/>
  );
}

// ============================================================
// EFFECTS
// ============================================================
function GoalFX({ show }) {
  if (!show) return null;
  return (
    <div style={{
      position:"absolute", inset:0, zIndex:100, pointerEvents:"none",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
    }}>
      <div style={{ fontSize:"68px", animation:"goalPop 0.75s ease-out forwards",
        textShadow:"0 0 28px #FF6600, 0 0 56px #FF2200", lineHeight:1 }}>⚽🔥</div>
      <div style={{
        fontSize:"46px", fontWeight:"900", fontFamily:"'Bebas Neue','Impact',sans-serif",
        color:"#FFD700", textShadow:"0 0 18px #FF6600", letterSpacing:"5px",
        animation:"goalText 0.75s ease-out forwards", marginTop:"6px",
      }}>GOOOAL!</div>
    </div>
  );
}

function SaveFX({ show }) {
  if (!show) return null;
  return (
    <div style={{
      position:"absolute", inset:0, zIndex:100, pointerEvents:"none",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <div style={{
        fontSize:"44px", fontWeight:"900", fontFamily:"'Bebas Neue','Impact',sans-serif",
        color:"#00FF88", textShadow:"0 0 18px #00FF88",
        animation:"goalText 0.75s ease-out forwards", letterSpacing:"3px",
      }}>SAVED! 🧤</div>
    </div>
  );
}

// ============================================================
// PENALTY DOTS ROW
// ============================================================
function PenDots({ results, max=5 }) {
  return (
    <div style={{ display:"flex", gap:"5px" }}>
      {Array.from({length:max}).map((_,i)=>(
        <div key={i} style={{
          width:"16px", height:"16px", borderRadius:"50%",
          background: i < results.length
            ? (results[i] ? "#00FF88" : "#FF4444")
            : "rgba(255,255,255,0.18)",
          border:"2px solid rgba(255,255,255,0.35)",
          transition:"background 0.3s",
        }}/>
      ))}
    </div>
  );
}

// ============================================================
// MATCH SCREEN  (fixed AI animation + sudden death)
// ============================================================
function MatchScreen({ playerTeam, aiTeam, onBack, onRematch, onGoTournament, pvpMode=false, onPVPWin }) {
  const [penalties, setPenalties]         = useState({ p:[], ai:[] });
  const [phase, setPhase]                 = useState("player_kick"); // player_kick | ai_kick | sudden_death | result
  const [round, setRound]                 = useState(0);   // 0-4 for normal, increments in SD
  const [sdRound, setSdRound]             = useState(0);
  const [animating, setAnimating]         = useState(false);
  const [playerZone, setPlayerZone]       = useState(null);
  const [aiShotZone, setAiShotZone]       = useState(null);
  const [gkDiveZone, setGkDiveZone]       = useState(null);  // defender's gk dive
  const [aiGkDiveZone, setAiGkDiveZone]   = useState(null);  // AI gk dive (during player kick)
  const [ballZone, setBallZone]           = useState(null);
  const [ballActive, setBallActive]       = useState(false);
  const [showGoal, setShowGoal]           = useState(false);
  const [showSave, setShowSave]           = useState(false);
  const [netShake, setNetShake]           = useState(false);
  const [winner, setWinner]               = useState(null);  // "player"|"ai"
  const [statusMsg, setStatusMsg]         = useState("Choose your shot zone!");
  const [isSuddenDeath, setIsSuddenDeath] = useState(false);
  const tRef = useRef([]);

  const clr = (fn, ms) => { const t = setTimeout(fn, ms); tRef.current.push(t); return t; };
  useEffect(() => () => tRef.current.forEach(clearTimeout), []);

  const pScore  = penalties.p.filter(Boolean).length;
  const aiScore = penalties.ai.filter(Boolean).length;
  const shotsCompleted = Math.min(penalties.p.length, penalties.ai.length);

  // ---------- early finish check ----------
  function checkEarlyFinish(pArr, aArr, roundIdx) {
    const ps = pArr.filter(Boolean).length;
    const as = aArr.filter(Boolean).length;
    const rem = 5 - roundIdx;
    if (roundIdx >= 5) {
      if (ps > as) return "player";
      if (as > ps) return "ai";
      return "draw";
    }
    if (ps > as + rem) return "player";
    if (as > ps + rem) return "ai";
    return null;
  }

  // ---------- animate a kick ----------
  // dir: "player" or "ai"
  // shotZoneId: where the ball goes
  // gkZoneId: where keeper dives
  // onDone(scored)
  function animateKick(dir, shotZoneId, gkZoneId, onDone) {
    setAnimating(true);
    if (dir === "player") {
      setPlayerZone(shotZoneId);
      setAiGkDiveZone(gkZoneId);
    } else {
      setAiShotZone(shotZoneId);
      setGkDiveZone(gkZoneId);
    }
    setBallZone(shotZoneId);
    setBallActive(true);

    clr(() => {
      const scored = shotZoneId !== gkZoneId;
      setShowGoal(scored);
      setShowSave(!scored);
      if (scored) setNetShake(true);

      clr(() => {
        setShowGoal(false); setShowSave(false); setNetShake(false);
        setBallActive(false); setBallZone(null);
        if (dir === "player") { setPlayerZone(null); setAiGkDiveZone(null); }
        else { setAiShotZone(null); setGkDiveZone(null); }
        setAnimating(false);
        onDone(scored);
      }, 950);
    }, 440);
  }

  // ---------- player kicks ----------
  function handlePlayerKick(zoneId) {
    if (animating || (phase !== "player_kick" && phase !== "sudden_death")) return;
    const gkZone = Math.floor(Math.random() * 9);
    setStatusMsg("...");
    animateKick("player", zoneId, gkZone, (scored) => {
      const newP = [...penalties.p, scored];
      setPenalties(prev => ({ ...prev, p: newP }));
      setStatusMsg(scored ? "⚽ GOAL!" : "Saved!");
      clr(() => doAIKick(newP, penalties.ai), 600);
    });
  }

  // ---------- AI kicks ----------
  function doAIKick(pArr, aArr) {
    const aiZone  = Math.floor(Math.random() * 9);
    const gkZone  = Math.floor(Math.random() * 9); // player GK dives randomly
    setStatusMsg("Opponent shooting...");
    animateKick("ai", aiZone, gkZone, (scored) => {
      const newAI = [...aArr, scored];
      setPenalties({ p: pArr, ai: newAI });
      const nextRound = Math.min(pArr.length, newAI.length);

      if (isSuddenDeath) {
        // In SD: if both scored → next round; if p scored and ai missed → player wins; etc.
        if (pArr[pArr.length-1] && !scored) { endMatch("player"); return; }
        if (!pArr[pArr.length-1] && scored)  { endMatch("ai");     return; }
        if (!pArr[pArr.length-1] && !scored) {
          setSdRound(r => r+1);
          setStatusMsg("Still tied — sudden death continues!");
          clr(() => setPhase("sudden_death"), 400);
          return;
        }
        // both scored → next sd round
        setSdRound(r => r+1);
        setStatusMsg("Both scored — next round!");
        clr(() => setPhase("sudden_death"), 400);
        return;
      }

      const res = checkEarlyFinish(pArr, newAI, nextRound);
      if (res === "player") { endMatch("player"); return; }
      if (res === "ai")     { endMatch("ai");     return; }
      if (res === "draw")   {
        setIsSuddenDeath(true);
        setStatusMsg("🔥 SUDDEN DEATH!");
        clr(() => setPhase("sudden_death"), 600);
        return;
      }
      setRound(nextRound);
      setStatusMsg("Choose your shot zone!");
      clr(() => setPhase("player_kick"), 300);
    });
  }

  function endMatch(w) {
    setWinner(w);
    setPhase("result");
    setStatusMsg(w === "player" ? "🏆 YOU WIN!" : "💀 YOU LOSE");
    if (pvpMode && w === "player" && onPVPWin) onPVPWin();
  }

  function resetMatch() {
    setPenalties({p:[],ai:[]});
    setPhase("player_kick");
    setRound(0); setSdRound(0);
    setAnimating(false);
    setPlayerZone(null); setAiShotZone(null);
    setGkDiveZone(null); setAiGkDiveZone(null);
    setBallZone(null); setBallActive(false);
    setShowGoal(false); setShowSave(false); setNetShake(false);
    setWinner(null); setStatusMsg("Choose your shot zone!");
    setIsSuddenDeath(false);
  }

  const isPlayerKicking = phase === "player_kick" || phase === "sudden_death";

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(180deg,#07101d 0%,#0a1c0a 65%,#122210 100%)",
      fontFamily:"'Barlow','Trebuchet MS',sans-serif",
      color:"#fff",
      display:"flex", flexDirection:"column", alignItems:"center",
    }}>
      {/* Header */}
      <div style={{
        width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"10px 16px",
        background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)",
        borderBottom:"1px solid rgba(255,215,0,0.2)",
      }}>
        <button onClick={onBack} style={{ background:"none",border:"none",color:"#FFD700",fontSize:"22px",cursor:"pointer" }}>←</button>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:"11px", color:"#888", letterSpacing:"2px" }}>
            {pvpMode ? "💰 PVP MATCH" : "PENALTY SHOOTOUT"}
            {isSuddenDeath && <span className="sudden-pulse" style={{ color:"#FF4444", marginLeft:"8px" }}>• SUDDEN DEATH</span>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"14px", justifyContent:"center", marginTop:"2px" }}>
            <span style={{ fontSize:"22px" }}>{playerTeam?.flag}</span>
            <span style={{ fontSize:"26px", fontWeight:"900", color:"#FFD700", fontFamily:"'Bebas Neue','Impact',sans-serif" }}>
              {pScore} – {aiScore}
            </span>
            <span style={{ fontSize:"22px" }}>{aiTeam?.flag}</span>
          </div>
        </div>
        <div style={{ width:"32px" }}/>
      </div>

      {/* Penalty dots */}
      <div style={{ display:"flex", gap:"18px", padding:"8px 16px", alignItems:"center" }}>
        <PenDots results={penalties.p} max={isSuddenDeath ? penalties.p.length+1 : 5}/>
        <span style={{ fontSize:"18px" }}>⚽</span>
        <PenDots results={penalties.ai} max={isSuddenDeath ? penalties.ai.length+1 : 5}/>
      </div>

      {/* Goal scene */}
      <div style={{
        position:"relative",
        width:"280px", height:"200px",
        margin:"4px auto 8px",
        flexShrink:0,
      }}>
        {/* Sky / stands */}
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(to bottom,#0e1e2c 0%,#162c1a 55%,#1e3c14 100%)",
          borderRadius:"10px",
          overflow:"hidden",
        }}>
          {/* crowd dots */}
          <div style={{ padding:"6px 10px", fontSize:"7px", opacity:0.3, lineHeight:1.4 }}>
            {"👥".repeat(20)}
          </div>
          {/* pitch */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0, height:"55px",
            background:"linear-gradient(to bottom,#2d7a2d,#1a4d1a)",
          }}/>
          {/* penalty spot */}
          <div style={{
            position:"absolute", bottom:"46px", left:"50%",
            transform:"translateX(-50%)",
            width:"5px", height:"5px", borderRadius:"50%",
            background:"rgba(255,255,255,0.5)",
          }}/>
          {/* penalty area lines */}
          <div style={{
            position:"absolute", bottom:"50px", left:"50%",
            transform:"translateX(-50%)",
            width:"90px", height:"36px",
            border:"1px solid rgba(255,255,255,0.25)",
            borderBottom:"none",
          }}/>
        </div>

        {/* Net */}
        <GoalNet shaking={netShake}/>

        {/* Goalkeeper */}
        {isPlayerKicking ? (
          // AI is the goalkeeper
          <Goalkeeper diveZone={aiGkDiveZone} team={aiTeam} isPlayer={false}/>
        ) : (
          // Player is the goalkeeper (during AI kick)
          <Goalkeeper diveZone={gkDiveZone} team={playerTeam} isPlayer={true}/>
        )}

        {/* Ball */}
        <FlyingBall zone={ballZone} active={ballActive}/>

        {/* Effects */}
        <GoalFX show={showGoal}/>
        <SaveFX show={showSave}/>
      </div>

      {/* Status */}
      <div style={{
        fontSize:"15px", fontWeight:"700",
        color: phase === "result"
          ? (winner === "player" ? "#FFD700" : "#FF4444")
          : isSuddenDeath ? "#FF6600" : "#00FF88",
        letterSpacing:"1px", textAlign:"center",
        minHeight:"22px", marginBottom:"8px",
        textShadow:"0 0 10px currentColor",
        fontFamily:"'Bebas Neue','Impact',sans-serif",
        fontSize:"18px",
      }}>{statusMsg}</div>

      {/* Shot zones */}
      {phase !== "result" && (
        <div style={{ width:"100%", maxWidth:"300px", padding:"0 12px" }}>
          <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textAlign:"center", marginBottom:"6px" }}>
            {isPlayerKicking ? "YOUR SHOT" : "YOUR KEEPER"}
          </div>
          <div style={{
            position:"relative",
            width:"100%", paddingBottom:"52%",
            background:"rgba(255,255,255,0.03)",
            borderRadius:"10px",
            border:"1px solid rgba(255,255,255,0.1)",
          }}>
            <div style={{ position:"absolute", inset:0 }}>
              {ZONES.map(z => {
                const col = z.id % 3;
                const row = Math.floor(z.id / 3);
                const left = `${16 + col * 34}%`;
                const top  = `${18 + row * 30}%`;
                const isActive = isPlayerKicking && !animating;
                return (
                  <button
                    key={z.id}
                    className="zone-btn"
                    disabled={!isActive}
                    onClick={() => handlePlayerKick(z.id)}
                    style={{
                      position:"absolute",
                      left, top,
                      transform:"translate(-50%,-50%)",
                      width:"34px", height:"34px",
                      borderRadius:"50%",
                      background: isActive
                        ? "linear-gradient(135deg,#003a00,#006600)"
                        : "rgba(255,80,0,0.12)",
                      border: `2px solid ${isActive ? "#00FF88" : "rgba(255,100,0,0.4)"}`,
                      color: isActive ? "#00FF88" : "rgba(255,100,0,0.5)",
                      fontSize:"13px",
                      cursor: isActive ? "pointer" : "default",
                      opacity: animating && !isActive ? 0.4 : 1,
                      boxShadow: isActive ? "0 0 8px rgba(0,255,136,0.3)" : "none",
                      lineHeight:1,
                    }}
                  >{z.label}</button>
                );
              })}
            </div>
          </div>
          {isPlayerKicking && !animating && (
            <div style={{ textAlign:"center", fontSize:"11px", color:"#555", marginTop:"6px" }}>
              Tap a zone to shoot · GK dives randomly
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {phase === "result" && (
        <div style={{ textAlign:"center", padding:"16px 20px", animation:"fadeUp 0.5s ease-out" }}>
          <div style={{ fontSize:"60px", marginBottom:"12px" }}>
            {winner === "player" ? "🏆" : "😢"}
          </div>
          <div style={{
            fontSize:"22px", fontWeight:"900",
            fontFamily:"'Bebas Neue','Impact',sans-serif",
            color: winner === "player" ? "#FFD700" : "#FF4444",
            textShadow:`0 0 16px ${winner === "player" ? "#FFD700" : "#FF4444"}`,
            letterSpacing:"2px", marginBottom:"4px",
          }}>
            {winner === "player"
              ? `${playerTeam?.flag} ${playerTeam?.name} WINS!`
              : `${aiTeam?.flag} ${aiTeam?.name} WINS!`}
          </div>
          <div style={{ fontSize:"18px", color:"#aaa", marginBottom:"20px" }}>
            {pScore} – {aiScore} {isSuddenDeath ? "(SD)" : ""}
          </div>
          <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
            <button onClick={resetMatch} style={{
              padding:"11px 22px",
              background:"linear-gradient(135deg,#003a00,#00AA44)",
              border:"2px solid #00FF88", borderRadius:"10px",
              color:"#00FF88", fontSize:"15px", fontWeight:"700", cursor:"pointer",
            }}>🔄 Rematch</button>
            {onGoTournament && (
              <button onClick={onGoTournament} style={{
                padding:"11px 22px",
                background:"rgba(255,215,0,0.08)",
                border:"2px solid #FFD700", borderRadius:"10px",
                color:"#FFD700", fontSize:"15px", fontWeight:"700", cursor:"pointer",
              }}>🏆 Bracket</button>
            )}
            <button onClick={onBack} style={{
              padding:"11px 22px",
              background:"rgba(255,255,255,0.06)",
              border:"2px solid #555", borderRadius:"10px",
              color:"#aaa", fontSize:"15px", fontWeight:"700", cursor:"pointer",
            }}>🏠 Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TEAM SELECT
// ============================================================
function TeamSelect({ onSelect, onBack }) {
  const [activeGroup, setActiveGroup] = useState("A");
  const [search, setSearch] = useState("");
  const filtered = search
    ? TEAMS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase()))
    : TEAMS.filter(t => t.group === activeGroup);

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#060d18 0%,#0a1a0a 100%)", fontFamily:"'Barlow','Trebuchet MS',sans-serif", color:"#fff" }}>
      <div style={{
        background:"rgba(0,0,0,0.65)", backdropFilter:"blur(10px)",
        padding:"14px 18px", display:"flex", alignItems:"center", gap:"12px",
        borderBottom:"1px solid rgba(255,215,0,0.25)",
        position:"sticky", top:0, zIndex:50,
      }}>
        <button onClick={onBack} style={{ background:"none",border:"none",color:"#FFD700",fontSize:"22px",cursor:"pointer" }}>←</button>
        <div>
          <div style={{ fontSize:"17px", fontWeight:"700", color:"#FFD700", fontFamily:"'Bebas Neue','Impact',sans-serif", letterSpacing:"1px" }}>SELECT YOUR TEAM</div>
          <div style={{ fontSize:"11px", color:"#888", letterSpacing:"2px" }}>48 NATIONS • WORLD CUP 2026</div>
        </div>
      </div>

      <div style={{ padding:"10px 14px" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍 Search team..."
          style={{ width:"100%", padding:"9px 13px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:"8px", color:"#fff", fontSize:"14px", outline:"none", boxSizing:"border-box" }}
        />
      </div>

      {!search && (
        <div style={{ display:"flex", overflowX:"auto", padding:"0 14px 8px", gap:"6px" }}>
          {GROUPS.map(g => (
            <button key={g} onClick={() => setActiveGroup(g)} style={{
              padding:"5px 13px",
              background: activeGroup===g ? "#FFD700" : "rgba(255,255,255,0.07)",
              border:"1px solid "+(activeGroup===g?"#FFD700":"rgba(255,255,255,0.18)"),
              borderRadius:"20px", color:activeGroup===g?"#000":"#fff",
              fontWeight:"700", fontSize:"12px", cursor:"pointer", flexShrink:0, transition:"all 0.18s",
            }}>Group {g}</button>
          ))}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:"10px", padding:"10px 14px 40px" }}>
        {filtered.map(team => (
          <button key={team.id} className="team-card" onClick={() => onSelect(team)} style={{
            background:`linear-gradient(135deg,${team.color}20,rgba(0,0,0,0.82))`,
            border:`2px solid ${team.color}55`,
            borderRadius:"12px", padding:"14px 10px",
            color:"#fff", cursor:"pointer", textAlign:"center",
            boxShadow:`0 2px 12px ${team.color}18`,
          }}>
            <div style={{ fontSize:"34px", marginBottom:"7px" }}>{team.flag}</div>
            <Jersey color={team.jersey} number="10" size={34}/>
            <div style={{ fontSize:"13px", fontWeight:"700", marginTop:"7px" }}>{team.name}</div>
            <div style={{ fontSize:"10px", color:"#aaa", letterSpacing:"2px" }}>{team.code}</div>
            <div style={{ marginTop:"5px", fontSize:"10px", background:`${team.color}33`, borderRadius:"4px", padding:"2px 5px", color:"#FFD700" }}>
              Group {team.group}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// BRACKET VIEW  (Groups + R32 + R16 + QF + SF + Final)
// ============================================================
function BracketView({ standings, bracket, onSimulate, onStartMatch, selectedTeam }) {
  const [view, setView] = useState("groups");
  const hasData = Object.keys(standings).length > 0;

  return (
    <div style={{ padding:"14px" }}>
      {/* sub-tabs */}
      <div style={{ display:"flex", gap:"5px", overflowX:"auto", marginBottom:"14px" }}>
        {["groups","R32","R16","QF","SF","Final"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding:"5px 12px", flexShrink:0,
            background: view===v ? "#FFD700" : "rgba(255,255,255,0.07)",
            border:"1px solid "+(view===v?"#FFD700":"rgba(255,255,255,0.18)"),
            borderRadius:"20px", color:view===v?"#000":"#fff",
            fontWeight:"700", fontSize:"12px", cursor:"pointer", transition:"all 0.18s",
          }}>{v}</button>
        ))}
      </div>

      {!hasData ? (
        <div style={{ textAlign:"center", padding:"40px 20px" }}>
          <div style={{ fontSize:"48px", marginBottom:"14px" }}>📊</div>
          <div style={{ fontSize:"15px", color:"#aaa", marginBottom:"22px" }}>Simulate the group stage to build the bracket</div>
          <button onClick={onSimulate} style={{
            padding:"14px 28px",
            background:"linear-gradient(135deg,#FFD700,#FFA500)",
            border:"none", borderRadius:"10px",
            fontSize:"16px", fontWeight:"700", color:"#000", cursor:"pointer",
          }}>🎲 SIMULATE GROUPS</button>
        </div>
      ) : view === "groups" ? (
        <div>
          <button onClick={onSimulate} style={{
            width:"100%", padding:"9px",
            background:"rgba(255,215,0,0.08)", border:"1px solid rgba(255,215,0,0.3)",
            borderRadius:"8px", color:"#FFD700", fontSize:"13px", cursor:"pointer", marginBottom:"10px",
          }}>🔄 Re-simulate groups</button>
          {GROUPS.map(g => (
            <div key={g} style={{
              background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.09)",
              borderRadius:"10px", marginBottom:"9px", overflow:"hidden",
            }}>
              <div style={{ background:"rgba(255,215,0,0.09)", padding:"7px 12px", fontSize:"12px", fontWeight:"700", color:"#FFD700", letterSpacing:"2px" }}>
                GROUP {g}
              </div>
              {(standings[g]||[]).map((team,idx) => (
                <div key={team.id} style={{
                  display:"flex", alignItems:"center", padding:"8px 12px",
                  background: idx<2 ? "rgba(0,255,136,0.04)" : "transparent",
                  borderTop:"1px solid rgba(255,255,255,0.05)",
                }}>
                  <span style={{ width:"18px", fontSize:"12px", fontWeight:"700", color:idx<2?"#00FF88":"#666" }}>{idx+1}</span>
                  <span style={{ fontSize:"18px", marginRight:"8px" }}>{team.flag}</span>
                  <span style={{ flex:1, fontSize:"13px", fontWeight:"600" }}>{team.name}</span>
                  <span style={{ fontSize:"11px", color:"#888" }}>{team.w}W {team.d}D {team.l}L</span>
                  <span style={{ marginLeft:"10px", fontWeight:"900", fontSize:"15px", color:"#FFD700", minWidth:"22px", textAlign:"right" }}>{team.pts}</span>
                  {idx<2 && <span style={{ marginLeft:"5px", fontSize:"10px", color:"#00FF88" }}>✓</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <BracketRound
          round={view}
          bracket={bracket}
          selectedTeam={selectedTeam}
          onStartMatch={onStartMatch}
        />
      )}
    </div>
  );
}

function BracketRound({ round, bracket, selectedTeam, onStartMatch }) {
  if (!bracket) return <div style={{ textAlign:"center", padding:"30px", color:"#666" }}>Simulate groups first</div>;

  const roundMap = { R32:"r32", R16:"r16", QF:"qf", SF:"sf", Final:"final" };
  const key = roundMap[round];
  const matches = key === "final"
    ? (bracket.final ? [bracket.final] : [])
    : (bracket[key] || []);

  if (matches.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:"30px", color:"#666" }}>
        <div style={{ fontSize:"32px", marginBottom:"10px" }}>🔒</div>
        <div>Play through previous rounds to unlock {round}</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize:"11px", color:"#888", letterSpacing:"2px", marginBottom:"10px" }}>
        {round} • {matches.length} MATCH{matches.length>1?"ES":""}
      </div>
      {matches.map((match, i) => (
        <div key={i} style={{
          background:"rgba(255,255,255,0.04)",
          border:`1px solid ${match.winner ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.1)"}`,
          borderRadius:"10px", marginBottom:"8px", overflow:"hidden",
        }}>
          <div style={{ display:"flex", alignItems:"stretch" }}>
            {[match.team1, match.team2].map((team, ti) => (
              <button key={ti} onClick={() => selectedTeam && onStartMatch(selectedTeam, team)} style={{
                flex:1, padding:"10px 10px", background:"none", border:"none",
                display:"flex", alignItems:"center", justifyContent: ti===0?"flex-start":"flex-end",
                gap:"8px", cursor: selectedTeam?"pointer":"default", color:"#fff",
                background: match.winner && match.winner.id===team?.id ? "rgba(0,255,136,0.07)" : "transparent",
              }}>
                {ti===1 && <span style={{ fontSize:"12px", fontWeight:"700", color:match.winner?.id===team?.id?"#00FF88":"#fff" }}>{team?.code}</span>}
                <span style={{ fontSize:"22px" }}>{team?.flag}</span>
                {ti===0 && <span style={{ fontSize:"12px", fontWeight:"700", color:match.winner?.id===team?.id?"#00FF88":"#fff" }}>{team?.code}</span>}
              </button>
            ))}
            <div style={{ padding:"10px 8px", fontSize:"11px", fontWeight:"700", color:"#555", alignSelf:"center", flexShrink:0 }}>VS</div>
          </div>
          {match.winner && (
            <div style={{ padding:"4px 12px 6px", fontSize:"11px", color:"#00FF88", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
              ✓ {match.winner.flag} {match.winner.name} advances
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// WALLET CONFIG - 4 Solana wallets
// ============================================================
const WALLETS = [
  {
    id: "phantom",
    name: "Phantom",
    icon: "👻",
    color: "#AB9FF2",
    getProvider: () => {
      if (window.phantom?.solana?.isPhantom) return window.phantom.solana;
      if (window.solana?.isPhantom) return window.solana;
      return null;
    },
    installUrl: "https://phantom.app",
  },
  {
    id: "backpack",
    name: "Backpack",
    icon: "🎒",
    color: "#E33E3F",
    getProvider: () => window.backpack?.solana || window.xnft?.solana || null,
    installUrl: "https://backpack.app",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🔵",
    color: "#0052FF",
    getProvider: () => window.coinbaseSolana || window.coinbaseWalletExtension?.solana || null,
    installUrl: "https://www.coinbase.com/wallet",
  },
  {
    id: "metamask",
    name: "MetaMask (Snaps)",
    icon: "🦊",
    color: "#F6851B",
    getProvider: () => window.ethereum?.isSolana ? window.ethereum : null,
    installUrl: "https://metamask.io",
  },
];

// ============================================================
// MULTI-WALLET HOOK
// ============================================================
function useSolanaWallet() {
  const [wallet, setWallet]         = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connectingId, setConnectingId] = useState(null);
  const [error, setError]           = useState(null);
  const [currency, setCurrency]     = useState("SOL");
  const [showModal, setShowModal]   = useState(false);

  async function fetchBalance(pubkey) {
    try {
      const res = await fetch("https://api.mainnet-beta.solana.com", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ jsonrpc:"2.0", id:1, method:"getBalance", params:[pubkey] })
      });
      const data = await res.json();
      return (data.result?.value || 0) / 1e9;
    } catch(e) { return 0; }
  }

  async function connectWallet(walletConfig) {
    const provider = walletConfig.getProvider();
    if (!provider) {
      // Open install page
      window.open(walletConfig.installUrl, "_blank");
      setError({ type:"not_installed", wallet: walletConfig.name, url: walletConfig.installUrl });
      return;
    }
    try {
      setConnecting(true);
      setConnectingId(walletConfig.id);
      setError(null);
      const resp = await provider.connect();
      const pubkey = resp.publicKey.toString();
      const solBal = await fetchBalance(pubkey);
      setWallet({
        publicKey: pubkey,
        solBalance: solBal,
        usdcBalance: 0,
        walletName: walletConfig.name,
        walletIcon: walletConfig.icon,
        walletColor: walletConfig.color,
      });
      setShowModal(false);
      provider.on?.("disconnect", () => setWallet(null));
    } catch(e) {
      setError({ type:"user_rejected", wallet: walletConfig.name });
    } finally {
      setConnecting(false);
      setConnectingId(null);
    }
  }

  async function disconnect() {
    // Try to disconnect from all providers
    WALLETS.forEach(w => {
      try { w.getProvider()?.disconnect?.(); } catch(e) {}
    });
    setWallet(null);
  }

  // Auto-reconnect
  useEffect(() => {
    for (const w of WALLETS) {
      const provider = w.getProvider();
      if (provider?.isConnected) {
        connectWallet(w);
        break;
      }
    }
  }, []);

  return {
    wallet, connecting, connectingId, error, currency, setCurrency,
    showModal, setShowModal,
    connectWallet, disconnect,
  };
}

// ============================================================
// WALLET MODAL COMPONENT
// ============================================================
function WalletModal({ show, onClose, onConnect, connecting, connectingId, error }) {
  if (!show) return null;
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:999,
      background:"rgba(0,0,0,0.85)", backdropFilter:"blur(6px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"20px",
    }} onClick={onClose}>
      <div style={{
        background:"linear-gradient(135deg,#12002a,#1a0040)",
        border:"1px solid rgba(153,0,255,0.4)",
        borderRadius:"16px", padding:"20px",
        width:"100%", maxWidth:"320px",
        boxShadow:"0 20px 60px rgba(0,0,0,0.8)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
          <div style={{ fontSize:"16px", fontWeight:"700", color:"#fff" }}>Connect Wallet</div>
          <button onClick={onClose} style={{
            background:"none", border:"none", color:"#888",
            fontSize:"20px", cursor:"pointer", lineHeight:1,
          }}>✕</button>
        </div>

        <div style={{ fontSize:"11px", color:"#666", letterSpacing:"1px", marginBottom:"12px" }}>
          SOLANA NETWORK
        </div>

        {WALLETS.map(w => {
          const isConnecting = connecting && connectingId === w.id;
          const installed = !!w.getProvider();
          return (
            <button key={w.id} onClick={() => onConnect(w)} style={{
              width:"100%", padding:"12px 14px",
              background: isConnecting ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
              border:`1px solid ${installed ? w.color+"44" : "rgba(255,255,255,0.1)"}`,
              borderRadius:"10px", marginBottom:"8px",
              display:"flex", alignItems:"center", gap:"12px",
              cursor:"pointer", color:"#fff",
              transition:"all 0.18s",
            }}>
              <span style={{ fontSize:"24px" }}>{w.icon}</span>
              <div style={{ flex:1, textAlign:"left" }}>
                <div style={{ fontSize:"14px", fontWeight:"700", color: installed ? "#fff" : "#888" }}>
                  {w.name}
                </div>
                <div style={{ fontSize:"10px", color: installed ? w.color : "#555" }}>
                  {isConnecting ? "Connecting..." : installed ? "Detected ✓" : "Not installed"}
                </div>
              </div>
              {isConnecting && <span style={{ fontSize:"16px", animation:"float 1s ease-in-out infinite" }}>⏳</span>}
              {!installed && <span style={{ fontSize:"11px", color:"#9900FF" }}>Install →</span>}
            </button>
          );
        })}

        {error?.type === "user_rejected" && (
          <div style={{
            background:"rgba(255,0,0,0.1)", border:"1px solid rgba(255,0,0,0.2)",
            borderRadius:"8px", padding:"8px 12px", marginTop:"8px",
            fontSize:"12px", color:"#FF6666",
          }}>
            ❌ {error.wallet} bağlantısı reddedildi.
          </div>
        )}

        <div style={{ marginTop:"14px", fontSize:"11px", color:"#555", textAlign:"center" }}>
          Cüzdanın yoksa{" "}
          <a href="https://phantom.app" target="_blank" style={{ color:"#AB9FF2" }}>Phantom</a>
          {" "}ile başla
        </div>
      </div>
    </div>
  );
}


// ============================================================
// WEBSOCKET PVP HOOK
// ============================================================
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "wss://wcpenalty-backend.up.railway.app";

function usePVPSocket({ onMatchStart, onShotResult, onMatchOver, onOpponentJoined, onPaymentConfirmed }) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [roomStatus, setRoomStatus] = useState("idle"); // idle|waiting|payment_pending|playing|finished

  function connect() {
    if (wsRef.current?.readyState === 1) return;
    const ws = new WebSocket(BACKEND_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log("[PVP] Connected to backend");
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      switch(data.type) {
        case "room_created":
          setRoomId(data.roomId);
          setPlayerId("p1");
          setRoomStatus("waiting");
          break;
        case "room_joined":
          setRoomId(data.roomId);
          setPlayerId("p2");
          setRoomStatus("payment_pending");
          onOpponentJoined?.(data.opponent);
          break;
        case "player_joined":
          setRoomStatus("payment_pending");
          onOpponentJoined?.(data.opponent);
          break;
        case "payment_confirmed":
          onPaymentConfirmed?.();
          break;
        case "match_start":
          setRoomStatus("playing");
          onMatchStart?.(data);
          break;
        case "shot_result":
          onShotResult?.(data);
          break;
        case "match_over":
          setRoomStatus("finished");
          onMatchOver?.(data);
          break;
        case "opponent_disconnected":
          setRoomStatus("finished");
          onMatchOver?.({ ...data, disconnected: true });
          break;
        case "error":
          console.error("[PVP] Error:", data.msg);
          break;
      }
    };

    ws.onclose = () => { setConnected(false); console.log("[PVP] Disconnected"); };
    ws.onerror = (e) => console.error("[PVP] WS error:", e);
  }

  function send(data) {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify(data));
    }
  }

  function createRoom(publicKey, team, currency) {
    connect();
    setTimeout(() => send({ type:"create_room", publicKey, team, currency }), 500);
  }

  function joinRoom(roomId, publicKey, team) {
    connect();
    setTimeout(() => send({ type:"join_room", roomId, publicKey, team }), 500);
  }

  function confirmPayment(txSignature) {
    send({ type:"confirm_payment", txSignature });
  }

  function shoot(zoneId) {
    send({ type:"shoot", zoneId });
  }

  function reset() {
    setRoomId(null); setPlayerId(null); setRoomStatus("idle");
  }

  useEffect(() => {
    connect();
    const ping = setInterval(() => send({ type:"ping" }), 25000);
    return () => { clearInterval(ping); wsRef.current?.close(); };
  }, []);

  return { connected, roomId, playerId, roomStatus, createRoom, joinRoom, confirmPayment, shoot, reset };
}

// ============================================================
// PVP TAB
// ============================================================
function PVPTab({ selectedTeam, onSelectTeam, onStartPVPMatch }) {
  const { wallet, connecting, connectingId, error, currency, setCurrency, showModal, setShowModal, connectWallet, disconnect } = useSolanaWallet();
  const [totalFees, setTotalFees]   = useState(0);
  const [coinBal, setCoinBal]       = useState(0);
  const [opponent, setOpponent]     = useState(null);
  const [pvpPhase, setPvpPhase]     = useState("lobby"); // lobby|waiting|payment|ready|playing|result
  const [matchResult, setMatchResult] = useState(null);
  const [openRooms, setOpenRooms]   = useState([]);
  const [log, setLog]               = useState([]);
  const addLog = (msg) => setLog(l => [msg, ...l].slice(0,12));

  const ENTRY_FEE = currency === "USDC" ? 1.00 : 0.01;
  const WIN_AMT   = currency === "USDC" ? 1.75 : 0.0175;
  const FEE_AMT   = currency === "USDC" ? 0.25 : 0.0025;
  const balance   = wallet ? (currency === "SOL" ? wallet.solBalance : wallet.usdcBalance) : 0;

  function shortAddr(addr) {
    if (!addr) return "";
    return addr.slice(0,4) + "..." + addr.slice(-4);
  }

  // WebSocket PVP
  const pvp = usePVPSocket({
    onOpponentJoined: (opp) => {
      setOpponent(opp);
      setPvpPhase("payment");
      addLog(`${opp.team?.flag} Rakip bulundu! Ödeme yapılıyor...`);
    },
    onPaymentConfirmed: () => {
      setPvpPhase("ready");
      addLog("✅ Ödeme onaylandı! Maç başlıyor...");
    },
    onMatchStart: (data) => {
      setPvpPhase("playing");
      addLog("⚽ MAÇ BAŞLADI!");
      if (wallet && selectedTeam && opponent?.team) {
        onStartPVPMatch(selectedTeam, opponent.team, (won) => {
          // send shots via WebSocket
        });
      }
    },
    onMatchOver: (data) => {
      setPvpPhase("result");
      setMatchResult(data);
      const won = data.winner === pvp.playerId;
      if (won) {
        setTotalFees(f => f + FEE_AMT);
        setCoinBal(c => c + FEE_AMT * 10);
        addLog(`🏆 KAZANDIN! +${WIN_AMT} ${currency} gönderildi!`);
      } else {
        addLog(`😢 Kaybettin. Tekrar dene!`);
      }
    },
  });

  // Fetch open rooms
  useEffect(() => {
    fetch("https://wcpenalty-backend.up.railway.app/rooms")
      .then(r => r.json())
      .then(setOpenRooms)
      .catch(() => setOpenRooms([]));
    const interval = setInterval(() => {
      fetch("https://wcpenalty-backend.up.railway.app/rooms")
        .then(r => r.json())
        .then(setOpenRooms)
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  function handleCreateRoom() {
    if (!wallet || !selectedTeam) return;
    pvp.createRoom(wallet.publicKey, selectedTeam, currency);
    setPvpPhase("waiting");
    setTotalFees(f => f + FEE_AMT);
    setCoinBal(c => c + FEE_AMT * 10);
    addLog(`Oda oluşturuldu · ${ENTRY_FEE} ${currency} bahis`);
  }

  function handleJoinRoom(room) {
    if (!wallet || !selectedTeam) return;
    pvp.joinRoom(room.id, wallet.publicKey, selectedTeam);
    setOpponent({ team: room.team });
    setPvpPhase("payment");
    addLog(`${room.team?.flag} odaya katıldın`);
  }

  function handleReset() {
    pvp.reset();
    setPvpPhase("lobby");
    setOpponent(null);
    setMatchResult(null);
  }

  return (
    <div style={{ padding:"14px" }}>

      {/* Wallet Modal */}
      <WalletModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConnect={connectWallet}
        connecting={connecting}
        connectingId={connectingId}
        error={error}
      />

      {/* Wallet card */}
      <div style={{
        background:"linear-gradient(135deg,#12002a,#2a0060)",
        border:`2px solid ${wallet ? "rgba(0,255,136,0.4)" : "rgba(153,0,255,0.35)"}`,
        borderRadius:"14px", padding:"14px", marginBottom:"14px",
      }}>
        {/* Currency toggle */}
        <div style={{ display:"flex", gap:"6px", marginBottom:"12px" }}>
          {["SOL","USDC"].map(c => (
            <button key={c} onClick={() => setCurrency(c)} style={{
              flex:1, padding:"6px",
              background: currency===c ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.05)",
              border:`1px solid ${currency===c ? "#FFD700" : "rgba(255,255,255,0.15)"}`,
              borderRadius:"8px", color: currency===c ? "#FFD700" : "#888",
              fontSize:"13px", fontWeight:"700", cursor:"pointer",
            }}>{c}</button>
          ))}
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
          <div>
            <div style={{ fontSize:"10px", color:"#888", letterSpacing:"2px" }}>
              {wallet ? "WALLET" : "NOT CONNECTED"}
            </div>
            <div style={{ fontSize:"22px", fontWeight:"900", color:"#FFD700", fontFamily:"'Bebas Neue','Impact',sans-serif" }}>
              {wallet ? `${balance.toFixed(4)} ${currency}` : "—"}
            </div>
            {wallet && (
              <div style={{ fontSize:"10px", color:"#00FF88" }}>
                {wallet.walletIcon} {shortAddr(wallet.publicKey)}
              </div>
            )}
          </div>

          {!wallet ? (
            <button onClick={() => setShowModal(true)} style={{
              padding:"10px 14px",
              background:"linear-gradient(135deg,#5500bb,#9900FF)",
              border:"1px solid #9900FF", borderRadius:"8px",
              color:"#DD88FF", fontSize:"12px", fontWeight:"700", cursor:"pointer",
            }}>🔌 Connect</button>
          ) : (
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:"11px", color: wallet.walletColor, marginBottom:"3px" }}>
                {wallet.walletIcon} {wallet.walletName}
              </div>
              <button onClick={disconnect} style={{
                padding:"5px 9px",
                background:"rgba(255,0,0,0.1)", border:"1px solid rgba(255,0,0,0.3)",
                borderRadius:"6px", color:"#FF6666", fontSize:"10px", fontWeight:"700", cursor:"pointer",
              }}>Disconnect</button>
            </div>
          )}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
          <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:"8px", padding:"9px", textAlign:"center" }}>
            <div style={{ fontSize:"10px", color:"#888" }}>FEES → WCUP</div>
            <div style={{ fontSize:"16px", fontWeight:"700", color:"#FF6600" }}>{totalFees.toFixed(4)}</div>
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:"8px", padding:"9px", textAlign:"center" }}>
            <div style={{ fontSize:"10px", color:"#888" }}>WCUP COINS</div>
            <div style={{ fontSize:"16px", fontWeight:"700", color:"#00FF88" }}>{coinBal.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* Rules */}
      <div style={{
        background:"rgba(255,215,0,0.05)", border:"1px solid rgba(255,215,0,0.2)",
        borderRadius:"10px", padding:"11px 13px", marginBottom:"14px",
      }}>
        <div style={{ fontSize:"12px", fontWeight:"700", color:"#FFD700", marginBottom:"7px" }}>💰 PVP RULES</div>
        <div style={{ fontSize:"12px", color:"#bbb", lineHeight:"1.85" }}>
          • Entry: <strong style={{color:"#fff"}}>{ENTRY_FEE} {currency}</strong> · Winner: <strong style={{color:"#00FF88"}}>{WIN_AMT} {currency}</strong><br/>
          • Fee: <strong style={{color:"#FF6600"}}>{FEE_AMT} {currency}</strong> → auto-buys <strong style={{color:"#FFD700"}}>WCUP</strong><br/>
          • Gerçek 2 kişi · WebSocket · Otomatik ödeme
        </div>
      </div>

      {/* LOBBY */}
      {pvpPhase === "lobby" && (
        <div>
          {!selectedTeam ? (
            <div style={{ textAlign:"center", padding:"20px", color:"#888", fontSize:"14px" }}>
              ← Play sekmesinden takım seç
            </div>
          ) : (
            <div>
              {/* Selected team */}
              <div style={{
                display:"flex", alignItems:"center", gap:"10px",
                background:`${selectedTeam.color}18`,
                border:`1px solid ${selectedTeam.color}40`,
                borderRadius:"10px", padding:"10px 13px", marginBottom:"12px",
              }}>
                <span style={{ fontSize:"28px" }}>{selectedTeam.flag}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"14px", fontWeight:"700" }}>{selectedTeam.name}</div>
                  <div style={{ fontSize:"11px", color:"#888" }}>Group {selectedTeam.group}</div>
                </div>
              </div>

              {/* Create room */}
              <button onClick={handleCreateRoom} disabled={!wallet || balance < ENTRY_FEE} style={{
                width:"100%", padding:"15px",
                background: (wallet && balance >= ENTRY_FEE) ? "linear-gradient(135deg,#12002a,#5500bb)" : "rgba(80,80,80,0.2)",
                border:`2px solid ${(wallet && balance >= ENTRY_FEE) ? "#9900FF" : "#444"}`,
                borderRadius:"12px",
                color: (wallet && balance >= ENTRY_FEE) ? "#DD88FF" : "#666",
                fontSize:"17px", fontWeight:"700",
                cursor:(wallet && balance >= ENTRY_FEE) ? "pointer" : "not-allowed",
                marginBottom:"14px",
              }}>
                💰 ODA OLUŞTUR ({ENTRY_FEE} {currency})
              </button>

              {!wallet && (
                <div style={{ textAlign:"center", fontSize:"12px", color:"#FF6600", marginBottom:"12px" }}>
                  ⚠️ Önce cüzdanını bağla
                </div>
              )}

              {/* Open rooms */}
              <div style={{ fontSize:"11px", color:"#666", letterSpacing:"2px", marginBottom:"9px" }}>
                AÇIK ODALAR {pvp.connected ? "🟢" : "🔴"}
              </div>
              {openRooms.length === 0 ? (
                <div style={{ textAlign:"center", padding:"20px", color:"#555", fontSize:"13px" }}>
                  Açık oda yok — ilk sen oluştur!
                </div>
              ) : (
                openRooms.map(room => (
                  <div key={room.id} style={{
                    display:"flex", alignItems:"center",
                    background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
                    borderRadius:"10px", padding:"10px 12px", marginBottom:"8px",
                  }}>
                    <span style={{ fontSize:"22px", marginRight:"9px" }}>{room.team?.flag}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"13px", fontWeight:"700" }}>#{room.id}</div>
                      <div style={{ fontSize:"11px", color:"#888" }}>{room.team?.name} · {room.entryFee} {room.currency}</div>
                    </div>
                    <button onClick={() => handleJoinRoom(room)} disabled={!wallet} style={{
                      padding:"6px 13px",
                      background: wallet ? "linear-gradient(135deg,#003a00,#006600)" : "rgba(60,60,60,0.3)",
                      border:`1px solid ${wallet ? "#00FF88" : "#444"}`,
                      borderRadius:"8px", color: wallet ? "#00FF88" : "#666",
                      fontSize:"12px", fontWeight:"700", cursor: wallet ? "pointer" : "not-allowed",
                    }}>JOIN</button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* WAITING */}
      {pvpPhase === "waiting" && (
        <div style={{
          background:"rgba(0,255,136,0.06)", border:"2px solid rgba(0,255,136,0.28)",
          borderRadius:"12px", padding:"20px", textAlign:"center",
        }}>
          <div style={{ fontSize:"36px", animation:"float 2s ease-in-out infinite" }}>⏳</div>
          <div style={{ fontSize:"16px", color:"#FFD700", fontWeight:"700", marginTop:"10px" }}>Rakip bekleniyor...</div>
          <div style={{ fontSize:"12px", color:"#888", marginTop:"4px" }}>
            Oda: <strong style={{color:"#00FF88"}}>#{pvp.roomId}</strong>
          </div>
          <div style={{ fontSize:"11px", color:"#666", marginTop:"8px" }}>Arkadaşına gönder!</div>
          <button onClick={handleReset} style={{
            marginTop:"14px", padding:"8px 18px",
            background:"rgba(255,0,0,0.1)", border:"1px solid rgba(255,0,0,0.3)",
            borderRadius:"8px", color:"#FF6666", fontSize:"12px", cursor:"pointer",
          }}>İptal</button>
        </div>
      )}

      {/* PAYMENT */}
      {pvpPhase === "payment" && (
        <div style={{
          background:"rgba(255,215,0,0.06)", border:"2px solid rgba(255,215,0,0.3)",
          borderRadius:"12px", padding:"16px", textAlign:"center",
        }}>
          <div style={{ fontSize:"32px", marginBottom:"10px" }}>💳</div>
          <div style={{ fontSize:"15px", color:"#FFD700", fontWeight:"700", marginBottom:"6px" }}>Ödeme Gerekli</div>
          <div style={{ fontSize:"12px", color:"#aaa", marginBottom:"14px" }}>
            Rakip bulundu! Phantom'da <strong style={{color:"#FFD700"}}>{ENTRY_FEE} {currency}</strong> onayla
          </div>
          {opponent && (
            <div style={{ display:"flex", justifyContent:"center", gap:"16px", marginBottom:"14px" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"28px" }}>{selectedTeam?.flag}</div>
                <div style={{ fontSize:"10px", color:"#00FF88" }}>SEN</div>
              </div>
              <div style={{ fontSize:"18px", color:"#FFD700", fontWeight:"900", alignSelf:"center" }}>VS</div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"28px" }}>{opponent.team?.flag}</div>
                <div style={{ fontSize:"10px", color:"#FF4444" }}>RAKİP</div>
              </div>
            </div>
          )}
          <div style={{ fontSize:"11px", color:"#666" }}>
            ⚠️ Ödeme onayı backend entegrasyonu gerektirir
          </div>
        </div>
      )}

      {/* RESULT */}
      {pvpPhase === "result" && matchResult && (
        <div style={{
          background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:"12px", padding:"20px", textAlign:"center",
        }}>
          <div style={{ fontSize:"52px", marginBottom:"10px" }}>
            {matchResult.winner === pvp.playerId ? "🏆" : "😢"}
          </div>
          <div style={{
            fontSize:"22px", fontWeight:"900", fontFamily:"'Bebas Neue','Impact',sans-serif",
            color: matchResult.winner === pvp.playerId ? "#FFD700" : "#FF4444",
            marginBottom:"6px",
          }}>
            {matchResult.winner === pvp.playerId ? "KAZANDIN!" : "KAYBETTİN"}
          </div>
          <div style={{ fontSize:"16px", color:"#aaa", marginBottom:"16px" }}>
            {matchResult.scores?.p1} – {matchResult.scores?.p2}
          </div>
          <button onClick={handleReset} style={{
            padding:"12px 24px",
            background:"linear-gradient(135deg,#003a00,#006600)",
            border:"2px solid #00FF88", borderRadius:"10px",
            color:"#00FF88", fontSize:"15px", fontWeight:"700", cursor:"pointer",
          }}>🔄 Tekrar Oyna</button>
        </div>
      )}

      {/* Activity log */}
      {log.length > 0 && (
        <div style={{ background:"rgba(0,0,0,0.28)", borderRadius:"8px", padding:"9px", marginTop:"12px", maxHeight:"110px", overflowY:"auto" }}>
          <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"5px" }}>LOG</div>
          {log.map((e,i) => (
            <div key={i} style={{ fontSize:"11px", color:"#aaa", marginBottom:"3px" }}>
              <span style={{ color:"#555" }}>{i===0?"now":`${i}m ago`}</span> · {e}
            </div>
          ))}
        </div>
      )}

      {/* Pump.fun note */}
      <div style={{
        marginTop:"14px", padding:"11px 13px",
        background:"linear-gradient(135deg,rgba(255,103,0,0.09),rgba(255,200,0,0.04))",
        border:"1px solid rgba(255,103,0,0.28)", borderRadius:"10px",
        fontSize:"11px", color:"#aaa", lineHeight:"1.7",
      }}>
        <div style={{ color:"#FF6600", fontWeight:"700", marginBottom:"3px" }}>🔥 WCUP TOKEN</div>
        Her {FEE_AMT} {currency} fee → pump.fun'da <strong style={{color:"#FFD700"}}>WCUP</strong> otomatik satın alır.
        <div style={{ marginTop:"5px", color:"#555", fontSize:"10px" }}>⚠️ Mainnet · Gerçek para</div>
      </div>
    </div>
  );
}



// ============================================================
// LEADERBOARD TAB
// ============================================================
const MOCK_LEADERBOARD = [
  { rank:1,  addr:"7xKp...3mNQ", flag:"🇧🇷", team:"Brazil",      wins:24, earnings:42.00, streak:8,  avatar:"👑" },
  { rank:2,  addr:"9aRt...7vBX", flag:"🇦🇷", team:"Argentina",   wins:19, earnings:33.25, streak:5,  avatar:"🥈" },
  { rank:3,  addr:"2mWq...1cLP", flag:"🇫🇷", team:"France",      wins:17, earnings:29.75, streak:3,  avatar:"🥉" },
  { rank:4,  addr:"5nHj...8kYZ", flag:"🇩🇪", team:"Germany",     wins:15, earnings:26.25, streak:4,  avatar:"⚡" },
  { rank:5,  addr:"3bFs...4tMR", flag:"🇪🇸", team:"Spain",       wins:13, earnings:22.75, streak:2,  avatar:"🔥" },
  { rank:6,  addr:"8dCv...2uQK", flag:"🇵🇹", team:"Portugal",    wins:11, earnings:19.25, streak:6,  avatar:"💎" },
  { rank:7,  addr:"1gXw...9pJN", flag:"🇳🇱", team:"Netherlands", wins:10, earnings:17.50, streak:1,  avatar:"⭐" },
  { rank:8,  addr:"6eOy...5sAE", flag:"🇮🇹", team:"Italy",       wins:9,  earnings:15.75, streak:3,  avatar:"🎯" },
  { rank:9,  addr:"4fUz...6rDH", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", team:"England",     wins:8,  earnings:14.00, streak:0,  avatar:"🎪" },
  { rank:10, addr:"0hVi...3wGT", flag:"🇧🇪", team:"Belgium",     wins:7,  earnings:12.25, streak:2,  avatar:"🏅" },
];

function LeaderboardTab() {
  const [period, setPeriod]     = useState("weekly");
  const [sortBy, setSortBy]     = useState("wins");
  const [data, setData]         = useState(MOCK_LEADERBOARD);
  const [loading, setLoading]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive, setIsLive]     = useState(false);

  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysLeft = 7 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);

  function formatDate(d) {
    return d.toLocaleDateString("tr-TR", { day:"numeric", month:"short" });
  }

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(
        `https://wcpenalty-backend.up.railway.app/leaderboard?period=${period}&limit=10`
      );
      if (res.ok) {
        const liveData = await res.json();
        if (liveData.length > 0) {
          setData(liveData);
          setIsLive(true);
        } else {
          // No real data yet, show mock
          setData(MOCK_LEADERBOARD);
          setIsLive(false);
        }
      } else {
        setData(MOCK_LEADERBOARD);
        setIsLive(false);
      }
    } catch(e) {
      // Backend offline - show mock data
      setData(MOCK_LEADERBOARD);
      setIsLive(false);
    } finally {
      setLastUpdated(new Date());
      setLoading(false);
    }
  }

  // Auto fetch on mount and period change
  useEffect(() => { refresh(); }, [period]);

  const sorted = [...data].sort((a,b) => {
    if (sortBy === "earnings") return b.earnings - a.earnings;
    if (sortBy === "streak")   return b.streak - a.streak;
    return b.wins - a.wins;
  }).map((p,i) => ({...p, rank: i+1}));

  const rankColors = ["#FFD700","#C0C0C0","#CD7F32"];
  const rankBg     = ["rgba(255,215,0,0.12)","rgba(192,192,192,0.08)","rgba(205,127,50,0.08)"];

  return (
    <div style={{ padding:"14px" }}>

      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg,#1a0a00,#2d1500)",
        border:"2px solid rgba(255,215,0,0.3)",
        borderRadius:"14px", padding:"14px", marginBottom:"14px",
        textAlign:"center",
      }}>
        <div style={{ fontSize:"28px", marginBottom:"4px" }}>👑</div>
        <div style={{ fontSize:"20px", fontWeight:"900", color:"#FFD700", fontFamily:"'Bebas Neue','Impact',sans-serif", letterSpacing:"2px" }}>
          HAFTALIK LİDERLER
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:"8px", marginBottom:"4px" }}>
          <span style={{
            fontSize:"10px", padding:"2px 8px", borderRadius:"10px",
            background: isLive ? "rgba(0,255,136,0.15)" : "rgba(255,100,0,0.15)",
            border:`1px solid ${isLive ? "rgba(0,255,136,0.4)" : "rgba(255,100,0,0.4)"}`,
            color: isLive ? "#00FF88" : "#FF6600",
            fontWeight:"700",
          }}>
            {isLive ? "🟢 CANLI" : "🟡 DEMO"}
          </span>
        </div>
        <div style={{ fontSize:"11px", color:"#888", marginTop:"4px" }}>
          {formatDate(weekStart)} – {formatDate(new Date(weekStart.getTime() + 6*86400000))}
          {" · "}
          <span style={{ color:"#FF6600" }}>{daysLeft} gün kaldı</span>
        </div>
        <div style={{ fontSize:"10px", color:"#555", marginTop:"2px" }}>
          Son güncelleme: {lastUpdated.toLocaleTimeString("tr-TR")}
        </div>
      </div>

      {/* Period tabs */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"12px" }}>
        {[
          { id:"weekly",  label:"Bu Hafta" },
          { id:"monthly", label:"Bu Ay" },
          { id:"alltime", label:"Tüm Zamanlar" },
        ].map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)} style={{
            flex:1, padding:"7px 4px",
            background: period===p.id ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
            border:`1px solid ${period===p.id ? "#FFD700" : "rgba(255,255,255,0.1)"}`,
            borderRadius:"8px", color: period===p.id ? "#FFD700" : "#666",
            fontSize:"11px", fontWeight:"700", cursor:"pointer",
          }}>{p.label}</button>
        ))}
      </div>

      {/* Sort tabs */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"12px" }}>
        {[
          { id:"wins",     label:"🏆 Galibiyet" },
          { id:"earnings", label:"💰 Kazanç" },
          { id:"streak",   label:"🔥 Seri" },
        ].map(s => (
          <button key={s.id} onClick={() => setSortBy(s.id)} style={{
            flex:1, padding:"6px 2px",
            background: sortBy===s.id ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.04)",
            border:`1px solid ${sortBy===s.id ? "#00FF88" : "rgba(255,255,255,0.08)"}`,
            borderRadius:"8px", color: sortBy===s.id ? "#00FF88" : "#555",
            fontSize:"11px", fontWeight:"700", cursor:"pointer",
          }}>{s.label}</button>
        ))}
      </div>

      {/* Refresh */}
      <button onClick={refresh} disabled={loading} style={{
        width:"100%", padding:"8px",
        background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:"8px", color: loading ? "#555" : "#aaa",
        fontSize:"12px", cursor: loading ? "default" : "pointer",
        marginBottom:"12px",
      }}>
        {loading ? "⏳ Yükleniyor..." : "🔄 Yenile"}
      </button>

      {/* Top 3 podium */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"center", gap:"8px", marginBottom:"16px", padding:"0 4px" }}>
        {/* 2nd */}
        <div style={{
          flex:1, background:"rgba(192,192,192,0.1)",
          border:"1px solid rgba(192,192,192,0.3)",
          borderRadius:"12px 12px 0 0", padding:"12px 6px",
          textAlign:"center", height:"110px", display:"flex", flexDirection:"column", justifyContent:"center",
        }}>
          <div style={{ fontSize:"22px" }}>{sorted[1]?.flag}</div>
          <div style={{ fontSize:"16px", marginTop:"2px" }}>🥈</div>
          <div style={{ fontSize:"10px", color:"#C0C0C0", fontWeight:"700", marginTop:"4px" }}>{sorted[1]?.addr}</div>
          <div style={{ fontSize:"13px", color:"#fff", fontWeight:"900" }}>{sorted[1]?.wins}W</div>
        </div>
        {/* 1st */}
        <div style={{
          flex:1, background:"rgba(255,215,0,0.12)",
          border:"2px solid rgba(255,215,0,0.4)",
          borderRadius:"12px 12px 0 0", padding:"12px 6px",
          textAlign:"center", height:"140px", display:"flex", flexDirection:"column", justifyContent:"center",
          boxShadow:"0 0 20px rgba(255,215,0,0.2)",
        }}>
          <div style={{ fontSize:"28px" }}>{sorted[0]?.flag}</div>
          <div style={{ fontSize:"20px", marginTop:"2px" }}>👑</div>
          <div style={{ fontSize:"10px", color:"#FFD700", fontWeight:"700", marginTop:"4px" }}>{sorted[0]?.addr}</div>
          <div style={{ fontSize:"15px", color:"#FFD700", fontWeight:"900" }}>{sorted[0]?.wins}W</div>
          <div style={{ fontSize:"10px", color:"#888" }}>${sorted[0]?.earnings}</div>
        </div>
        {/* 3rd */}
        <div style={{
          flex:1, background:"rgba(205,127,50,0.1)",
          border:"1px solid rgba(205,127,50,0.3)",
          borderRadius:"12px 12px 0 0", padding:"12px 6px",
          textAlign:"center", height:"90px", display:"flex", flexDirection:"column", justifyContent:"center",
        }}>
          <div style={{ fontSize:"22px" }}>{sorted[2]?.flag}</div>
          <div style={{ fontSize:"16px", marginTop:"2px" }}>🥉</div>
          <div style={{ fontSize:"10px", color:"#CD7F32", fontWeight:"700", marginTop:"4px" }}>{sorted[2]?.addr}</div>
          <div style={{ fontSize:"13px", color:"#fff", fontWeight:"900" }}>{sorted[2]?.wins}W</div>
        </div>
      </div>

      {/* Full top 10 list */}
      <div style={{
        background:"rgba(0,0,0,0.3)", borderRadius:"12px",
        border:"1px solid rgba(255,255,255,0.08)", overflow:"hidden",
      }}>
        <div style={{
          display:"grid", gridTemplateColumns:"32px 1fr 44px 52px 44px",
          padding:"8px 12px", fontSize:"9px", color:"#555",
          letterSpacing:"1px", borderBottom:"1px solid rgba(255,255,255,0.06)",
        }}>
          <span>#</span>
          <span>OYUNCU</span>
          <span style={{textAlign:"center"}}>GALİP</span>
          <span style={{textAlign:"center"}}>KAZANÇ</span>
          <span style={{textAlign:"center"}}>SERİ</span>
        </div>

        {sorted.map((player, i) => (
          <div key={player.addr} style={{
            display:"grid", gridTemplateColumns:"32px 1fr 44px 52px 44px",
            padding:"10px 12px", alignItems:"center",
            background: i < 3 ? rankBg[i] : i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
            borderBottom:"1px solid rgba(255,255,255,0.04)",
            transition:"background 0.2s",
          }}>
            {/* Rank */}
            <div style={{
              fontSize: i < 3 ? "18px" : "13px",
              fontWeight:"900",
              color: i < 3 ? rankColors[i] : "#555",
              textAlign:"center",
            }}>
              {i < 3 ? ["👑","🥈","🥉"][i] : player.rank}
            </div>

            {/* Player */}
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <span style={{ fontSize:"18px" }}>{player.flag}</span>
              <div>
                <div style={{ fontSize:"12px", fontWeight:"700", color: i < 3 ? rankColors[i] : "#ccc" }}>
                  {player.addr}
                </div>
                <div style={{ fontSize:"10px", color:"#555" }}>{player.team}</div>
              </div>
            </div>

            {/* Wins */}
            <div style={{
              textAlign:"center", fontSize:"14px", fontWeight:"900",
              color: sortBy === "wins" ? "#00FF88" : "#aaa",
            }}>
              {player.wins}
            </div>

            {/* Earnings */}
            <div style={{
              textAlign:"center", fontSize:"12px", fontWeight:"700",
              color: sortBy === "earnings" ? "#FFD700" : "#888",
            }}>
              ${player.earnings}
            </div>

            {/* Streak */}
            <div style={{
              textAlign:"center", fontSize:"12px", fontWeight:"700",
              color: sortBy === "streak" ? "#FF6600" : "#666",
            }}>
              {player.streak > 0 ? `🔥${player.streak}` : "-"}
            </div>
          </div>
        ))}
      </div>

      {/* Reset info */}
      <div style={{
        marginTop:"12px", padding:"10px 12px",
        background:"rgba(255,215,0,0.05)", border:"1px solid rgba(255,215,0,0.15)",
        borderRadius:"8px", fontSize:"11px", color:"#666", textAlign:"center",
        lineHeight:"1.7",
      }}>
        🕐 Haftalık sıralama her <strong style={{color:"#FFD700"}}>Pazartesi 00:00</strong> sıfırlanır<br/>
        İlk 3 özel <strong style={{color:"#FF6600"}}>WCUP token ödülü</strong> kazanır
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
function simulateGroupStage() {
  const standings = {};
  GROUPS.forEach(g => {
    const teams = TEAMS.filter(t => t.group === g).map(t => ({...t,w:0,d:0,l:0,pts:0}));
    for (let i=0; i<teams.length; i++) {
      for (let j=i+1; j<teams.length; j++) {
        const r = Math.random();
        if (r<0.38)      { teams[i].w++; teams[i].pts+=3; teams[j].l++; }
        else if (r<0.55) { teams[i].d++; teams[i].pts+=1; teams[j].d++; teams[j].pts+=1; }
        else             { teams[j].w++; teams[j].pts+=3; teams[i].l++; }
      }
    }
    teams.sort((a,b) => b.pts-a.pts);
    standings[g] = teams;
  });
  return standings;
}

function buildBracketFromStandings(standings) {
  const qualifiers = [];
  GROUPS.forEach(g => { qualifiers.push(standings[g][0], standings[g][1]); });
  const shuffled = [...qualifiers].sort(() => Math.random()-0.5);

  // Build progressive rounds
  const r32 = [];
  for (let i=0; i<32; i+=2) r32.push({ team1:shuffled[i], team2:shuffled[i+1], winner:null });

  return { r32, r16:[], qf:[], sf:[], final:null, champion:null };
}

export default function App() {
  const [screen, setScreen]           = useState("home");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [matchTeams, setMatchTeams]   = useState({ p:null, ai:null });
  const [pvpWinCb, setPvpWinCb]       = useState(null);
  const [pvpMode, setPvpMode]         = useState(false);
  const [standings, setStandings]     = useState({});
  const [bracket, setBracket]         = useState(null);
  const [activeTab, setActiveTab]     = useState("play");

  function startMatch(pTeam, aiTeam, pvpCb=null) {
    setMatchTeams({ p: pTeam, ai: aiTeam });
    setPvpMode(!!pvpCb);
    setPvpWinCb(() => pvpCb);
    setScreen("match");
  }

  function handleSimulate() {
    const s = simulateGroupStage();
    setStandings(s);
    setBracket(buildBracketFromStandings(s));
  }

  if (screen === "match") {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <MatchScreen
          playerTeam={matchTeams.p}
          aiTeam={matchTeams.ai}
          pvpMode={pvpMode}
          onPVPWin={pvpWinCb}
          onBack={() => setScreen("main")}
          onRematch={() => startMatch(matchTeams.p, matchTeams.ai, pvpMode ? pvpWinCb : null)}
          onGoTournament={() => { setActiveTab("bracket"); setScreen("main"); }}
        />
      </>
    );
  }

  if (screen === "teamSelect") {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <TeamSelect
          onSelect={t => { setSelectedTeam(t); setScreen("main"); setActiveTab("play"); }}
          onBack={() => setScreen(Object.keys(standings).length>0 ? "main" : "home")}
        />
      </>
    );
  }

  if (screen === "home") {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div style={{
          minHeight:"100vh",
          background:"linear-gradient(135deg,#080812 0%,#0b1d2e 45%,#081505 100%)",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          fontFamily:"'Barlow','Trebuchet MS',sans-serif",
          position:"relative", overflow:"hidden", padding:"20px",
        }}>
          {/* grass stripes bg */}
          {Array.from({length:7}).map((_,i) => (
            <div key={i} style={{
              position:"absolute", left:0, right:0,
              top:`${i*14.5}%`, height:"7%",
              background:"#00AA44", opacity:0.04,
            }}/>
          ))}

          <div style={{ textAlign:"center", marginBottom:"38px" }} className="fade-up">
            <div style={{ fontSize:"54px", animation:"float 3s ease-in-out infinite" }}>⚽</div>
            <h1 style={{
              fontSize:"clamp(30px,6vw,52px)", fontWeight:"900",
              color:"#FFD700", margin:"6px 0 2px",
              textShadow:"0 0 28px rgba(255,215,0,0.5), 2px 2px 0 #8a6000",
              letterSpacing:"2px", fontFamily:"'Bebas Neue','Impact',sans-serif",
            }}>WORLD CUP 2026</h1>
            <h2 style={{
              fontSize:"clamp(18px,3.5vw,28px)", fontWeight:"700",
              color:"#fff", margin:"0 0 6px",
              letterSpacing:"7px", textShadow:"0 2px 10px rgba(255,255,255,0.25)",
              fontFamily:"'Bebas Neue','Impact',sans-serif",
            }}>PENALTY PVP</h2>
            <div style={{ fontSize:"12px", color:"#00FF88", letterSpacing:"3px", textShadow:"0 0 8px #00FF88" }}>
              48 TEAMS · 5 PENALTIES · SUDDEN DEATH · WIN $1.75
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"13px", width:"100%", maxWidth:"320px" }}>
            <button className="shimmer-btn" onClick={() => setScreen("teamSelect")} style={{
              padding:"17px 30px", border:"none", borderRadius:"12px",
              fontSize:"19px", fontWeight:"900", color:"#1a0a00", cursor:"pointer",
              letterSpacing:"1px", fontFamily:"'Bebas Neue','Impact',sans-serif",
              boxShadow:"0 4px 18px rgba(255,200,0,0.4)",
            }}>🏆 TOURNAMENT MODE</button>

            <button className="pulse-glow" onClick={() => {
              const opp = TEAMS[Math.floor(Math.random()*TEAMS.length)];
              const me  = selectedTeam || TEAMS[Math.floor(Math.random()*TEAMS.length)];
              startMatch(me, opp);
            }} style={{
              padding:"15px 30px",
              background:"linear-gradient(135deg,#003a00,#006600)",
              border:"2px solid #00CC44", borderRadius:"12px",
              fontSize:"17px", fontWeight:"700", color:"#00FF88", cursor:"pointer",
            }}>⚡ QUICK MATCH</button>

            <button onClick={() => { setScreen("main"); setActiveTab("pvp"); }} style={{
              padding:"15px 30px",
              background:"linear-gradient(135deg,#12002a,#440088)",
              border:"2px solid #9900FF", borderRadius:"12px",
              fontSize:"17px", fontWeight:"700", color:"#DD88FF", cursor:"pointer",
              boxShadow:"0 0 18px rgba(153,0,255,0.28)",
            }}>💰 PVP BETTING ($1 vs $1)</button>
          </div>

          <div style={{
            marginTop:"32px", padding:"11px 18px",
            background:"rgba(255,215,0,0.08)", border:"1px solid rgba(255,215,0,0.28)",
            borderRadius:"8px", fontSize:"12px", color:"#FFD700",
            textAlign:"center", maxWidth:"320px",
          }}>
            💎 $0.25 per match → auto-buys <strong>WCUP</strong> coin on pump.fun
          </div>
        </div>
      </>
    );
  }

  // ---- MAIN (tabs) ----
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{
        minHeight:"100vh", display:"flex", flexDirection:"column",
        background:"linear-gradient(160deg,#060d18 0%,#0a1a0a 100%)",
        fontFamily:"'Barlow','Trebuchet MS',sans-serif", color:"#fff",
      }}>
        {/* Header */}
        <div style={{
          background:"rgba(0,0,0,0.7)", backdropFilter:"blur(10px)",
          padding:"10px 14px", display:"flex", alignItems:"center", gap:"10px",
          borderBottom:"1px solid rgba(255,215,0,0.18)",
          position:"sticky", top:0, zIndex:50,
        }}>
          <button onClick={() => setScreen("home")} style={{ background:"none",border:"none",color:"#FFD700",fontSize:"20px",cursor:"pointer" }}>←</button>
          <div style={{ fontSize:"14px", fontWeight:"700", color:"#FFD700", letterSpacing:"1px", fontFamily:"'Bebas Neue','Impact',sans-serif" }}>
            🏆 WORLD CUP PENALTY PVP
          </div>
          {selectedTeam && (
            <button onClick={() => setScreen("teamSelect")} style={{
              marginLeft:"auto",
              display:"flex", alignItems:"center", gap:"6px",
              background:`${selectedTeam.color}22`,
              padding:"4px 10px", borderRadius:"20px",
              border:`1px solid ${selectedTeam.color}55`,
              cursor:"pointer", color:"#fff",
            }}>
              <span style={{ fontSize:"18px" }}>{selectedTeam.flag}</span>
              <span style={{ fontSize:"11px", fontWeight:"700" }}>{selectedTeam.code}</span>
            </button>
          )}
        </div>

        {/* Tab content */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {activeTab === "play" && (
            <div style={{ padding:"14px" }}>
              {!selectedTeam ? (
                <div style={{ textAlign:"center", padding:"50px 20px" }}>
                  <div style={{ fontSize:"52px", marginBottom:"14px" }}>🌍</div>
                  <div style={{ fontSize:"17px", fontWeight:"700", marginBottom:"8px", color:"#FFD700" }}>Choose Your Nation</div>
                  <div style={{ fontSize:"13px", color:"#888", marginBottom:"22px" }}>48 World Cup teams</div>
                  <button onClick={() => setScreen("teamSelect")} style={{
                    padding:"13px 26px",
                    background:"linear-gradient(135deg,#FFD700,#FFA500)",
                    border:"none", borderRadius:"10px",
                    fontSize:"15px", fontWeight:"700", color:"#000", cursor:"pointer",
                  }}>SELECT TEAM →</button>
                </div>
              ) : (
                <div>
                  {/* My team card */}
                  <div style={{
                    background:`linear-gradient(135deg,${selectedTeam.color}20,rgba(0,0,0,0.7))`,
                    border:`2px solid ${selectedTeam.color}55`,
                    borderRadius:"12px", padding:"14px", marginBottom:"14px",
                    display:"flex", alignItems:"center", gap:"12px",
                  }}>
                    <span style={{ fontSize:"42px" }}>{selectedTeam.flag}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"18px", fontWeight:"700" }}>{selectedTeam.name}</div>
                      <div style={{ fontSize:"11px", color:"#888", letterSpacing:"1px" }}>YOUR TEAM · GROUP {selectedTeam.group}</div>
                    </div>
                    <Jersey color={selectedTeam.jersey} number="10" size={44}/>
                  </div>

                  {/* Quick kick-off */}
                  <button onClick={() => {
                    const opp = TEAMS.filter(t=>t.id!==selectedTeam.id)[Math.floor(Math.random()*(TEAMS.length-1))];
                    startMatch(selectedTeam, opp);
                  }} style={{
                    width:"100%", padding:"15px",
                    background:"linear-gradient(135deg,#003a00,#008844)",
                    border:"2px solid #00FF88", borderRadius:"12px",
                    color:"#00FF88", fontSize:"18px", fontWeight:"700",
                    cursor:"pointer", letterSpacing:"1px", marginBottom:"12px",
                    fontFamily:"'Bebas Neue','Impact',sans-serif",
                  }}>⚽ KICK OFF vs RANDOM OPPONENT</button>

                  {/* Grid of all flags */}
                  <div style={{ fontSize:"11px", color:"#666", letterSpacing:"2px", marginBottom:"9px" }}>CHOOSE OPPONENT</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:"5px" }}>
                    {TEAMS.filter(t=>t.id!==selectedTeam.id).map(t => (
                      <button key={t.id} title={t.name} onClick={() => startMatch(selectedTeam, t)} style={{
                        background:`${t.color}20`, border:`1px solid ${t.color}44`,
                        borderRadius:"8px", padding:"5px 2px",
                        fontSize:"18px", cursor:"pointer", transition:"transform 0.15s",
                      }}>{t.flag}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "bracket" && (
            <BracketView
              standings={standings}
              bracket={bracket}
              onSimulate={handleSimulate}
              onStartMatch={(p, ai) => startMatch(p, ai)}
              selectedTeam={selectedTeam}
            />
          )}

          {activeTab === "pvp" && (
            <PVPTab
              selectedTeam={selectedTeam}
              onSelectTeam={setSelectedTeam}
              onStartPVPMatch={(p, ai, cb) => startMatch(p, ai, cb)}
            />
          )}

          {activeTab === "leaders" && (
            <LeaderboardTab/>
          )}
        </div>

        {/* Bottom nav */}
        <div style={{
          background:"rgba(0,0,0,0.92)", backdropFilter:"blur(10px)",
          borderTop:"1px solid rgba(255,255,255,0.09)",
          display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr",
          padding:"7px 0 10px",
        }}>
          {[
            { id:"play",    icon:"⚽", label:"PLAY" },
            { id:"bracket", icon:"🏆", label:"BRACKET" },
            { id:"pvp",     icon:"💰", label:"PVP BET" },
            { id:"leaders", icon:"👑", label:"LEADERS" },
          ].map(tab => (
            <button key={tab.id} className="nav-tab" onClick={() => setActiveTab(tab.id)} style={{
              background:"none", border:"none",
              color: activeTab===tab.id ? "#FFD700" : "#555",
              cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:"2px",
            }}>
              <span style={{ fontSize:"21px" }}>{tab.icon}</span>
              <span style={{
                fontSize:"9px", fontWeight:"700", letterSpacing:"1px",
                borderBottom: activeTab===tab.id ? "2px solid #FFD700" : "2px solid transparent",
                paddingBottom:"1px", fontFamily:"'Barlow','Trebuchet MS',sans-serif",
              }}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
