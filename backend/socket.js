import Chat from "./models/Chat.js";

let ioInstance;

/**
 * 🔹 Set global Socket.IO instance
 */
export function setIO(io) {
  ioInstance = io;
  global.io = io; // make available everywhere (controllers, services, etc.)
}

/**
 * 🔹 Get IO instance anywhere in the app
 */
export function getIO() {
  if (!ioInstance) throw new Error("❌ Socket.IO not initialized!");
  return ioInstance;
}

/**
 * 🔹 Emit globally (useful for admin dashboards, notifications, etc.)
 */
export function emitToAll(event, payload) {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  } else {
    console.warn("⚠️ Tried to emit before IO initialized:", event);
  }
}

/**
 * 💬 Main Socket Handler — Chat + Typing + Read/Delivery + Live Tracking
 */
export default function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // ==================================================
    // 📥 JOIN / LEAVE CHAT ROOMS
    // ==================================================
    socket.on("joinChat", (bookingId) => {
      if (!bookingId) return;
      socket.join(`chat:${bookingId}`);
      console.log(`✅ Socket ${socket.id} joined chat:${bookingId}`);
    });

    socket.on("leaveChat", (bookingId) => {
      if (!bookingId) return;
      socket.leave(`chat:${bookingId}`);
      console.log(`👋 Socket ${socket.id} left chat:${bookingId}`);
    });

    // ==================================================
    // 💬 TYPING INDICATORS
    // ==================================================
    socket.on("chat:typing", ({ bookingId, from }) => {
      if (!bookingId) return;
      socket.to(`chat:${bookingId}`).emit("chat:typing", { bookingId, from });
    });

    socket.on("chat:stopTyping", ({ bookingId, from }) => {
      if (!bookingId) return;
      socket.to(`chat:${bookingId}`).emit("chat:stopTyping", { bookingId, from });
    });

    // ==================================================
    // ✅ DELIVERY STATUS (single → double tick)
    // ==================================================
    socket.on("chat:delivered", async (msgId) => {
      try {
        if (!msgId) return;
        const msg = await Chat.findByIdAndUpdate(
          msgId,
          { status: "delivered" },
          { new: true }
        );
        if (msg) {
          io.to(`chat:${msg.booking}`).emit("chat:update", {
            msgId,
            status: "delivered",
          });
          console.log(`📬 Delivered → ${msg._id}`);
        }
      } catch (err) {
        console.error("chat:delivered error:", err.message);
      }
    });

    // ==================================================
    // 👁️ MARK SINGLE MESSAGE AS READ
    // ==================================================
    socket.on("chat:readOne", async ({ bookingId, msgId }) => {
      try {
        if (!msgId) return;
        await Chat.findByIdAndUpdate(msgId, {
          status: "read",
          readAt: new Date(),
        });
        io.to(`chat:${bookingId}`).emit("chat:update", {
          msgId,
          status: "read",
        });
        console.log(`👁️ Message ${msgId} marked as read`);
      } catch (err) {
        console.error("chat:readOne error:", err.message);
      }
    });

    // ==================================================
    // 📚 MARK ALL MESSAGES IN CHAT AS READ
    // ==================================================
    socket.on("chat:read", async (bookingId) => {
      try {
        if (!bookingId) return;
        await Chat.updateMany(
          { booking: bookingId, status: { $ne: "read" } },
          { status: "read", readAt: new Date() }
        );
        io.to(`chat:${bookingId}`).emit("chat:updateBulk", {
          bookingId,
          status: "read",
        });
        console.log(`👁️ All messages in chat:${bookingId} marked as read`);
      } catch (err) {
        console.error("chat:read error:", err.message);
      }
    });

    // ==================================================
    // 🚗 LIVE LOCATION (for LiveMap tracking)
    // ==================================================
    socket.on("live:join", ({ sessionId }) => {
      if (!sessionId) return;
      socket.join(`live:${sessionId}`);
      console.log(`📡 Worker joined live session: ${sessionId}`);
    });

    socket.on("live:update", ({ sessionId, coords }) => {
      if (!sessionId || !coords) return;
      io.to(`live:${sessionId}`).emit("live:update", { coords });
    });

    socket.on("live:leave", ({ sessionId }) => {
      socket.leave(`live:${sessionId}`);
      console.log(`👋 Worker left live session: ${sessionId}`);
    });

    // ==================================================
    // 🚀 FILE DELIVERY STATUS
    // ==================================================
    socket.on("chat:fileUploaded", async ({ bookingId, msgId, fileUrl }) => {
      try {
        if (!bookingId || !msgId) return;
        await Chat.findByIdAndUpdate(msgId, { fileUrl, status: "sent" });
        io.to(`chat:${bookingId}`).emit("chat:update", {
          msgId,
          status: "sent",
          fileUrl,
        });
      } catch (err) {
        console.error("chat:fileUploaded error:", err.message);
      }
    });

    // ==================================================
    // 🛑 DISCONNECT HANDLER
    // ==================================================
    socket.on("disconnect", (reason) => {
      console.log(`❌ Socket disconnected: ${socket.id} (${reason})`);
    });
  });
}
