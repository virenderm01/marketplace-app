import 'source-map-support/register'
import {APIGatewayProxyResult, APIGatewayProxyEvent} from 'aws-lambda'
import {createLogger} from '../../utils/logger'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import * as AWSXRay from 'aws-xray-sdk'
import * as AWS  from 'aws-sdk'
import { getUserId } from '../utils'
import {  getAdvertisementById,  updateAdvertisementAttachment } from '../../businessLogic/advertisements'
import { UpdateAdvertisementRequest } from '../../requests/UpdateAdvertisementRequest'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({signatureVersion: 'v4'})
const logger = createLogger('advertisement-attachment-url')
const bucketName = process.env.MARKETPLACE_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;


export const handler= middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	logger.info('In get advertisment attachment URL: ')
	
	const user = getUserId(event)

		const advId = event.pathParameters.advId
		const result = await getAdvertisementById(advId);
		const advertisement = result.Items[0];
		if(!advertisement)
		{
			return {
				statusCode: 404,
				body: JSON.stringify({
					error: 'Provided Advertisement does not exist'
				})
			}
		}
		if (!user || advertisement.userId!==user) {
			return {
				statusCode: 401,
				body: JSON.stringify({
					error: 'Unauthorized access'
				})
			}
		}else{
			logger.info('Getting url for upload')
			const url = getUploadUrl(advId);
			// @ts-ignore
			const {name, description} = advertisement;
			const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${advId}`
			const newData:UpdateAdvertisementRequest = {name,description,attachmentUrl}
			logger.info(`${user} requested upload URL ${url}`)
			await updateAdvertisementAttachment(user, advId, newData);

			return {
				statusCode: 200,
				body: JSON.stringify({url})
			}
		}
})

handler.use(cors({credentials: true}));

function getUploadUrl(advId: string) {
	return s3.getSignedUrl('putObject', {
		Bucket: bucketName,
		Key: advId,
		Expires: Number(urlExpiration)
	})
}
