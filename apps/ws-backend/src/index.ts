import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

/** Verify JWT and return userId if valid */
function checkUser(token: string): string | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded?.userId) return null;
    return decoded.userId as string;
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
        console.warn("ws Broadcast failed for user:", u.userId, e);
      }
    }
  });
}

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    ws.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1] || "");
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);

  if (!userId) {
    console.warn("ws Connection rejected: invalid token");
    ws.close();
    return;
  }

  const user: User = { ws, rooms: [], userId };
  users.push(user);
  console.log(`ws User connected: ${userId}, total users: ${users.length}`);

  ws.on("message", async function message(data) {
    let parsedData: any;
    try {
      parsedData = typeof data === "string" ? JSON.parse(data) : JSON.parse(data.toString());
    } catch (e) {
      console.error("ws Invalid JSON received:", data);
      return;
    }

    const { type } = parsedData;
    if (!type) return;

    
    // JOIN / LEAVE ROOM
    
    if (type === "join_room") {
      user.rooms.push(String(parsedData.roomId));
      console.log(`[ROOM] User ${user.userId} joined room ${parsedData.roomId}`);
      return;
    }

    if (type === "leave_room") {
      user.rooms = user.rooms.filter((r) => r !== String(parsedData.roomId));
      console.log(`[ROOM] User ${user.userId} left room ${parsedData.roomId}`);
      return;
    }

    
    // CREATE SHAPE (chat)
    
    if (type === "chat") {
      const roomId = parsedData.roomId;
      const tempId = parsedData.tempId || null;
      let message: string;

      if (parsedData.shape) {
        message = JSON.stringify({ shape: parsedData.shape });
      } else if (parsedData.message) {
        message =
          typeof parsedData.message === "string"
            ? parsedData.message
            : JSON.stringify(parsedData.message);
      } else {
        console.error("ws Missing shape/message in chat payload:", parsedData);
        return;
      }

      try {
        const saved = await prismaClient.chat.create({
          data: {
            roomId: Number(roomId),
            message,
            userId,
          },
        });

        console.log(`[DB] Shape stored with id ${saved.id} in room ${roomId}`);

        // Extract shape JSON
        const shapeObj = (() => {
          try {
            const parsed = JSON.parse(message);
            return parsed.shape || null;
          } catch {
            return null;
          }
        })();

        broadcastToRoom(String(roomId), {
          type: "chat",
          id: saved.id, // DB id (Int)
          tempId, // Echo back for replacement
          shape: shapeObj,
          roomId,
        });
      } catch (e) {
        console.error("[DB] Error storing shape:", e);
      }
      return;
    }

    
    // UPDATE SHAPE
    
    if (type === "update") {
      const roomId = parsedData.roomId;
      const shapeId = parsedData.id;
      let shape = parsedData.shape;

      try {
        if (typeof shape === "string") shape = JSON.parse(shape);
      } catch (e) {
        console.error("ws Failed to parse shape JSON:", e);
      }

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
      return;
    }

    
    // DELETE SHAPE
    
    if (type === "delete") {
      const roomId = parsedData.roomId;
      const shapeId = parsedData.id;

      // Skip deleting pending client shapes
      if (typeof shapeId !== "number" && isNaN(Number(shapeId))) {
        console.warn(`ws Skipping delete for non-numeric id: ${shapeId}`);
      } else {
        try {
          await prismaClient.chat.delete({ where: { id: Number(shapeId) } });
          console.log(`[DB] Shape ${shapeId} deleted`);
        } catch (e) {
          console.error(`[DB] Error deleting shape ${shapeId}:`, e);
        }
      }

      broadcastToRoom(String(roomId), {
        type: "delete",
        id: shapeId,
        roomId,
      });
      return;
    }

    console.warn("ws Unknown message type:", type);
  });

  ws.on("close", () => {
    console.log(`ws User disconnected: ${user.userId}`);
    const idx = users.findIndex((x) => x.ws === ws);
    if (idx !== -1) users.splice(idx, 1);
    console.log(`ws Active users: ${users.length}`);
  });
});

console.log("ws WebSocket Server running on ws://localhost:8080");
