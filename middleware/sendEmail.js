import { createTransport } from "nodemailer";

const sendemailbro=(to,message,text)=>{

    const transporter=createTransport({
    host:process.env.HOST ,
  port:process.env.SPORT,
  auth: {
           user:process.env.USER,
           pass:process.env.PASS 
        } 
})

    transporter.sendMail({
        from:"iamraj@gmail.com",to,subject:message,text
    })
}

export default sendemailbro