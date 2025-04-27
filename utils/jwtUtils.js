const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { user_id: user.user_id,
        username: user.username,
        email: user.email
       },
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

exports.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    return decoded; 
  } catch (error) {
    console.error("Erro ao verificar o token JWT:", error);
    return null;
  }
};
