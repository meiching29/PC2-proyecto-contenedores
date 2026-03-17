const http = require('http')
const url = require('url')

http.createServer((req, res) => {
  const { a = 0, b = 0 } = url.parse(req.url, true).query
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ resultado: Number(a) + Number(b) }))
}).listen(8080)
