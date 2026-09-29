import nodemailer from 'nodemailer';
export const mail=(to,subject,text)=>{if(!process.env.SMTP_HOST)throw new Error('SMTP not configured');
 return nodemailer.createTransport({host:process.env.SMTP_HOST,port:+(process.env.SMTP_PORT||587),secure:process.env.SMTP_PORT==='465',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}:undefined}).sendMail({from:process.env.MAIL_FROM,to,subject,text})};
