const NodeCache = require('node-cache')
const cache = new NodeCache()

const routeCache = duration => (req, res, next) => {
    const key = req.originalUrl
    const cachedResponse = cache.get(key)    
    console.log(key)
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
