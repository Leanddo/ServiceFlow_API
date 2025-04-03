exports.checkToken = (req, res, next) => {
  const token = req.cookies.authcookie;

  if (typeof token !== "undefined") {
    console.log("Extrated token: ", token);

    if (!token) {
      res.status(401).json({ message: "Authentication required." });
    }
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        res.status(403).json({ message: "Invalid token" });
        return;
      }
      req.user = decoded;
      next();
    });
  } else {
    res.status(403).json({ message: "No token provided" });
  }
};
