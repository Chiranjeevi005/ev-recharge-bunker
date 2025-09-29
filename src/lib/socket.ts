import { Server as SocketIOServer } from "socket.io";
import redis from '@/lib/redis';

type SocketIOApiResponse = any;

let io: SocketIOServer | null = null;

export function initSocket(server: any) {
  if (!io) {
    io = new SocketIOServer(server, {
      path: "/api/socketio",
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Join a room based on user ID
      socket.on("join-user-room", (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined room user-${userId}`);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    // Only subscribe to Redis channels if Redis is available
    if (redis.isAvailable()) {
      redis.subscribe("charging-session-update")
        .then(count => {
          console.log(`Subscribed to charging-session-update channel. ${count} total subscriptions`);
        })
        .catch(err => {
          console.error("Error subscribing to charging-session-update:", err);
        });

      redis.subscribe("payment-update")
        .then(count => {
          console.log(`Subscribed to payment-update channel. ${count} total subscriptions`);
        })
        .catch(err => {
          console.error("Error subscribing to payment-update:", err);
        });

      redis.subscribe("slot-availability-update")
        .then(count => {
          console.log(`Subscribed to slot-availability-update channel. ${count} total subscriptions`);
        })
        .catch(err => {
          console.error("Error subscribing to slot-availability-update:", err);
        });

      // Handle Redis messages and broadcast to Socket.io clients
      redis.on("message", (channel, message) => {
        try {
          const data = JSON.parse(message);
          
          switch (channel) {
            case "charging-session-update":
              io?.to(`user-${data.userId}`).emit("charging-session-update", data);
              break;
            case "payment-update":
              io?.to(`user-${data.userId}`).emit("payment-update", data);
              break;
            case "slot-availability-update":
              // Broadcast to all users or specific users based on your needs
              io?.emit("slot-availability-update", data);
              break;
            default:
              console.log(`Unknown channel: ${channel}`);
          }
        } catch (error) {
          console.error("Error parsing Redis message:", error);
        }
      });

      console.log("Socket.io server initialized with Redis Pub/Sub");
    } else {
      console.log("Socket.io server initialized without Redis (Redis not available)");
    }
  }

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}