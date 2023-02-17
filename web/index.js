import express from 'express'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import compression from 'compression'

const app = express()

const path = join(fileURLToPath(import.meta.url), '../')
app.use(
  compression({
    filter: (req, res) =>
      req.headers['accept-encoding']?.includes('gzip') && compression.filter(req, res)
  })
)
app.get('/limitMusic', (req, res) => {
  res.sendFile(join(path, './index.html'))
})
app.get('/limitMusic/:path(*)', (req, res) => {
  res.sendFile(join(path, './limitMusic', req.params.path))
})
app.listen(80, '0.0.0.0', () => {
  console.log('serve start')
})
