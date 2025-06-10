const {
  Queues,
  Services,
  Businesses,
  Professionals,
  User,
} = require("../models/index");
const { Op } = require("sequelize");

const sendEmail = require("../utils/emailSender");
const path = require("path");
const { createEvent } = require("ics");
const fs = require("fs");

exports.addToQueue = async (req, res) => {
  try {
    const { service_id } = req.params;
    const { queue_date } = req.body;

    // Verificar se o serviço existe
    const service = await Services.findByPk(service_id);
    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    // Verificar se o negócio existe
    const business = await Businesses.findByPk(service.business_id);
    if (!business) {
      return res.status(404).json({ message: "Negócio não encontrado." });
    }

    // Obter os horários de abertura e fechamento do negócio
    const openingTime = new Date(queue_date);
    openingTime.setHours(...business.opening_hour.split(":").map(Number), 0);

    const closingTime = new Date(queue_date);
    closingTime.setHours(...business.closing_hour.split(":").map(Number), 0);

    if (
      new Date(queue_date) < openingTime ||
      new Date(queue_date) >= closingTime
    ) {
      return res.status(400).json({
        message:
          "O horário solicitado está fora do horário de funcionamento do negócio.",
      });
    }

    // Obter a duração do serviço
    const serviceDuration = service.duration;

    // Gerar os horários disponíveis
    const availableTimes = [];
    for (
      let time = openingTime.getTime();
      time + serviceDuration * 60000 <= closingTime.getTime();
      time += serviceDuration * 60000
    ) {
      availableTimes.push(new Date(time).toISOString());
    }

    // Verificar se o horário solicitado está na lista de horários disponíveis
    if (!availableTimes.includes(new Date(queue_date).toISOString())) {
      return res.status(400).json({
        message: "O horário solicitado não está disponível.",
        availableTimes,
      });
    }

    // Verificar a disponibilidade dos profissionais
    const availableProfessionals = await Professionals.findAll({
      where: { business_id: service.business_id, isActive: true },
    });

    if (availableProfessionals.length === 0) {
      return res
        .status(400)
        .json({ message: "Nenhum profissional disponível para este horário." });
    }

    // Verificar se há filas existentes no mesmo horário para os profissionais disponíveis
    const conflictingQueues = await Queues.findAll({
      where: {
        business_id: service.business_id,
        queue_date,
        professional_id: availableProfessionals.map((p) => p.professional_id),
        status: { [Op.not]: "canceled" },
      },
    });

    if (conflictingQueues.length >= availableProfessionals.length) {
      return res.status(400).json({
        message: "Todos os profissionais estão ocupados neste horário.",
      });
    }

    // Selecionar um profissional disponível
    const assignedProfessional = availableProfessionals.find((professional) => {
      return !conflictingQueues.some(
        (queue) => queue.professional_id === professional.professional_id
      );
    });

    if (!assignedProfessional) {
      return res.status(400).json({
        message: "Nenhum profissional disponível para este horário.",
      });
    }

    // Determinar a posição na fila
    const queueCount = await Queues.count({
      where: { service_id },
    });
    const queue_position = queueCount + 1;

    // Criar a inscrição na fila
    const newQueue = await Queues.create({
      queue_position,
      queue_estimate_wait_time: `${Math.floor(service.duration / 60)}:${service.duration % 60
        }:00`, // Formato HH:mm:ss
      queue_date,
      user_id: req.user.user_id,
      service_id,
      business_id: service.business_id,
      professional_id: assignedProfessional.professional_id,
    });

    // Gerar o arquivo .ics
    const event = {
      start: [
        new Date(queue_date).getFullYear(),
        new Date(queue_date).getMonth() + 1,
        new Date(queue_date).getDate(),
        new Date(queue_date).getHours(),
        new Date(queue_date).getMinutes(),
      ],
      duration: {
        hours: Math.floor(service.duration / 60),
        minutes: service.duration % 60,
      },
      title: `Serviço: ${service.service_name}`,
      description: `Inscrição no serviço ${service.service_name} no negócio ${business.business_name}.`,
      location: business.business_address,
      url: "https://serviceflow.me",
      organizer: { name: "ServiceFlow", email: "no-reply@serviceflow.me" },
      attendees: [{ name: req.user.username, email: req.user.email }],
    };

    createEvent(event, async (error, value) => {
      if (error) {
        console.error("Erro ao criar o arquivo .ics:", error);
        return res
          .status(500)
          .json({ message: "Erro ao criar o evento no calendário." });
      }

      // Salvar o arquivo .ics temporariamente
      const icsFilePath = path.join(
        __dirname,
        "../temp",
        `queue_${newQueue.queue_id}.ics`
      );
      fs.writeFileSync(icsFilePath, value);

      // Enviar o e-mail com o arquivo .ics anexado
      const templatePath = path.join(
        __dirname,
        "../templates/queueConfirmationTemplate.html"
      );

      const placeholders = {
        USERNAME: req.user.username,
        BUSINESS_NAME: business.business_name,
        SERVICE_NAME: service.service_name,
        QUEUE_DATE: new Date(queue_date).toLocaleString(),
        DELETE_LINK: `${process.env.HOST}/user/account/appointments`,
      };

      await sendEmail({
        to: req.user.email,
        subject: "Confirmação de Inscrição na Fila",
        templatePath,
        placeholders,
        attachments: [
          {
            filename: `queue_${newQueue.queue_id}.ics`,
            path: icsFilePath,
          },
        ],
      });

      // Remover o arquivo .ics após o envio
      fs.unlinkSync(icsFilePath);

      res.status(201).json({
        message: "Inscrição na fila realizada com sucesso.",
        queue: newQueue,
      });
    });
  } catch (error) {
    console.error("Erro ao adicionar à fila:", error);
    res.status(500).json({ message: "Erro ao adicionar à fila.", error });
  }
};

