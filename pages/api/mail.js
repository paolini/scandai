import nodemailer from 'nodemailer'

console.log('testing email')

function createTransporter() {
  const host = process.env.SMTP_HOST
  if (!host) {
    console.log(`Error configuring email: SMTP_HOST not defined`)
    return null
  }
  console.log(`Configuring email: SMTP_HOST=${host}`)  

  let port = process.env.SMTP_PORT
  if (port) port = parseInt(port)
  if (isNaN(port) || !port) port = 465
  console.log(`SMTP_PORT=${JSON.stringify(port)}`)

  let auth = {}
  const user = process.env.SMTP_AUTH_USER
  const pass = process.env.SMTP_AUTH_PASS

  let secure = true // use SSL

  if (process.env.SMTP_NO_SSL) {
    secure = false
    console.log(`SMTP SSL disabled (undefine SMTP_NO_SSL to enable)`)
  } else {
    console.log(`SMTP SSL enabled (define SMTP_NO_SSL to disable)`)
  }

  if (user) {
    console.log(`SMTP_AUTH_USER=${user}`)
    if (pass) {
      console.log(`SMTP_AUTH_PASS=********`)
    } else {
      console.log(`Error configuring email: SMTP_AUTH_PASS not defined`)
    }
    auth = { user, pass }
  }

  const tls = { rejectUnauthorized: false }
  const config = { host, port, secure, auth, tls }

  console.log("SMTP config:", JSON.stringify(config))

  return nodemailer.createTransport(config)
}

const transporter = createTransporter()

export default function handler(req, res) {
    console.log('>>> mail:', JSON.stringify(req.body))

    const from = process.env.EMAIL_FROM || 'noreply@matb.it'

    const mailOptions = {
      from,
      to: 'emanuele.paolini@gmail.com',
      subject: 'TEST 8',
      text: 'That was easy!',
    }
    
    console.log('mailOptions:', JSON.stringify(mailOptions))

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
        res.status(400).json({ 
          error: 'errore invio email',
          info: error })
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json({ 
        data: 'ok',
        info: info.response,
      })
    }
  })
}
  
  