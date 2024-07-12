const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const msg = {
        from: '"Lestari" <main@lestari.com>',
        to,
        subject,
        html,
    };

    try {
        await transporter.sendMail(msg);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


module.exports = { sendEmail }