exports.removeFromQueue = async (req, res) => {
  try {
    const { queue_id } = req.params;

    // Verificar se a inscrição existe
    const queue = await Queues.findByPk(queue_id);

    if (!queue) {
      return res
        .status(404)
        .json({ message: "Inscrição na fila não encontrada." });
    }

    // Verificar se o cliente é o dono da inscrição
    if (queue.user_id !== req.user.user_id) {
      return res
        .status(403)
        .json({ message: "Não tem permissão para cancelar esta inscrição." });
    }

    // Remover a inscrição
    await queue.destroy();

    res
      .status(200)
      .json({ message: "Inscrição na fila removida com sucesso." });
  } catch (error) {
    console.error("Erro ao remover inscrição da fila:", error);
    res
      .status(500)
      .json({ message: "Erro ao remover inscrição da fila.", error });
  }
};

exports.getAvailableTimes = async (req, res) => {
  try {
    const { service_id, date } = req.params;

    // Verificar se o serviço existe
    const service = await Services.findByPk(service_id);
    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    // Verificar se o negócio existe
    const business = await Businesses.findByPk(service.business_id);
    if (!business) {
      return res.status(404).json({ message: "Negócio não encontrado." });
    }

    // Obter os horários de abertura e fechamento do negócio
    const openingTime = new Date(date);
    openingTime.setHours(...business.opening_hour.split(":").map(Number), 0);

    const closingTime = new Date(date);
    closingTime.setHours(...business.closing_hour.split(":").map(Number), 0);

    // Obter a duração do serviço
    const serviceDuration = service.duration;

    // Obter os horários já ocupados globalmente (todos os serviços do mesmo negócio)
    const queues = await Queues.findAll({
      where: {
        business_id: service.business_id, // Buscar todas as filas do mesmo negócio
        queue_date: {
          [Op.between]: [openingTime, closingTime],
        },
      },
      include: [{ model: Professionals, attributes: ["professional_id"] }],
    });

    // Criar uma lista de horários ocupados por profissional
    const occupiedTimes = {};
    queues.forEach((queue) => {
      if (!occupiedTimes[queue.professional_id]) {
        occupiedTimes[queue.professional_id] = [];
      }
      occupiedTimes[queue.professional_id].push(
        new Date(queue.queue_date).getTime()
      );
    });

    // Obter os profissionais disponíveis
    const availableProfessionals = await Professionals.findAll({
      where: { business_id: service.business_id, isActive: true },
    });

    if (availableProfessionals.length === 0) {
      return res
        .status(400)
        .json({ message: "Nenhum profissional disponível." });
    }

    // Gerar os horários disponíveis
    const availableTimes = [];
    for (
      let time = openingTime.getTime();
      time + serviceDuration * 60000 <= closingTime.getTime();
      time += serviceDuration * 60000
    ) {
      const timeSlot = new Date(time);

      // Verificar se há pelo menos um profissional disponível para o horário
      const isAvailable = availableProfessionals.some((professional) => {
        const professionalOccupiedTimes =
          occupiedTimes[professional.professional_id] || [];
        return !professionalOccupiedTimes.includes(timeSlot.getTime());
      });

      if (isAvailable) {
        availableTimes.push(timeSlot);
      }
    }

    res.status(200).json({
      availableTimes: availableTimes.map((time) => time.toISOString()),
    });
  } catch (error) {
    console.error("Erro ao buscar horários disponíveis:", error);
    res
      .status(500)
      .json({ message: "Erro ao buscar horários disponíveis.", error });
  }
};

