const validateAvailability = (availability) => {
  const validDays = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo",
  ];

  if (!Array.isArray(availability)) {
    throw new Error("A disponibilidade deve ser um array.");
  }

  availability.forEach((slot) => {
    if (!slot.day || !slot.start || !slot.end) {
      throw new Error("Cada horário deve conter 'day', 'start' e 'end'.");
    }

    if (!validDays.includes(slot.day)) {
      throw new Error(`O dia '${slot.day}' não é válido.`);
    }

    // Validação adicional para horários (opcional)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/; // Formato HH:mm
    if (!timeRegex.test(slot.start) || !timeRegex.test(slot.end)) {
      throw new Error(
        `Os horários 'start' e 'end' devem estar no formato HH:mm. Erro em: ${JSON.stringify(
          slot
        )}`
      );
    }
  });
};

module.exports = { validateAvailability };