import {createLogger} from "../utils/logger";
import {AdvertisementDBAccess} from "../dataLayer/advertisements";
import {Advertisement} from '../models/Advertisement'
import * as uuid from 'uuid'
import { encodeNextKey } from "../lambda/utils";

const logger = createLogger('advertisement-get-bussiness-logic')
const dbAdvtisements = new AdvertisementDBAccess()



export async function getAllAdvertisements(categoryId: string, next, limit, owner, user): Promise<Object> {
	logger.info('In Advertisement business logic: ')
	const result = await dbAdvtisements.getAllAdvertisements(categoryId, next, limit, owner, user)
	return {
		items: result.Items,
		nextKey: encodeNextKey(result.LastEvaluatedKey)
	}
}

export async function createAdvertisement(
		createAdvertisementRequest: any,
		categoryId: string,
		user: string
): Promise<Advertisement> {
	logger.info('In business logic of create an Advertisement: ', {createAdvertisementRequest, categoryId, user})

	//@ts-ignore
	const advertisement: Advertisement = {...createAdvertisementRequest, attachmentUrl: ' '};
	advertisement.categoryId=categoryId;
	advertisement.advId = uuid.v4();
	advertisement.userId = user;
	advertisement.timestamp = (new Date()).toISOString();
	return await dbAdvtisements.createAdvertisement(advertisement);
}

export async function deleteAdvertisement(user, advId: string): Promise<string> {
	return await dbAdvtisements.deleteAdvertisement(user, advId);
}

export async function updateAdvertisement(user, advId: string, newData: any) {
	return await dbAdvtisements.updateAdvertisement(user, advId, newData);
}

export async function updateAdvertisementAttachment(user, advId: string, newData: any) {
	return await dbAdvtisements.updateAdvertisementAttachment(user, advId, newData);
}

export async function getAdvertisementById(advId:string):Promise<AWS.DynamoDB.DocumentClient.QueryOutput>{
	return await dbAdvtisements.getAdvertisementById(advId);
}

export async function advertisementExists(advId:string,userId:string){
	return await dbAdvtisements.advertisementExists(advId,userId)
}
