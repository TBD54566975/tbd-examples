const credentialOffer = JSON.parse(process.argv[2])

const res = await fetch(`${credentialOffer.credential_issuer}/.well-known/openid-credential-issuer`)
const body = await res.json()

console.log(JSON.stringify(body, null, 2))
