import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { createLogger } from '../../utils/logger'

import Axios from 'axios'
import { JwtPayload } from '../../auth/JwtPayload'
import { verify } from 'jsonwebtoken'

var Rasha = require('rasha'); // RSA support

const logger = createLogger('auth')
const jwksUrl = process.env.AUTH_0_JWKS_URL


export const handler = async (  event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  //logger.info('>>> Authorizing a user', event.authorizationToken)
  console.log('>>> Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    console.log('<<< User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })
    console.log(e);
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  
 
    const token = getToken(authHeader)
    
    const response = await Axios.get(jwksUrl);
    logger.info("response from axios ", response);
    console.log(response);
    var signingKey = response.data.keys[0];
    if(!signingKey){
      throw new Error("Invalid token");
    }
    
    return  verifyWithJwk(token,signingKey) 
  
}

function verifyWithJwk(jwt, jwk): JwtPayload {
  var pem;

  if ('RSA' === jwk.kty) {
    pem = Rasha.exportSync({ jwk: jwk });
  } else {
    throw new Error("Expected RSA key but got '" + jwk.kty + "'");
  }

  return verify(jwt, pem) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
