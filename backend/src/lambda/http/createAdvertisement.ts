import 'source-map-support/register'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {  APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'
import {createLogger} from '../../utils/logger'
import {createAdvertisement} from "../../businessLogic/advertisements";
import { getUserId } from '../utils'
import {CreateAvertisementRequest} from '../../requests/CreateAvertisementRequest'
import { categoryExists } from '../../businessLogic/categories'
const logger = createLogger('advertisement-create')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	logger.info('Create new advertisement', event)
	const categoryId = event.pathParameters.categoryId
	const newAddvertisement: CreateAvertisementRequest = JSON.parse(event.body)
	logger.info('New Adv: ', newAddvertisement)
	
	const user = getUserId(event)
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


	const result = await createAdvertisement(newAddvertisement, categoryId, user);
	return {
		statusCode: 201,
		body: JSON.stringify({item: result})
	}
})


handler.use(cors({credentials: true}))
