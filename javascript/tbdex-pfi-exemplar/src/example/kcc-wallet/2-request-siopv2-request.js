const idvEndpoint = process.argv[2]

const res = await fetch(idvEndpoint)
const body = await res.json()

console.log(JSON.stringify(body, null, 2))
