require("dotenv").config();
const express = require("express");
const { WebSocketServer } = require("ws");
const cors = require("cors");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  Keypair,
} = require("@solana/web3.js");

// ============================================================
// CONFIG
// ============================================================
const PORT = process.env.PORT || 3001;
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";
const TREASURY_WALLET = process.env.TREASURY_WALLET || "YOUR_TREASURY_WALLET_ADDRESS";
const WCUP_TOKEN = process.env.WCUP_TOKEN || null; // pump.fun token address
const ENTRY_FEE_SOL = 0.01;   // ~$1 in SOL
const ENTRY_FEE_USDC = 1.0;   // $1 USDC
const WIN_RATIO = 0.75;        // winner gets 75% of pot = $1.75
const FEE_RATIO = 0.125;       // 12.5% each side = $0.25 total fee

const connection = new Connection(SOLANA_RPC, "confirmed");

// ============================================================
// IN-MEMORY STORE
// ============================================================
const rooms = new Map();   // roomId → Room
const clients = new Map(); // ws → { roomId, playerId, publicKey }

// Leaderboard: publicKey → { wins, earnings, streak, lastWin, team }
const leaderboard = new Map();

function updateLeaderboard(publicKey, team, currency, winAmount) {
  const now = Date.now();
  const existing = leaderboard.get(publicKey) || {
    publicKey, team, wins:0, earnings:0, streak:0, lastWin:0, weeklyWins:0, weekStart: getWeekStart()
  };
  // Reset weekly if new week
  const currentWeekStart = getWeekStart();
  if (existing.weekStart !== currentWeekStart) {
    existing.weeklyWins = 0;
    existing.weekStart = currentWeekStart;
  }
  existing.wins++;
  existing.weeklyWins++;
  existing.earnings = +(existing.earnings + winAmount).toFixed(4);
  existing.streak++;
  existing.lastWin = now;
  existing.team = team;
  leaderboard.set(publicKey, existing);
}

function penalizeStreak(publicKey) {
  const p = leaderboard.get(publicKey);
  if (p) { p.streak = 0; leaderboard.set(publicKey, p); }
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0,0,0,0);
  return monday.getTime();
}

function getTopLeaderboard(period = "weekly", limit = 10) {
  const weekStart = getWeekStart();
  const entries = Array.from(leaderboard.values());
  const sorted = entries
    .filter(p => period === "weekly" ? p.weekStart === weekStart : true)
    .sort((a,b) => {
      if (period === "weekly") return b.weeklyWins - a.weeklyWins;
      return b.wins - a.wins;
    })
    .slice(0, limit)
    .map((p, i) => ({
      rank: i + 1,
      addr: p.publicKey.slice(0,4) + "..." + p.publicKey.slice(-4),
      publicKey: p.publicKey,
      team: p.team,
      wins: period === "weekly" ? p.weeklyWins : p.wins,
      earnings: p.earnings,
      streak: p.streak,
    }));
  return sorted;
}

// ============================================================
// EXPRESS + HTTP
// ============================================================
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    rooms: rooms.size,
    clients: clients.size,
    timestamp: new Date().toISOString(),
  });
});

// Get leaderboard
app.get("/leaderboard", (req, res) => {
  const period = req.query.period || "weekly";
  const limit  = parseInt(req.query.limit) || 10;
  res.json(getTopLeaderboard(period, limit));
});

// Get open rooms
app.get("/rooms", (req, res) => {
  const open = [];
  rooms.forEach((room, id) => {
    if (room.status === "waiting") {
      open.push({
        id,
        team: room.player1.team,
        currency: room.currency,
        entryFee: room.entryFee,
        createdAt: room.createdAt,
      });
    }
  });
  res.json(open);
});

const server = http.createServer(app);

// ============================================================
// WEBSOCKET
// ============================================================
const wss = new WebSocketServer({ server });

function send(ws, data) {
  if (ws.readyState === 1) ws.send(JSON.stringify(data));
}

function broadcast(room, data, excludeWs = null) {
  [room.player1?.ws, room.player2?.ws].forEach((ws) => {
    if (ws && ws !== excludeWs) send(ws, data);
  });
}

// ============================================================
// SOLANA HELPERS
// ============================================================
async function verifyPayment(txSignature, expectedFrom, expectedAmount, currency) {
  try {
    const tx = await connection.getParsedTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
    });
    if (!tx) return false;

    if (currency === "SOL") {
      // Check SOL transfer to treasury
      const instructions = tx.transaction.message.instructions;
      for (const ix of instructions) {
        if (
          ix.parsed?.type === "transfer" &&
          ix.parsed.info.destination === TREASURY_WALLET &&
          ix.parsed.info.source === expectedFrom &&
          ix.parsed.info.lamports >= expectedAmount * LAMPORTS_PER_SOL * 0.99
        ) {
          return true;
        }
      }
    }
    return false;
  } catch (e) {
    console.error("verifyPayment error:", e);
    return false;
  }
}

