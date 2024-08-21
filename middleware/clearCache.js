const cache = require('./cache');

const clearCache = (hasKey, useDecoded = false) => (req, res, next) => {
    const getAllKeys = cache.keys();

    const filteredKeys = getAllKeys.filter(key => {
        const hasKeyMatch = key.includes(hasKey);

        let useDecodedMatch = true; 
        if (useDecoded && req.decoded) {
            if (req.decoded.id_user) {
                useDecodedMatch = key.includes(`id_user${req.decoded.id_user}`);
            } else if (req.decoded.id_admin) {
                useDecodedMatch = key.includes(`id_admin${req.decoded.id_admin}`);
            }
        }              
        return hasKeyMatch && useDecodedMatch;
    });

    filteredKeys.forEach(key => {        
        cache.del(key);
    });

    next();
}

module.exports = clearCache;
