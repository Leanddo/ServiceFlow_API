const cron = require("node-cron");
const { Queues, Services, Businesses, User } = require("../models/index");
const sendEmail = require("../utils/emailSender");
const { Op } = require("sequelize");
const path = require("path");

// Tarefa agendada para rodar todos os dias às 8h
const scheduleNotificationAppointment = async () => {
  cron.schedule("43 20 * * *", async () => {
    try {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // Início do dia seguinte

      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999); // Fim do dia seguinte

      // Buscar filas para o dia seguinte
      const queues = await Queues.findAll({
        where: {
          queue_date: {
            [Op.between]: [tomorrow, endOfTomorrow], // Apenas serviços do dia seguinte
          },
        },
        include: [
          {
            model: Services,
            attributes: ["service_name"],
          },
          {
            model: Businesses,
            attributes: ["business_name", "business_address"],
          },
          {
            model: User,
            attributes: ["email", "username"],
          },
        ],
      });

      console.log(`Encontradas ${queues.length} filas.`);

      if (queues.length === 0) {
        console.log("Nenhuma fila encontrada para amanhã.");
        return;
      }

      // Enviar e-mails para os clientes
      for (const queue of queues) {
        const { service_name } = queue.Service;
        const { business_name, business_address } = queue.Business;
        const { email, username } = queue.User;

        const templatePath = path.join(
          __dirname,
          "../templates/notificationTemplate.html"
        );

        // Criar o link para o Google Maps
        const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          business_address
        )}`;

        const placeholders = {
          USERNAME: username,
          BUSINESS_NAME: business_name,
          BUSINESS_ADDRESS: business_address,
          GOOGLE_MAPS_LINK: googleMapsLink,
          SERVICE_NAME: service_name,
          QUEUE_DATE: new Date(queue.queue_date).toLocaleString(),
        };

        await sendEmail({
          to: email,
          subject: "Lembrete: Serviço Agendado para Amanhã",
          templatePath,
          placeholders,
        });
      }

      console.log("Notificações enviadas com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar notificações:", error);
    }
  });
};

module.exports = scheduleNotificationAppointment;
