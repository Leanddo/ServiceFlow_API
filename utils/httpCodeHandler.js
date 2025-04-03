exports.httpCode = (statusCode, message, res) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  // Se message for um objeto, usa-o diretamente, senão cria um objeto com a mensagem
  const responseMessage = typeof message === "object" ? message : { message };
  res.status(statusCode).json(responseMessage);
};


