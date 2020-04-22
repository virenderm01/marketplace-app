import 'source-map-support/register'

import {APIGatewayProxyResult, APIGatewayProxyEvent} from 'aws-lambda'

import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {createLogger} from "../../utils/logger";
import {updateAdvertisement} from "../../businessLogic/advertisements";
import { getUserId } from '../utils';
import { UpdateAdvertisementRequest } from '../../requests/UpdateAdvertisementRequest';
import {getAdvertisementById} from '../../businessLogic/advertisements'
const logger = createLogger('job-update')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const {advId} = event.pathParameters
	const updatedAdvertisement: UpdateAdvertisementRequest = JSON.parse(event.body)
	
	const user = getUserId(event)
	const adv = await getAdvertisementById(advId);
	const advertisement = adv.Items[0];
	if(!advertisement){
		return {
			statusCode: 404,
			body: JSON.stringify({
				error: 'Provided Advertisement does not exist'
			})
		}
	}
	if(advertisement.userId!==user){
		return {
			statusCode: 401,
			body: JSON.stringify({
				error: 'Unauthorized, only the user who created the advertisement is allowed to update it'
			  })
		}
	}


	logger.info('Update advertisement: ', {advId, updatedAdvertisement});
	const result = await updateAdvertisement(user, advId, updatedAdvertisement)
	logger.info('Update result: ', {result})
	return {
		statusCode: 200,
		body: JSON.stringify({item: result})
	}
})

handler.use(cors({credentials: true}));
