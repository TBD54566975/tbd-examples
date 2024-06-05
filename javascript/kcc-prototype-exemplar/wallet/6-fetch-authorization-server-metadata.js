const credentialOffer = JSON.parse(process.argv[2])

const res = await fetch(`${credentialOffer.credential_issuer}/.well-known/oauth-authorization-server`)
const body = await res.json()

console.log(JSON.stringify(body, null, 2))
