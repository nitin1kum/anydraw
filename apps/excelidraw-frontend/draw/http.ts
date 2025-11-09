// http.ts
import { HTTP_BACKEND } from "@/config";
import axios from "axios";
import type { Shape, StoredShape } from "./Game";

export async function getExistingShapes(roomId: string): Promise<StoredShape[]> {
  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
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
