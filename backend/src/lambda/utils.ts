import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";
import * as AWS from "aws-sdk";
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const secretClient = new XAWS.SecretsManager()

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}

export async function getSecretValue(id, field): Promise<string> {
  const data = await secretClient.getSecretValue({SecretId: id}).promise();
  return  JSON.parse(data.SecretString)[field];
}


export function parseLimitParameter(event) {
	const limitStr = getQueryParameter(event, 'limit')
	if (!limitStr) {
		return undefined
	}

	const limit = parseInt(limitStr, 10)
	if (limit <= 0) {
		throw new Error('Limit should be positive')
	}

	return limit
}

export function parseNextKeyParameter(event) {
	const nextKeyStr = getQueryParameter(event, 'nextKey')
	if (!nextKeyStr) {
		return undefined
	}

	const uriDecoded = decodeURIComponent(nextKeyStr)
	return JSON.parse(uriDecoded)
}

export function getQueryParameter(event, name) {
	const queryParams = event.queryStringParameters
	if (!queryParams) {
		return undefined
	}

	return queryParams[name]
}

export function encodeNextKey(lastEvaluatedKey) {
	if (!lastEvaluatedKey) {
		return null
	}

	return encodeURIComponent(JSON.stringify(lastEvaluatedKey))
}