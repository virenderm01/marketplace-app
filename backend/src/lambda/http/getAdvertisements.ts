import 'source-map-support/register'

import {APIGatewayProxyResult, APIGatewayProxyEvent} from 'aws-lambda'

import {createLogger} from '../../utils/logger'

import * as middy from 'middy'

import {cors} from 'middy/middlewares'
import {getAllAdvertisements} from "../../businessLogic/advertisements";
import { categoryExists } from '../../businessLogic/categories'
import {parseLimitParameter, parseNextKeyParameter, getQueryParameter, getUserId} from '../utils'
const logger = createLogger('advertisement-getAllByCategory')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	logger.info('In get Advertisement API: ',event)
	
	const user = getUserId(event)
	let nextKey // key for pagination
	let limit // elements to return
	let owner
	const categoryId = event.pathParameters.categoryId

	const validCategoryId = await categoryExists(categoryId)
	if (!validCategoryId) {
		return {
		  statusCode: 404,
		  headers: {
			'Access-Control-Allow-Origin': '*'
		  },
		  body: JSON.stringify({
			error: 'Category does not exist'
		  })
		}
	  }
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

	const result = await getAllAdvertisements(categoryId, nextKey, limit, owner, user);

	return {
		statusCode: 200,
		body: JSON.stringify({...result})
	}
})

handler.use(cors({credentials: true}));

