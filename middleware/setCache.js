const cache = require('./cache')

const setCache = (duration, useDecoded = false) => (req, res, next) => {
    let key = req.originalUrl;

    if(useDecoded && req.decoded ){
        if (req.decoded.id_user) {  
            key = `${key}@id_user${req.decoded.id_user}`;
        }else if (req.decoded.id_admin) {
            key = `${key}@id_admin${req.decoded.id_admin}`;        
        }    
    }
    const cachedResponse = cache.get(key);
    if (cachedResponse) {
        return res.send(cachedResponse);
    } else {
        res.originalSend = res.send;
        res.send = (body) => {
            res.originalSend(body);
            cache.set(key, body, duration);
        }
        next();
    }
}

module.exports = setCache;
