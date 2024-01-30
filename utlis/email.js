const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transoprter
  const transoprter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define the email options
  const mailOptions = {
    from: 'Saw Thet from C4CODE <sawthet@c4code.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // Send the email
  await transoprter.sendMail(mailOptions);
};

module.exports = sendEmail;
