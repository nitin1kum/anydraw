// http.ts
import axios from "axios";
import type { Shape, StoredShape } from "./Game";

const HTTP_BACKEND_URL =
  process.env.NEXT_PUBLIC_HTTP_BACKEND_URL || "http://localhost:3001";

export async function getExistingShapes(roomId: string): Promise<StoredShape[]> {
  const res = await axios.get(`${HTTP_BACKEND_URL}/chats/${roomId}`);
  const messages = res.data.messages || [];

  const shapes: StoredShape[] = messages.map((x: { id: string; message: string }) => {
    const messageData = JSON.parse(x.message);
    return {
      id: x.id,
      shape: messageData.shape as Shape,
    };
  });

  return shapes;
}