async function sendWinnings(winnerPublicKey, currency, amount) {
  // In production: treasury keypair signs and sends SOL/USDC to winner
  // For now we log it — implement with treasury private key in env
  console.log(`[PAYOUT] Sending ${amount} ${currency} to ${winnerPublicKey}`);
  // TODO: Implement actual payout with treasury wallet
  // const treasuryKeypair = Keypair.fromSecretKey(...)
  // const tx = new Transaction().add(SystemProgram.transfer({...}))
  // await sendAndConfirmTransaction(connection, tx, [treasuryKeypair])
  return { success: true, simulated: true };
}

// ============================================================
// GAME LOGIC
// ============================================================
function createRoom(ws, data) {
  const roomId = "WC" + Math.floor(Math.random() * 90000 + 10000);
  const room = {
    id: roomId,
    status: "waiting",
    currency: data.currency || "SOL",
    entryFee: data.currency === "USDC" ? ENTRY_FEE_USDC : ENTRY_FEE_SOL,
    player1: {
      ws,
      publicKey: data.publicKey,
      team: data.team,
      penalties: [],
      paid: false,
      payTx: null,
    },
    player2: null,
    createdAt: Date.now(),
    penalties: { p1: [], p2: [] },
    currentKicker: "p1",
    round: 0,
    suddenDeath: false,
  };
  rooms.set(roomId, room);
  clients.set(ws, { roomId, playerId: "p1", publicKey: data.publicKey });

  send(ws, { type: "room_created", roomId, playerId: "p1", entryFee: room.entryFee, currency: room.currency });
  console.log(`[ROOM] Created ${roomId} by ${data.publicKey?.slice(0, 8)}`);
  return room;
}

function joinRoom(ws, data) {
  const room = rooms.get(data.roomId);
  if (!room) { send(ws, { type: "error", msg: "Room not found" }); return; }
  if (room.status !== "waiting") { send(ws, { type: "error", msg: "Room is full" }); return; }
  if (room.player1.publicKey === data.publicKey) { send(ws, { type: "error", msg: "Cannot join own room" }); return; }

  room.player2 = {
    ws,
    publicKey: data.publicKey,
    team: data.team,
    penalties: [],
    paid: false,
    payTx: null,
  };
  room.status = "payment_pending";
  clients.set(ws, { roomId: data.roomId, playerId: "p2", publicKey: data.publicKey });

  // Notify both players
  send(room.player1.ws, {
    type: "player_joined",
    opponent: { team: data.team, publicKey: data.publicKey },
  });
  send(ws, {
    type: "room_joined",
    roomId: data.roomId,
    playerId: "p2",
    opponent: { team: room.player1.team, publicKey: room.player1.publicKey },
    entryFee: room.entryFee,
    currency: room.currency,
  });

  console.log(`[ROOM] ${data.publicKey?.slice(0, 8)} joined ${data.roomId}`);
}

async function confirmPayment(ws, data) {
  const clientInfo = clients.get(ws);
  if (!clientInfo) return;
  const room = rooms.get(clientInfo.roomId);
  if (!room) return;

  const player = clientInfo.playerId === "p1" ? room.player1 : room.player2;

  // Verify on-chain payment
  const verified = await verifyPayment(
    data.txSignature,
    player.publicKey,
    room.entryFee,
    room.currency
  );

  if (!verified) {
    send(ws, { type: "payment_failed", msg: "Transaction not verified" });
    return;
  }

  player.paid = true;
  player.payTx = data.txSignature;
  send(ws, { type: "payment_confirmed" });

  // If both paid → start match
  if (room.player1.paid && room.player2?.paid) {
    room.status = "playing";
    broadcast(room, {
      type: "match_start",
      firstKicker: "p1",
      p1Team: room.player1.team,
      p2Team: room.player2.team,
    });
    console.log(`[MATCH] Starting in room ${room.id}`);
  }
}

