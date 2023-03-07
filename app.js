import  express  from "express";
import { config } from "dotenv";
import userRoute from "./routes/user.js";
import chatRouter  from "./routes/chat.js";
import { messageRouter } from "./routes/messages.js";
import { errorMiddlewarebro } from "./middleware/errorMiddleware.js";
import postRouter from "./routes/post.js";
import cookieParser from "cookie-parser";
import cors from "cors"


config({path:"./config/.env"})

const app=express()
app.use(cookieParser())
const router=express.Router()

app.use(cors({
    origin:process.env.FRONTENDURL,
    credentials:true,
    method:["GET","POST","PUT","DELETE"]
}))
app.use(express.json({limit:'50mb'}))
app.use(express.urlencoded({
    limit:'50mb',
    extended:true
}))



app.use("",userRoute)
app.use("",postRouter)
app.use('',chatRouter)
app.use('',messageRouter)
export default app
app.use(errorMiddlewarebro)