exports.addToQueueOwner = async (req, res) => {
  try {
    const { service_id } = req.params;
    const { queue_date, client_name, client_email } = req.body;

    // Verificar se o serviço existe
    const service = await Services.findByPk(service_id);
    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    // Verificar se o negócio existe
    const business = await Businesses.findByPk(service.business_id);
    if (!business) {
      return res.status(404).json({ message: "Negócio não encontrado." });
    }

    // Verificar se o usuário autenticado é Owner ou Manager
    const professional = await Professionals.findOne({
      where: { user_id: req.user.user_id, business_id: business.business_id },
    });

    if (!professional) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    if (!["Owner", "Manager"].includes(professional.role)) {
      return res.status(403).json({
        message: "Não tem permissão para realizar esta ação.",
      });
    }

    const user = await User.findOne({ where: { email: client_email } });

    // Obter os horários de abertura e fechamento do negócio
    const openingTime = new Date(queue_date);
    openingTime.setHours(...business.opening_hour.split(":").map(Number), 0);

    const closingTime = new Date(queue_date);
    closingTime.setHours(...business.closing_hour.split(":").map(Number), 0);

    if (
      new Date(queue_date) < openingTime ||
      new Date(queue_date) >= closingTime
    ) {
      return res.status(400).json({
        message:
          "O horário solicitado está fora do horário de funcionamento do negócio.",
      });
    }

    // Verificar a disponibilidade dos profissionais
    const availableProfessionals = await Professionals.findAll({
      where: { business_id: service.business_id, isActive: true },
    });

    if (availableProfessionals.length === 0) {
      return res
        .status(400)
        .json({ message: "Nenhum profissional disponível para este horário." });
    }

    // Verificar conflitos de horários, ignorando filas com status "canceled"
    const conflictingQueues = await Queues.findAll({
      where: {
        business_id: service.business_id,
        queue_date,
        professional_id: availableProfessionals.map((p) => p.professional_id),
        status: { [Op.not]: "canceled" },
      },
    });

    if (conflictingQueues.length >= availableProfessionals.length) {
      return res.status(400).json({
        message: "Todos os profissionais estão ocupados neste horário.",
      });
    }

    // Selecionar um profissional disponível
    const assignedProfessional = availableProfessionals.find((professional) => {
      return !conflictingQueues.some(
        (queue) => queue.professional_id === professional.professional_id
      );
    });

    if (!assignedProfessional) {
      return res.status(400).json({
        message: "Nenhum profissional disponível para este horário.",
      });
    }

    // Determinar a posição na fila
    const queueCount = await Queues.count({
      where: { service_id },
    });
    const queue_position = queueCount + 1;

    // Criar a inscrição na fila
    const newQueue = await Queues.create({
      queue_position,
      queue_estimate_wait_time: `${Math.floor(service.duration / 60)}:${service.duration % 60
        }:00`, // Formato HH:mm:ss
      queue_date,
      client_name, // Nome do cliente
      client_email, // E-mail do cliente
      user_id: user ? user.user_id : null, // Associar o user_id se o usuário existir
      service_id,
      business_id: service.business_id,
      professional_id: assignedProfessional.professional_id,
    });

    // Gerar o arquivo .ics
    const event = {
      start: [
        new Date(queue_date).getFullYear(),
        new Date(queue_date).getMonth() + 1,
        new Date(queue_date).getDate(),
        new Date(queue_date).getHours(),
        new Date(queue_date).getMinutes(),
      ],
      duration: {
        hours: Math.floor(service.duration / 60),
        minutes: service.duration % 60,
      },
      title: `Serviço: ${service.service_name}`,
      description: `Inscrição no serviço ${service.service_name} no negócio ${business.business_name}.`,
      location: business.business_address,
      url: "https://serviceflow.me",
      organizer: { name: "ServiceFlow", email: "no-reply@serviceflow.me" },
      attendees: [
        {
          name: client_name,
          email: client_email,
        },
      ],
    };

    createEvent(event, async (error, value) => {
      if (error) {
        console.error("Erro ao criar o arquivo .ics:", error);
        return res
          .status(500)
          .json({ message: "Erro ao criar o evento no calendário." });
      }

      // Salvar o arquivo .ics temporariamente
      const icsFilePath = path.join(
        __dirname,
        "../temp",
        `queue_${newQueue.queue_id}.ics`
      );
      fs.writeFileSync(icsFilePath, value);

      // Enviar o e-mail com o arquivo .ics anexado
      const templatePath = path.join(
        __dirname,
        "../templates/queueConfirmationTemplate.html"
      );

      const placeholders = {
        USERNAME: client_name,
        BUSINESS_NAME: business.business_name,
        SERVICE_NAME: service.service_name,
        QUEUE_DATE: new Date(queue_date).toLocaleString(),
        DELETE_LINK: `https://serviceflow.me/queues/${newQueue.queue_id}/delete`,
      };

      await sendEmail({
        to: client_email,
        subject: "Confirmação de Inscrição na Fila",
        templatePath,
        placeholders,
        attachments: [
          {
            filename: `queue_${newQueue.queue_id}.ics`,
            path: icsFilePath,
          },
        ],
      });

      // Remover o arquivo .ics após o envio
      fs.unlinkSync(icsFilePath);

      res.status(201).json({
        message: "Inscrição na fila realizada com sucesso.",
        queue: newQueue,
      });
    });
  } catch (error) {
    console.error("Erro ao adicionar à fila:", error);
    res.status(500).json({ message: "Erro ao adicionar à fila.", error });
  }
};

