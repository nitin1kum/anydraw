import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";
import http from "http";

const PORT = Number(process.env.PORT) || 8080;

// Create HTTP server so Render can properly expose the WebSocket
const server = http.createServer();
const wss = new WebSocketServer({ server });

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
  lastPing?: number;
}

const users: User[] = [];

/** Verify JWT and return userId if valid */
function checkUser(token: string): string | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded?.userId || null;
  } catch (e) {
    console.error("[AUTH] JWT verification failed:", e);
    return null;
  }
}

/** Broadcast message to all users in a specific room */
function broadcastToRoom(roomId: string, payload: any) {
  const msg = JSON.stringify(payload);
  users.forEach((u) => {
    if (u.rooms.includes(roomId)) {
      try {
        u.ws.send(msg);
      } catch (e) {
        console.warn(`[Broadcast] Failed for ${u.userId}:`, e);
      }
    }
  });
}

/** Heartbeat: keep track of active connections */
function heartbeat() {
  const now = Date.now();
  for (let i = users.length - 1; i >= 0; i--) {
    const user = users[i];
    if (user && (!user.lastPing || now - user.lastPing > 45000)) {
      console.log(`[PING] Terminating stale connection for ${user.userId}`);
      try {
        user.ws.terminate();
      } catch {}
      users.splice(i, 1);
    } else {
      try {
        user?.ws.ping();
      } catch {}
    }
  }
}

// Run heartbeat every 30 seconds
setInterval(heartbeat, 30000);

wss.on("connection", (ws, request) => {
  const url = request.url;
  if (!url) {
    ws.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1] || "");
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);

  if (!userId) {
    console.warn("[WS] Connection rejected: invalid token");
    ws.close();
    return;
  }

  const user: User = { ws, rooms: [], userId, lastPing: Date.now() };
  users.push(user);
  console.log(`[WS] User connected: ${userId} (total: ${users.length})`);

  ws.on("pong", () => (user.lastPing = Date.now()));

  ws.on("message", async (data) => {
    let parsedData: any;
    try {
      parsedData =
        typeof data === "string"
          ? JSON.parse(data)
          : JSON.parse(data.toString());
    } catch (e) {
      console.error("[WS] Invalid JSON received:", data);
      return;
    }

    const { type } = parsedData;
    if (!type) return;

    switch (type) {
      case "join_room":
        user.rooms.push(String(parsedData.roomId));
        console.log(`[ROOM] ${user.userId} joined ${parsedData.roomId}`);
        break;

      case "leave_room":
        user.rooms = user.rooms.filter((r) => r !== String(parsedData.roomId));
        console.log(`[ROOM] ${user.userId} left ${parsedData.roomId}`);
        break;

      case "chat": {
        const { roomId, tempId } = parsedData;
        const messageContent = parsedData.shape
          ? JSON.stringify({ shape: parsedData.shape })
          : JSON.stringify({ message: parsedData.message });

        try {
          const saved = await prismaClient.chat.create({
            data: { roomId: Number(roomId), message: messageContent, userId },
          });

          console.log(`[DB] Shape stored with id ${saved.id} (room ${roomId})`);

          let shapeObj = null;
          try {
            const parsed = JSON.parse(messageContent);
            shapeObj = parsed.shape || null;
          } catch {}

          broadcastToRoom(String(roomId), {
            type: "chat",
            id: saved.id,
            tempId,
            shape: shapeObj,
            roomId,
          });
        } catch (e) {
          console.error("[DB] Error storing shape:", e);
        }
        break;
      }

      case "update": {
        const { roomId, id: shapeId, shape } = parsedData;
        try {
          await prismaClient.chat.update({
            where: { id: Number(shapeId) },
            data: { message: JSON.stringify({ shape }) },
          });
          console.log(`[DB] Shape ${shapeId} updated`);
          broadcastToRoom(String(roomId), {
            type: "update",
            id: shapeId,
            shape,
            roomId,
          });
        } catch (e) {
          console.error(`[DB] Error updating shape ${shapeId}:`, e);
        }
        break;
      }

      case "delete": {
        const { roomId, id: shapeId } = parsedData;
        if (Number.isNaN(Number(shapeId))) {
          console.warn(`[WS] Skipping delete for invalid ID: ${shapeId}`);
          break;
        }
        try {
          await prismaClient.chat.delete({ where: { id: Number(shapeId) } });
          console.log(`[DB] Shape ${shapeId} deleted`);
        } catch (e) {
          console.error(`[DB] Error deleting shape ${shapeId}:`, e);
        }
        broadcastToRoom(String(roomId), {
          type: "delete",
          id: shapeId,
          roomId,
        });
        break;
      }

      default:
        console.warn("[WS] Unknown message type:", type);
    }
  });

  ws.on("close", () => {
    const idx = users.findIndex((u) => u.ws === ws);
    if (idx !== -1) users.splice(idx, 1);
    console.log(
      `[WS] User disconnected: ${user.userId} (active: ${users.length})`
    );
  });

  ws.on("error", (err) => {
    console.error(`[WS] Error for user ${user.userId}:`, err);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[WS] Server running on ws://0.0.0.0:${PORT}`);
});
