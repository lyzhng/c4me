const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET_KEY || 'pokTGERW54389e#@$%mans12$@!$!#$^#%$';

const jwtAuth = function(req, res, next) {
  const token = req.body.token || req.query.token || req.cookies.token;
  if (!token) {
    res.status(401).send('Unauthorized: No token provided');
  } else {
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token');
      } else {
        req.userid = decoded.userid;
        next();
      }
    });
  }
};

module.exports = jwtAuth;
