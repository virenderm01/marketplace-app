import 'source-map-support/register'

import { APIGatewayProxyResult, APIGatewayProxyEvent} from 'aws-lambda'

import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {createLogger} from "../../utils/logger";
import {updateAdvertisementAttachment} from "../../businessLogic/advertisements";
import { getUserId } from '../utils';

const logger = createLogger('advertisement-file-update')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const {advId} = event.pathParameters
	const updatedJob: any = JSON.parse(event.body)
	
	const user = getUserId(event)
	logger.info('Update item: ', {advId, updatedJob});
	const result = await updateAdvertisementAttachment(user, advId, updatedJob)
	logger.info('Update result: ', {result})
	return {
		statusCode: 200,
		body: JSON.stringify({item: result})
	}
})

handler.use(cors({credentials: true}));
