const { sendSMS } = require("../utils/SMSSender");
const crypto = require('crypto');

exports.SendSMSOTP = async (req, res) => {
  const { phone } = req.body;

  const code = crypto.randomInt(100000, 999999).toString();

  
};
