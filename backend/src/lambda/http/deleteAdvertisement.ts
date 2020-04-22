import 'source-map-support/register'
import {APIGatewayProxyResult,  APIGatewayProxyEvent} from 'aws-lambda'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {createLogger} from "../../utils/logger";
import {deleteAdvertisement, getAdvertisementById} from "../../businessLogic/advertisements";
import { getUserId } from '../utils';
const logger = createLogger('advertisement-delete')

export const handler = middy(async (
		event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	const advId = event.pathParameters.advId
	const result = await getAdvertisementById(advId);
	const user = getUserId(event)
	const advertisement = result.Items[0];
	if(advertisement.userId!==user){
		return {
			statusCode: 401,
			body: JSON.stringify({
				error: 'Unauthorized, only the user who created the advertisement is allowed to delete it'
			  })
		}
	}
	
	const deleteId = await deleteAdvertisement(user, advId)
	logger.info('Deleted Advertisement: ', {deleteId})
	return {
		statusCode: 200,
		body: JSON.stringify({advId: deleteId})
	}
})

// @ts-ignore
handler.use(cors({credentials: true}));
