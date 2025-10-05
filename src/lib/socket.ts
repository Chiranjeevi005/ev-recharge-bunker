import { Server as SocketIOServer } from "socket.io";
import redis from '@/lib/redis';

let io: SocketIOServer | null = null;

export function initSocket(server: any) {
  if (!io) {
    // Configure Socket.IO with Redis adapter for horizontal scaling
    io = new SocketIOServer(server, {
      path: "/api/socketio",
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      // Add connection options for better reliability
      transports: ["websocket", "polling"],
      allowEIO3: true
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Join a room based on user ID
      socket.on("join-user-room", (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined room user-${userId}`);
      });

      // Handle disconnection
      socket.on("disconnect", (reason) => {
        console.log("User disconnected:", socket.id, "Reason:", reason);
      });
      
      // Handle connection errors
      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });
    });

    // Only subscribe to Redis channels if Redis is available
    if (redis.isAvailable()) {
      // Subscribe to the client activity channel for MongoDB change streams
      redis.subscribe("client_activity_channel")
        .then(() => {
          console.log('Subscribed to client_activity_channel');
        })
        .catch(err => {
          console.error("Error subscribing to client_activity_channel:", err);
        });

      // Handle Redis messages and broadcast to Socket.io clients
      redis.on("message", (channel, message) => {
        try {
          const data = JSON.parse(message);
          
          if (channel === "client_activity_channel") {
            // Handle real-time events from MongoDB change streams
            switch (data.event) {
              case 'client_update':
                // Broadcast to admin dashboard
                io?.emit("client-update", data);
                // Also trigger eco stats update
                io?.emit("eco-stats-update", { event: 'eco_stats_update' });
                break;
              case 'station_update':
                // Broadcast to admin dashboard
                io?.emit("station-update", data);
                // Also trigger eco stats update
                io?.emit("eco-stats-update", { event: 'eco_stats_update' });
                break;
              case 'charging_session_update':
                // Broadcast to admin dashboard and specific user
                io?.emit("charging-session-update", data);
                if (data.fullDocument?.userId) {
                  io?.to(`user-${data.fullDocument.userId}`).emit("user-charging-session-update", data);
                }
                // Also trigger eco stats update
                io?.emit("eco-stats-update", { event: 'eco_stats_update' });
                break;
              case 'payment_update':
                // Broadcast to admin dashboard and specific user
                io?.emit("payment-update", data);
                if (data.fullDocument?.userId) {
                  io?.to(`user-${data.fullDocument.userId}`).emit("user-payment-update", data);
                }
                // Also trigger eco stats update
                io?.emit("eco-stats-update", { event: 'eco_stats_update' });
                break;
              case 'eco_stats_update':
                // Broadcast to admin dashboard
                io?.emit("eco-stats-update", data);
                break;
              default:
                console.log(`Unknown client activity event: ${data.event}`);
            }
          } else {
            // Handle legacy channels for backward compatibility
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