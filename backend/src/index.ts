import express from "express";
import cors from "cors";
import connectDB from "./config/dbConfig.js";
import authRoutes from "./routes/authRoutes.js";
import providerServiceRoutes from "./routes/providerServiceRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import adminRoutes from "./routes/adminRoutes.js";

connectDB();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/service", providerServiceRoutes);

app.use("/api/users", userRoutes);

app.use("/api/admin", adminRoutes);


// create HTTP + WebSocket server
const server = createServer(app);

// configure socket.io
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// Track connected users
const connectedUsers = new Map<string, string>();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    //User registers themselves with their userId
    socket.on("register", (userId: string) => {
        connectedUsers.set(userId, socket.id);
    });

    // Cleanup
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        for (const [id, sId] of connectedUsers.entries()) {
            if (sId === socket.id) {
                connectedUsers.delete(id);
                break;
            }
        }
    });
});

export { io, connectedUsers };

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
