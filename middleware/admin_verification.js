const jwt = require("jsonwebtoken");

const admin_verification = (req, res, next) => {
  let token = req.headers["authorization"];
  if (token) {
    token = token.replace(/^Bearer\s+/, "");
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log({err})
        return res
          .status(401)
          .send({ auth: false, message: "Sesi tidak ada!" });
      } else {
        if(!decoded.id_admin){
          return res
            .status(401)
            .send({ auth: false, message: "Bukan Admin" });
        }
        const currentTime = Math.floor(Date.now() / 1000); 
        if (decoded.exp && decoded.exp < currentTime) {
          return res
            .status(401)
            .send({ auth: false, message: "Sesi kadaluarsa!" });
        }
        req.decoded = decoded; 
        next(); 
      }
    });
  } else {
    return res
      .status(401)
      .send({ auth: false, message: "Sesi tidak tersedia!" });
  }

}

module.exports = admin_verification;
