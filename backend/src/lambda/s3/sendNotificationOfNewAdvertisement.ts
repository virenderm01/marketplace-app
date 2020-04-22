import {SNSEvent, SNSHandler} from "aws-lambda";
import {createLogger} from "../../utils/logger";
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { getAdvertisementById } from "../../businessLogic/advertisements";

const XAWS = AWSXRay.captureAWS(AWS)

const docClient = new XAWS.DynamoDB.DocumentClient()

const connectionsTable = process.env.CONNECTIONS_TABLE
const stage = process.env.STAGE
const apiId = process.env.API_ID

const connectionParams = {
	apiVersion: "2018-11-29",
	endpoint: `${apiId}.execute-api.us-east-2.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams)

const logger = createLogger('addvertisement-attachment-url-update')

export const handler: SNSHandler = async (event: SNSEvent) => {
	try {
		if (event.Records && Array.isArray(event.Records) && event.Records.length > 0) {
			const [snsRecord] = event.Records;
			if (snsRecord) {
				const {Records: [s3Record]} = JSON.parse(snsRecord.Sns.Message)
				if (s3Record) {
					const {s3: {object: {key: fileKey}}} = s3Record;
					if (fileKey) {
						await processS3Event(fileKey)
					}
				}
			}
		}
	} catch (ex) {
		logger.error('Error in execution: ', ex)
	}
}

async function processS3Event(fileKey: string) {

	const connections = await docClient.scan({
		TableName: connectionsTable
	}).promise()
	const result = await getAdvertisementById(fileKey);
	

	for (const connection of connections.Items) {
		const connectionId = connection.id
		await sendMessageToClient(connectionId, result.Items[0])
	}

}

async function sendMessageToClient(connectionId, payload) {
	try {
		console.log('Sending message to a connection', connectionId)

		await apiGateway.postToConnection({
			ConnectionId: connectionId,
			Data: JSON.stringify(payload),
		}).promise()

	} catch (e) {
		console.log('Failed to send message', JSON.stringify(e))
		if (e.statusCode === 410) {
			console.log('Stale connection')

			await docClient.delete({
				TableName: connectionsTable,
				Key: {
					id: connectionId
				}
			}).promise()

		}
	}
}