function handleShot(ws, data) {
  const clientInfo = clients.get(ws);
  if (!clientInfo) return;
  const room = rooms.get(clientInfo.roomId);
  if (!room || room.status !== "playing") return;

  const { zoneId } = data;
  const playerId = clientInfo.playerId;

  // GK randomly dives
  const gkZone = Math.floor(Math.random() * 9);
  const scored = zoneId !== gkZone;

  // Record result
  if (playerId === "p1") {
    room.penalties.p1.push(scored);
  } else {
    room.penalties.p2.push(scored);
  }

  // Broadcast shot result to both players
  broadcast(room, {
    type: "shot_result",
    shooter: playerId,
    zoneId,
    gkZone,
    scored,
    scores: {
      p1: room.penalties.p1.filter(Boolean).length,
      p2: room.penalties.p2.filter(Boolean).length,
    },
    penalties: room.penalties,
  });

  // Check if match is over
  const result = checkMatchOver(room);
  if (result) {
    endMatch(room, result);
  }
}

function checkMatchOver(room) {
  const { p1, p2 } = room.penalties;
  const p1Score = p1.filter(Boolean).length;
  const p2Score = p2.filter(Boolean).length;
  const shots = Math.min(p1.length, p2.length);
  const remaining = 5 - shots;

  if (shots >= 5) {
    if (p1Score > p2Score) return "p1";
    if (p2Score > p1Score) return "p2";
    return "draw";
  }
  if (p1Score > p2Score + remaining) return "p1";
  if (p2Score > p1Score + remaining) return "p2";
  return null;
}

async function endMatch(room, result) {
  room.status = "finished";

  let winnerKey = null;
  let winnerId = null;

  if (result === "p1") {
    winnerKey = room.player1.publicKey;
    winnerId = "p1";
  } else if (result === "p2") {
    winnerKey = room.player2?.publicKey;
    winnerId = "p2";
  }

  const pot = room.entryFee * 2;
  const winAmount = pot * WIN_RATIO; // 75% = $1.75
  const fee = pot * FEE_RATIO * 2;  // 25% = $0.25 fee

  // Update leaderboard
  if (winnerId === "p1") {
    updateLeaderboard(room.player1.publicKey, room.player1.team, room.currency, winAmount);
    penalizeStreak(room.player2?.publicKey);
  } else if (winnerId === "p2") {
    updateLeaderboard(room.player2.publicKey, room.player2.team, room.currency, winAmount);
    penalizeStreak(room.player1.publicKey);
  }

  // Send winnings
  let payout = null;
  if (winnerKey) {
    payout = await sendWinnings(winnerKey, room.currency, winAmount);
  }

  broadcast(room, {
    type: "match_over",
    winner: winnerId,
    winnerKey,
    winAmount,
    fee,
    scores: {
      p1: room.penalties.p1.filter(Boolean).length,
      p2: room.penalties.p2.filter(Boolean).length,
    },
    penalties: room.penalties,
    payout,
  });

  console.log(`[MATCH] Over in room ${room.id}. Winner: ${winnerId} (${winnerKey?.slice(0, 8)})`);

  // Clean up after 30s
  setTimeout(() => rooms.delete(room.id), 30000);
}

// ============================================================
// WS MESSAGE HANDLER
// ============================================================
wss.on("connection", (ws) => {
  console.log(`[WS] Client connected. Total: ${wss.clients.size}`);

  ws.on("message", async (raw) => {
    try {
      const data = JSON.parse(raw);
      switch (data.type) {
        case "create_room":    createRoom(ws, data);           break;
        case "join_room":      joinRoom(ws, data);             break;
        case "confirm_payment": await confirmPayment(ws, data); break;
        case "shoot":          handleShot(ws, data);           break;
        case "ping":           send(ws, { type: "pong" });     break;
        default: console.log("[WS] Unknown message:", data.type);
      }
    } catch (e) {
      console.error("[WS] Error:", e.message);
    }
  });

  ws.on("close", () => {
    const clientInfo = clients.get(ws);
    if (clientInfo) {
      const room = rooms.get(clientInfo.roomId);
      if (room && room.status === "playing") {
        // Opponent wins if player disconnects
        const winnerId = clientInfo.playerId === "p1" ? "p2" : "p1";
        broadcast(room, { type: "opponent_disconnected", winner: winnerId });
        endMatch(room, winnerId);
      }
      clients.delete(ws);
    }
    console.log(`[WS] Client disconnected. Total: ${wss.clients.size}`);
  });

  ws.on("error", (e) => console.error("[WS] Socket error:", e.message));
});

// ============================================================
// START
// ============================================================
server.listen(PORT, () => {
  console.log(`✅ WC Penalty Backend running on port ${PORT}`);
  console.log(`   Solana: Mainnet`);
  console.log(`   Treasury: ${TREASURY_WALLET}`);
});