exports.getUserQueues = async (req, res) => {
  try {
    const user_id = req.user.user_id; 

    const queues = await Queues.findAll({
      where:
        { user_id },
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
          model: Professionals,
          attributes: ["professional_id", "user_id"], 
        },
      ],
      attributes: [
        "queue_id",
        "queue_position",
        "queue_estimate_wait_time",
        "queue_date",
        "status",
        "user_id", 
      ],
      order: [["queue_date", "ASC"]], 
    });

    if (queues.length === 0) {
      return res.status(404).json({
        message: "Nenhuma fila encontrada para o usuário.",
      });
    }

    const formattedQueues = queues.map((queue) => ({
      queue_id: queue.queue_id,
      queue_position: queue.queue_position,
      queue_estimate_wait_time: queue.queue_estimate_wait_time,
      queue_date: queue.queue_date,
      status: queue.status,
      service_name: queue.Service.service_name,
      business_name: queue.Business.business_name,
      business_address: queue.Business.business_address,
      isProfessional: queue.Professional?.user_id === user_id, 
    }));

    res.status(200).json(formattedQueues);
  } catch (error) {
    console.error("Erro ao buscar filas do usuário:", error);
    res.status(500).json({ message: "Erro ao buscar filas do usuário.", error });
  }
};

exports.getQueues = async (req, res) => {
  try {
    const { service_id, start_date, end_date } = req.query; // filtros opcionais
    const { business_id } = req.params; // business_id da rota

    // Buscar o profissional associado ao usuário autenticado
    const professional = await Professionals.findOne({
      where: {
        user_id: req.user.user_id,
        business_id
      },
    });

    if (!professional) {
      return res.status(404).json({ message: "Profissional não encontrado." });
    }

    // Verificar se o business_id da rota existe
    const business = await Businesses.findByPk(business_id);
    if (!business) {
      return res.status(404).json({ message: "Negócio não encontrado." });
    }

    // Verificar se o profissional pertence ao negócio (business_id)
    if (professional.business_id !== Number(business_id)) {
      console.log("business_id da rota:", business_id, typeof business_id);
      console.log("business_id do profissional:", professional.business_id, typeof professional.business_id);
      return res
        .status(403)
        .json({ message: "Profissional não autorizado para este negócio." });
    }

    // Construir filtros
    const filters = {
      business_id: business_id, // obrigatório usar business_id da rota
    };

    // Se o usuário for Owner ou Manager, verá todas filas do negócio
    // Senão, só verá filas dele mesmo
    if (!["Owner", "Manager"].includes(professional.role)) {
      filters.professional_id = professional.professional_id;
    }

    if (service_id) {
      filters.service_id = service_id;
    }

    if (start_date && end_date) {
      filters.queue_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)],
      };
    }

    // Buscar as filas com filtros
    const queues = await Queues.findAll({
      where: filters,
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
          attributes: ["username", "email"],
        },
      ],
      attributes: [
        "queue_id",
        "queue_position",
        "queue_estimate_wait_time",
        "queue_date",
        "status",
        "client_name",
        "client_email",
        "user_id",
      ],
      order: [["queue_date", "ASC"]],
    });

    if (queues.length === 0) {
      return res.status(404).json({
        message: "Nenhuma inscrição encontrada com os filtros aplicados.",
      });
    }

    // Formatar resposta
    const formattedQueues = queues.map((queue) => ({
      queue_id: queue.queue_id,
      queue_position: queue.queue_position,
      queue_estimate_wait_time: queue.queue_estimate_wait_time,
      queue_date: queue.queue_date,
      status: queue.status,
      client_name: queue.user_id ? queue.User.username : queue.client_name,
      client_email: queue.user_id ? queue.User.email : queue.client_email,
      service_name: queue.Service.service_name,
      business_name: queue.Business.business_name,
      business_address: queue.Business.business_address,
    }));

    res.status(200).json(formattedQueues);
  } catch (error) {
    console.error("Erro ao buscar filas:", error);
    res.status(500).json({ message: "Erro ao buscar filas.", error });
  }
};

