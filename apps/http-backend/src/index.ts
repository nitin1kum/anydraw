import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import bcrypt from "bcrypt";
import {
  CreateUserSchema,
  SigninSchema,
  CreateRoomSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = Number(process.env.PORT) || 3001;

app.post("/signup", async (req, res) => {
  console.log("Signup request body:", req.body);
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    res
      .status(400)
      .json({ message: "Incorrect inputs", errors: parsedData.error.issues });
    return;
  }

  try {
    const { username, password, name } = parsedData.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.create({
      data: { email: username, password: hashedPassword, name },
    });
    console.log("User created with ID:", user.id);
    console.log("User created with email:", user.email);
    console.log("User created with name:", user.name);
    console.log("User created with password ", hashedPassword);

    res
      .status(201)
      .json({ message: "User created successfully", userId: user.id });
    return;
  } catch (e) {
    res.status(411).json({ message: "User already exists with this email" });
    return;
  }
});

app.post("/signin", async (req, res) => {
  console.log("Signin request body:", req.body);
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Incorrect inputs" });
    return;
  }

  const { username, password } = parsedData.data;
  const user = await prismaClient.user.findFirst({
    where: { email: username },
  });

  if (!user) {
    res.status(403).json({ message: "Invalid credentials" });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    res.status(403).json({ message: "Invalid Password" });
    return;
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  console.log("Generated JWT token for user ID:", user.id);
  console.log("Token:", token);
  res.json({ token });
});

app.post("/room", middleware, async (req, res) => {
  console.log("Create room request body:", req.body);
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "Incorrect inputs",
    });
    return;
  }
  // @ts-ignore: TODO: Fix this
  const userId = req.userId;

  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      },
    });

    res.json({
      roomId: room.id,
    });
  } catch (e) {
    res.status(411).json({
      message: "Room already exists with this name",
    });
  }
});

app.get("/user", middleware, async (req, res) => {
  console.log("Get user request");
  //@ts-ignore
  const userId = req.userId;
  console.log("token from middleware:", req.headers.authorization);
  console.log("User ID from token:", userId);
  console.log(typeof userId);
  try {
    const user = await prismaClient.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!user) {
      res.json({
        message: "Incorrect inputs or NULL user",
      });
      return;
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
    console.log("User found:", user);
  } catch (e) {
    res.status(411).json({
      message: "cannot find user",
    });
  }
});

app.get("/rooms", middleware, async (req, res) => {
  console.log("Get rooms request");
  //@ts-ignore
  const userId = req.userId;
  console.log("token from middleware:", req.headers.authorization);
  console.log("User ID from token:", userId);
  console.log(typeof userId);

  try {
    const rooms = await prismaClient.room.findMany({
      where: {
        adminId: userId,
      },
      orderBy: {
        id: "desc",
      },
    });

    if (!rooms) {
      res.json({
        message: "Incorrect inputs or NULL rooms",
      });
      return;
    }
    res.json({
      rooms: rooms,
    });
    console.log("Rooms found:", rooms);
  } catch (e) {
    res.status(411).json({
      message: "cannot find rooms",
    });
  }
});

app.get("/chats/:roomId", async (req, res) => {
  console.log("Get chats request for roomId:", req.params.roomId);
  try {
    const roomId = Number(req.params.roomId);
    console.log(req.params.roomId);
    const messages = await prismaClient.chat.findMany({
      where: {
        roomId: roomId,
      },
      orderBy: {
        id: "asc",
      },
      take: 5000,
    });
    if (messages.length == 0) {
      console.log("No messages found for roomId:", roomId);
      return;
    }
    console.log("Messages found for roomId:", roomId, messages);
    res.json({
      messages,
    });
  } catch (e) {
    console.log(e);
    res.json({
      messages: [],
    });
  }
});

app.get("/room/:slug", async (req, res) => {
  console.log("Get room request for slug:", req.params.slug);
  const slug = req.params.slug;
  const room = await prismaClient.room.findFirst({
    where: {
      slug,
    },
  });

  res.json({
    room,
  });
  console.log("Room found roomid:", room);
});

app.listen(PORT, () => {
  console.log(`HTTP backend is running on port ${PORT}`);
});
