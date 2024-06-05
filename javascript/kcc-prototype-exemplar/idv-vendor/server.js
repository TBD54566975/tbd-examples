import express from "express"

const app = express()
const port = 3002

app.use(express.json())

app.get('/idv-form', (req, res) => {
  // todo this is where an HTML page could be returned
  res.status(200).send('GET request to the /idv-form endpoint')
})

app.post('/idv-form', async (req, res) => {
  const r = await fetch('http://localhost:3001/idv/result', {
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