exports.updateQueueStatus = async (req, res) => {
  try {
    const { queue_id } = req.params;
    const { status } = req.body;

    const validStatuses = ["waiting", "in_progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Status inválido." });
    }

    const queue = await Queues.findByPk(queue_id);
    if (!queue) {
      return res.status(404).json({ message: "Fila não encontrada." });
    }

    const isClient = queue.user_id === req.user.user_id;
    const isProfessional = await Professionals.findOne({
      where: {
        user_id: req.user.user_id,
        professional_id: queue.professional_id,
      },
    });

    if (isClient) {
      if (status !== "cancelled") {
        return res.status(403).json({
          message: "Clientes só podem alterar o status para 'cancelled'.",
        });
      }
    } else if (!isProfessional) {
      return res.status(403).json({
        message: "Você não tem permissão para alterar o status desta fila.",
      });
    }

    queue.status = status;
    await queue.save();

    // Se status for "completed", enviar email para avaliar
    if (status === "completed") {
      // Buscar utilizador para pegar email e username
      const user = await User.findByPk(queue.user_id);
      if (user) {
        const placeholders = {
          USERNAME: user.username,
          SERVICE_REVIEW_LINK: `${process.env.HOST}/review/${queue.service_id}`,
        };

        const templatePath = path.join(
          __dirname,
          "../templates/reviewTemplate.html"
        );

        try {
          await sendEmail({
            to: user.email,
            subject: "Avalie o serviço que acabou de utilizar",
            templatePath,
            placeholders,
          });
        } catch (emailError) {
          console.error("Erro ao enviar email de avaliação:", emailError);
          // Não bloqueia a resposta, só regista o erro
        }
      }
    }

    res.status(200).json({
      message: "Status da fila atualizado com sucesso.",
      queue,
    });
  } catch (error) {
    console.error("Erro ao atualizar o status da fila:", error);
    res.status(500).json({ message: "Erro ao atualizar o status da fila.", error });
  }
};