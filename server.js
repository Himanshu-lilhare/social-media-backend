import app from "./app.js";
import { connectdb } from "./config/connectdb.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import { Server } from "socket.io";

mongoose.set("strictQuery", true);
connectdb();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
});

const server = app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});

const io = new Server(server, {
  pingTimeout: 6000,
  cors: {
    origin: process.env.FRONTENDURL,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

let users = [];
function addUser(userId, socketId) {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
}

function removeUser(socketId) {
  users = users.filter((user) => user.socketId !== socketId);
}

// find receiver of message
function findReceiver(receiverId) {
  return users.find((user) => user.userId === receiverId);
}

io.on("connection", (socket) => {
  // take usersId from client
  socket.on("addUser", (userId) => {
    console.log('usersAdded' + userId)
    addUser(userId, socket.id);
  });

  // taking message from client

  socket.on("sendmessage", ({ senderId, receiverId, message }) => {
    const receiver = findReceiver(receiverId);

    receiver &&
    io.to(receiver.socketId).emit("getMessage", {
      senderId,
      message,
    });
  });

  // get event for typing

  socket.on('typing',({receiverId})=>{
    console.log(receiverId)
   const receiver=findReceiver(receiverId)
   receiver && 
   io.to(receiver.socketId).emit("setIsTypingTrue");
  })
  socket.on('stoptyping',({receiverId})=>{
   const receiver=findReceiver(receiverId)
   receiver &&
   io.to(receiver.socketId).emit("setIsTypingFalse");
  })

  // sending who is in users array
  io.emit("getUsersOnline", users);

  // take disconnect event from frontend when user disconnect

  socket.on("disconnected", () => {
    console.log("someone disconnect");

    removeUser(socket.id);

    io.emit("getUsersOnline", users);
  });

  //
});

////////////////////////////////////////////////

// io.on("connection", (socket) => {
//   console.log("Connected to socket.io");
//   socket.on("setup", (userData) => {
//     socket.join(userData._id);
//     socket.emit("connected");
//   });

//   socket.on("typing", (room) => socket.in(room).emit("typing"));
//   socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

//   socket.on("new message", (newMessageRecieved) => {
//     var chat = newMessageRecieved.chat;

//     if (!chat.users) return console.log("chat.users not defined");

//     chat.users.forEach((user) => {
//       if (user._id == newMessageRecieved.sender._id) return;

//       socket.in(user._id).emit("message recieved", newMessageRecieved);
//     });
//   });

//   socket.off("setup", () => {
//     console.log("USER DISCONNECTED");
//     socket.leave(userData._id);
//   });
// });
