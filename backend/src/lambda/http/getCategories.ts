import {  APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { cors } from 'middy/middlewares'
import * as middy from 'middy'
import { getAllCategories } from '../../businessLogic/categories'
import { parseNextKeyParameter, parseLimitParameter, getQueryParameter, getUserId } from '../utils'



export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  let nextKey // key for pagination
  let limit // elements to return
  let owner
  const user = getUserId(event);
  try {
    // Parse query parameters
    owner = getQueryParameter(event,'owner')
		nextKey = parseNextKeyParameter(event)
		limit = parseLimitParameter(event) || 20
	} catch (e) {
		console.log('Failed to parse query parameters: ', e.message)
		return {
			statusCode: 400,
			body: JSON.stringify({
				error: 'Invalid parameters'
			})
		}
	}

  const groups = await getAllCategories(nextKey,limit, owner, user);

  return {
    statusCode: 200,
    body: JSON.stringify({
      groups
    })
  }
})

handler.use(cors({credentials: true}))

