import express from "express"
import {DidDht} from "@web5/dids"
import fs from "fs"
import crypto from "crypto"
import {Jwt, VerifiableCredential} from '@web5/credentials'

const app = express()
const PORT = 3001

const bearerDid = await DidDht.import({portableDid: JSON.parse(fs.readFileSync("./portable-did.json"))})

app.use(express.json())

let idvResults = {}
let payload;

/** called by wallet/2-request-siopv2-request.js */
app.get('/siopv2/auth-request', (_, res) => {
  const siopv2AuthRequest = {
    client_id: bearerDid.uri,
    response_type: 'id_token', // NOTE: we don't support vp_token in this proto-exemplar
    nonce: crypto.randomBytes(16).toString('hex'),
    scope: 'openid',
    response_mode: 'direct_post',
    response_uri: `http://localhost:${PORT}/siopv2/auth-response`,
    client_metadata: {
      subject_syntax_types_supported: 'did:dht did:jwk did:web'
    }
  }

  res.status(200).json(siopv2AuthRequest)
})

/** called by wallet/3-submit-siopv2-response.js */
app.post('/siopv2/auth-response', async (req, res) => {
  try {
    ({payload} = await Jwt.verify({ jwt: req.body.id_token }))
    if (!payload.nonce) {
      // todo implement your custom nonce verification logic
      console.error('Nonce invalid')
      res.status(403).end()
      return
    }
  } catch {
    res.status(401).json({
      error: 'invalid_token',
      error_description: 'Token verification failed'
    })
    return
  }

  const credentialOffer = {
    credential_issuer: `http://localhost:${PORT}`,
    credential_configuration_ids: ['KnownCustomerCredential'],
    grants: {
      'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
        'pre-authorized_code': crypto.randomBytes(16).toString('hex')
      }
    }
  }

  idvResults[payload.iss] = 'idv-pending'

  const idvRequest = {
    credential_offer: credentialOffer,
    url: 'http://localhost:3002/idv-form' // the url for the idv-vendor/ project
  }
  res.status(201).json(idvRequest)
})

app.get('/.well-known/openid-credential-issuer', (_, res) => {
  const credentialIssuerMetadata = {
    credential_issuer: `http://localhost:${PORT}`,
    credential_endpoint: `http://localhost:${PORT}/oid4vci/credential`,
    credential_configurations_supported: {
      format: 'jwt_vc_json',
      cryptographic_binding_methods_supported: ['did:web', 'did:jwk', 'did:dht'],
      credential_signing_alg_values_supported: ['EdDSA', 'ES256K'],
      proof_types_supported: {jwt: {proof_signing_alg_values_supported: ['EdDSA', 'ES256K']}}
    }
  }

  res.status(200).json(credentialIssuerMetadata)
})

app.get('/.well-known/oauth-authorization-server', (_, res) => {
  const authorizationServerMetadata = {
    issuer: `http://localhost:${PORT}`,
    token_endpoint: `http://localhost:${PORT}/oid4vci/token`
  }

  res.status(200).json(authorizationServerMetadata)
})

app.post('/idv/result', (req, res) => {
  idvResults[req.body.applicantDid] = 'idv-completed'
  res.status(201).end()
})

app.post('/oid4vci/token', async (req, res) => {
  if (req.body.grant_type !== 'urn:ietf:params:oauth:grant-type:pre-authorized_code') {
    res.status(400).json({
      error: 'unsupported_grant_type',
      error_description: 'The authorization grant type is not supported by the authorization server',
    })
    return
  }

  // todo verify pre-auth code
  // todo it should be validated against the provided client_id
  if (req.body['pre-authorized_code'] === '') {
    res.status(400).json({
      'error': 'invalid_grant',
      'error_description': 'The provided pre-auth code is invalid',
    })
    return
  }

  if (idvResults[req.body.client_id] === 'idv-pending') {
    res.status(428).json({
      'error': 'authorization_pending',
      'error_description': 'Still waiting to hear back from the IDV submission',
    })
    return
  }

  const exp = Math.floor(Date.now() / 1000) + (30 * 60) // plus 30 minutes
  const claims = {
    iss: bearerDid.uri,
    sub: req.body.client_id,
    iat: Math.floor(Date.now() / 1000),
    exp
  }
  // TODO the JWT typ header will not be properly set
  const accessTokenJwt = await Jwt.sign({signerDid: bearerDid, payload: claims})

  res.status(200).json({
    access_token: accessTokenJwt,
    token_type: 'bearer',
    expires_in: exp,
    c_nonce: crypto.randomBytes(16).toString('hex'),
    c_nonce_expires_in: 30 * 60 // 30 minutes
  })
})

app.post('/oid4vci/credential', async (req, res) => {
  try {
    const accessToken = req.headers['authorization'].split(' ')[1]
    await Jwt.verify({jwt: accessToken})
  } catch {
    res.status(401).end()
    return
  }

  let applicantDid
  try {
    const {payload} = await Jwt.verify({jwt: req.body.proof.jwt})
    applicantDid = payload.iss
    if (!payload.nonce) {
      // todo implement your custom nonce verification logic
      console.error('Nonce invalid')
      res.status(403).end()
      return
    }
  } catch (e) {
    res.status(401).end()
    return
  }

  const vc = await VerifiableCredential.create({
    type    : 'KnownCustomerCredential',
    issuer  : bearerDid.uri,
    subject : applicantDid,
    data    : {
      something: 'relevant'
    },
  });
  const vcJwt = await vc.sign({did: bearerDid})

  res.status(200).json({credential: vcJwt})
})

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
