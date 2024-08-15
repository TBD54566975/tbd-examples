#!/bin/bash

set -e pipefail

ISSUER_DID_URI=$(cat issuerDid.txt)
SCRIPT_PATH="./src/example/kcc-wallet/"

# create DID DHT
echo "Creating DID DHT..."
node "$SCRIPT_PATH/0-create-did-dht.js"

# resolve the did:dht for the IDV service endpoint
echo "Resolving did:dht..."
IDV_INITIATE_ENDPOINT=$(node "$SCRIPT_PATH/1-resolve-idv-service-endpoint.js" $ISSUER_DID_URI)

# request the SIOPv2 Auth Request (https://openid.github.io/SIOPv2/openid-connect-self-issued-v2-wg-draft.html#name-self-issued-openid-provider-a)
echo "Requesting SIOPv2 Auth Request..."
SIOPV2_REQUEST=$(node "$SCRIPT_PATH/2-request-siopv2-request.js" $IDV_INITIATE_ENDPOINT)

# submit the SIOPv2 Auth Response (https://openid.github.io/SIOPv2/openid-connect-self-issued-v2-wg-draft.html#name-self-issued-openid-provider-au)
echo "Submitting SIOPv2 Auth Response..."
IDV_REQUEST=$(node "$SCRIPT_PATH/3-submit-siopv2-response.js" "$SIOPV2_REQUEST")
IDV_FORM_URL=$(echo $IDV_REQUEST | jq -r '.url')
CREDENTIAL_OFFER=$(echo $IDV_REQUEST | jq -r '.credential_offer')

# simulate submitting the form PII data
echo "Simulating IDV Form submission..."
node "$SCRIPT_PATH/4-simulate-idv-form-submission.js" $IDV_FORM_URL

# fetch metadata
echo "Fetching metadata..."
CREDENTIAL_ISSUSER_METADATA=$(node "$SCRIPT_PATH/5-fetch-credential-issuer-metadata.js" "$CREDENTIAL_OFFER")
AUTH_SERVER_METADATA=$(node "$SCRIPT_PATH/6-fetch-authorization-server-metadata.js" "$CREDENTIAL_OFFER")

# request access token
echo "Requesting access token..."
ACCESS_TOKEN_RESPONSE=$(node "$SCRIPT_PATH/7-request-access-token.js" "$CREDENTIAL_OFFER" "$AUTH_SERVER_METADATA")

# request the credential
echo -e "Requesting credential...\n"
node "$SCRIPT_PATH/8-request-credential.js" $ISSUER_DID_URI "$CREDENTIAL_ISSUSER_METADATA" "$ACCESS_TOKEN_RESPONSE"