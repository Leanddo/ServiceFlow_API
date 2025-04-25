const {
  Queues,
  Services,
  Businesses,
  Professionals,
  User
} = require("../models/index");
const { Op } = require("sequelize");

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
      queue_estimate_wait_time: `${Math.floor(service.duration / 60)}:${
        service.duration % 60
      }:00`, // Formato HH:mm:ss
      queue_date,
      user_id: req.user.user_id,
      service_id,
      business_id: service.business_id,
      professional_id: assignedProfessional.professional_id,
    });

    res.status(201).json({
      message: "Inscrição na fila realizada com sucesso.",
      queue: newQueue,
    });
  } catch (error) {
    console.error("Erro ao adicionar à fila:", error);
    res.status(500).json({ message: "Erro ao adicionar à fila.", error });
  }
};

exports.getQueueByService = async (req, res) => {
  try {
    const { service_id } = req.params;

    // Obter a fila do serviço
    const queue = await Queues.findAll({
      where: { service_id },
      include: [
        {
          model: Professionals,
          include: [
            {
              model: User, // Relacionamento com a tabela Users
              attributes: ["username", "email"], // Buscar apenas 'name' e 'email'
            },
          ],
          attributes: [], // Não precisamos de outros campos de Professionals
        },
        {
          model: Services, // Relacionamento com a tabela Services
          attributes: ["service_name"], // Buscar apenas 'service_name'
        },
      ],
      attributes: [
        "queue_id",
        "queue_position",
        "queue_estimate_wait_time",
        "queue_date",
      ], // Campos da tabela Queues
      order: [["queue_position", "ASC"]],
    });

    res.status(200).json(queue);
  } catch (error) {
    console.error("Erro ao buscar fila:", error);
    res.status(500).json({ message: "Erro ao buscar fila.", error });
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

    res.status(200).json({ message: "Inscrição na fila removida com sucesso." });
  } catch (error) {
    console.error("Erro ao remover inscrição da fila:", error);
    res.status(500).json({ message: "Erro ao remover inscrição da fila.", error });
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
