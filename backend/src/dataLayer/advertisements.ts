import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {createLogger} from "../utils/logger";
import { Advertisement } from '../models/Advertisement';

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('marketplace-advertisement-data-layer')
const advCategoryIdIndex = process.env.ADVERTISEMENT_ID_INDEX
function createDynamoDBClient() {
	if (process.env.IS_OFFLINE) {
		console.log('Creating a local DynamoDB instance')
		return new XAWS.DynamoDB.DocumentClient({
			region: 'localhost',
			endpoint: 'http://localhost:8000'
		})
	}

	return new XAWS.DynamoDB.DocumentClient()
}

export class AdvertisementDBAccess {
	constructor(
			private readonly docClient: DocumentClient = createDynamoDBClient(),
			private readonly advertisementTable = process.env.ADVERTISEMENT_TABLE) {
	}

	async getAllAdvertisements(categoryId: string, nextKey, limit, owner, user): Promise<AWS.DynamoDB.QueryOutput> {

		logger.info('In get Avertisements DB Layer: ')
		let params
		// Scan operation parameters
		if(owner && owner =='y'){
			params = {
				TableName: this.advertisementTable,
				IndexName: advCategoryIdIndex,
				Limit: limit,
				ExclusiveStartKey: nextKey,
				KeyConditionExpression: "categoryId = :id and userId = :userId",
				ExpressionAttributeValues: {
					":id": categoryId,
					":userId": user
				}
			}
		}else{
			params = {
				TableName: this.advertisementTable,
				IndexName: advCategoryIdIndex,
				Limit: limit,
				ExclusiveStartKey: nextKey,
				KeyConditionExpression: "categoryId = :id",
				ExpressionAttributeValues: {
					":id": categoryId
				}
			}
		}
		return await this.docClient.query(params).promise()
	}


	

	async createAdvertisement(advertisement:Advertisement): Promise<Advertisement> {
		console.log('Creating avertisement with categoryId: ',advertisement.categoryId);
		console.log('Creating avertisement with advId: ',advertisement.advId);

		await this.docClient.put({TableName: this.advertisementTable, Item: advertisement}).promise()
		return advertisement
	}

	async  deleteAdvertisement(user, advId: string): Promise<string> {
		await this.docClient.delete({TableName: this.advertisementTable, Key: {userId: user, advId}}).promise()
		return advId;
	}

	async updateAdvertisement(user: string, advId: string, newData: any): Promise<Object> {
		// Builds the expressions for update
		let updateExpression = 'set #name = :n, description = :d';
		let attributeValues = {
			':n': newData.name,
			':d': newData.description,
			
		}

		if (newData.attachmentUrl) {
			updateExpression += ', attachmentUrl = :url'
			attributeValues[':url'] = newData.attachmentUrl
		}
		const updatedItem = await this.docClient.update({
			TableName: this.advertisementTable,
			Key: {userId: user, advId},
			UpdateExpression: updateExpression,
			ExpressionAttributeValues: attributeValues,
			ExpressionAttributeNames: {
				'#name': 'name'
			}
		}).promise()
		logger.info('update result: ', {...updatedItem})
		return {advId, ...newData}
	}

	async updateAdvertisementAttachment(user: string, advId: string, newData): Promise<Object> {
		// Builds the expressions for update
		logger.info("Updating the advertisement with data ", user, advId, newData)
		let updateExpression = 'set attachmentUrl = :u';
		let attributeValues = {
			':u': newData.attachmentUrl
		}

		const updatedItem = await this.docClient.update({
			TableName: this.advertisementTable,
			Key: {userId: user, advId},
			UpdateExpression: updateExpression,
			ExpressionAttributeValues: attributeValues
		}).promise()
		logger.info('update result: ', {...updatedItem})
		return {advId, ...newData}
	}

	async getAdvertisementById(advId:string):Promise<AWS.DynamoDB.DocumentClient.QueryOutput>{
		logger.info("Get advertisement by advId ", advId)
		return await this.docClient.query({
			TableName : this.advertisementTable,
			KeyConditionExpression: 'advId = :addId',
			ExpressionAttributeValues: {
				':addId':  advId
			}
		}).promise()
	}

	async  advertisementExists(advId: string, userId: string) {
		const result = await this.docClient
				.get({
					TableName: this.advertisementTable,
					Key: {advId, userId}
				})
				.promise()
	
		logger.info('Check advertisement exists: ', result)
		return !!result.Item
	}
}
