const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "http://localhost:5500",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
});

server.listen(3000, () => console.log("Server started"));

const users = {};

io.on("connection", socket => {
    socket.on("new-user", name => {
        users[socket.id] = name
        socket.broadcast.emit("user-connected", name)
    });

    socket.on("send-chat-message", message => {
        socket.broadcast.emit("chat-message", { message: message, name: users[socket.id] })
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit("user-disconnected", users[socket.id])
        delete users[socket.id]
    });
});