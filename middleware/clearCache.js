const cache = require('./cache')

const clearCache = hasKey => (req, res, next) => {
    const getAllKey = cache.keys()
    const filterKey = getAllKey.filter(key => key.includes(hasKey))    
    filterKey.forEach(key => {               
        cache.del(key)
    })

    next()
}

module.exports = clearCache
