var nodemailer = require('nodemailer');

console.log('testing email')

var transporter = nodemailer.createTransport({
  host: 'contabo2.matb.it',
});

var mailOptions = {
  from: 'noreply@matb.it',
  to: 'emanuele.paolini@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});