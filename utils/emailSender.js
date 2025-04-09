const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

module.exports = async (email, code) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Lê o ficheiro do template
    const templatePath = path.join(
      __dirname,
      "../templates",
      "otpTemplate.html"
    );
    let htmlTemplate = fs.readFileSync(templatePath, "utf-8");
    // Substitui o {{CODE}} pelo código real
    htmlTemplate = htmlTemplate.replace("{{CODE}}", code);

    let info = await transporter.sendMail({
      from: `"ServiceFlow"`,
      to: email.trim(),
      subject: "O seu codigo de autenticação",
      html: htmlTemplate,
    });

    console.log("Email sent: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // rethrow the error if needed
  }
};
