import { CategoryAccess } from "../dataLayer/categories";
import { Category } from "../models/Category";
import {CreateCategoryRequest} from '../requests/CreateCategoryRequest'
import * as uuid from 'uuid';
import {  parseUserId } from "../auth/utils";
import { encodeNextKey } from "../lambda/utils";
const categoryAccess = new CategoryAccess();

export async function getAllCategories(nextKey:string, limit:string, owner:string, user:string):Promise<Object>{
    
    const result = await categoryAccess.getAllCategories(nextKey,limit, owner, user)
	return {
		items: result.Items,
		nextKey: encodeNextKey(result.LastEvaluatedKey)
	}
}

export async function createCategory(createCategoryRequest: CreateCategoryRequest, jwtToken: string):Promise<Category>{
    const categoryId = uuid.v4();
    const userId = parseUserId(jwtToken);

    return await categoryAccess.createCategory({
        categoryId: categoryId,
        userId: userId,
        name: createCategoryRequest.name,
        description: createCategoryRequest.description,
        timestamp: new Date().toISOString()
    });

}

export async function categoryExists(categoryId: string){
    return await categoryAccess.categoryExists(categoryId);
    

}

