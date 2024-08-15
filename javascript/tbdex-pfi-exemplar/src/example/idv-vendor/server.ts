import express from 'express'

const app = express()
const port = 3002

app.use(express.json())

app.get('/idv-form', (req, res) => {
  // todo this is where an HTML page could be returned
  res.status(200).send('GET request to the /idv-form endpoint')
})

app.post('/idv-form', async (req, res) => {
  const r = await fetch('https://issuer-pfiexemplar.tbddev.org/idv/result', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({applicantDid: req.body.didUri})
  })
  if (r.status !== 200) {
    res.status(500).end()
    return
  }

  res.status(201).end()
})

let server

export function startIDVServer() {
  server = app.listen(port, () => {
    console.log(`IDV server listening at http://localhost:${port}`)
  })
}

export function stopIDVServer() {
  if(server) {
    server.close(() => {
      console.log('IDV server stopped')
    })
  } else {
    console.log('IDV server not running')
  }
}