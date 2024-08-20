const cache = require('./cache')

const routeCache = duration => (req, res, next) => {
    const key = req.originalUrl
    const cachedResponse = cache.get(key)          
    if (cachedResponse) {
        return res.send(cachedResponse)
    } else {
        res.originalSend = res.send
        res.send = body => {
            res.originalSend(body)
            cache.set(key, body, duration)
        }
        next()
    }
}

module.exports = routeCache
