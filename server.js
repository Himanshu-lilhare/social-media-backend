import app from "./app.js";
import { connectdb } from "./config/connectdb.js";
import cloudinary from "cloudinary"
import mongoose from "mongoose";
import { Server } from "socket.io";

mongoose.set('strictQuery', true)
connectdb()

cloudinary.v2.config({
   cloud_name:process.env.CLOUDNAME,
   api_key:process.env.APIKEY,
   api_secret:process.env.APISECRET

})

const server = app.listen(process.env.PORT,()=>{
   console.log(`server is running on port ${process.env.PORT}`) 
})


const io=new Server(server,{
   pingTimeout:6000,
   cors:{
      origin:process.env.FRONTENDURL,
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
       
   }
})


io.on('connection',(socket)=>{
   console.log('connected')


   socket.on('setUp',(userData)=>{
     socket.join(userData._id)
     socket.emit('connected')
     
   })

     socket.on("joinchat", (room) => {
      console.log("User Joined Room: " + room)
    socket.join(room);

   ;
  });

  socket.on('newmessage',(newMessageReceived)=>{
   let chat=newMessageReceived.chat
   if(!chat.users) return console.log('chat users not defined')

   chat.users.forEach(user => {
       if(user._id.toString()===newMessageReceived.sender._id.toString()) return

       socket.in(user._id).emit('messagereceived',newMessageReceived)
   });
  })

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
  

})






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