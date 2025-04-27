const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

module.exports = async ({ to, subject, templatePath, placeholders,attachments }) => {
  try {
    // Configurar o transporte do nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Ler o template de e-mail
    let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

    // Substituir os placeholders no template
    for (const [key, value] of Object.entries(placeholders)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      htmlTemplate = htmlTemplate.replace(regex, value);
    }

    // Configurar e enviar o e-mail
    const info = await transporter.sendMail({
      from: `"ServiceFlow" <${process.env.EMAIL_USER}>`,
      to: to.trim(),
      subject: subject,
      html: htmlTemplate,
      attachments, // Adicionar os anexos
    });

    console.log("Email enviado: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    throw error;
  }
};
