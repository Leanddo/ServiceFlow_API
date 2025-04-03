const jwt = require("jsonwebtoken");

exports.generateToken = (userId) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { user_id: userId },
      process.env.JWTSECRET,
      { expiresIn: "1w" },
      (err, token) => {
        if (err) {
          reject("Erro ao gerar o token JWT");
        } else {
          resolve(token);
        }
      }
    );
  });
};

