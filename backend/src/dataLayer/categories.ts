import {Category} from '../models/Category';
import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger';
const AWSXRay = require('aws-xray-sdk')
const logger = createLogger('marketplace-categories-data-layer')

const XAWS = AWSXRay.captureAWS(AWS);
const categoryUserIndex = process.env.CATEGORY_USER_ID_INDEX
export class CategoryAccess{
    constructor(
        private readonly docClient:DocumentClient = createDynamoDbClient(),
        private readonly  categoriesTable = process.env.CATEGORIES_TABLE){

    }

    async getAllCategories(nextKey, limit, owner, user): Promise<AWS.DynamoDB.QueryOutput>  {
        console.log('Getting All Categories');
        logger.info('Getting all categories with owner as ', owner)
        
        if(owner && owner==='y'){
            let params = {
                TableName: this.categoriesTable,
                IndexName: categoryUserIndex,
                Limit: limit,
                ExclusiveStartKey: nextKey,
                KeyConditionExpression : 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': user
                }
                
            }
            
            return await this.docClient.query(params).promise();
            
        }else{
            let params = {
                TableName: this.categoriesTable,
                
                Limit: limit,
                ExclusiveStartKey: nextKey
                
            }
           
            return await this.docClient.scan(params).promise();
        }

	
          
    }

    async createCategory(category: Category): Promise<Category>{
        console.log('Creating category with categoryId: ',category.categoryId);
        logger.info('Creating category with categoryId: ',category.categoryId);

        await this.docClient.put({
            TableName: this.categoriesTable,
            Item: category
          }).promise();
          return category;
    }

    async categoryExists(categoryId: string){
        logger.info('Creating category with categoryId: ',categoryId);

		const result = await this.docClient.query({
		  TableName: this.categoriesTable,
		  KeyConditionExpression : 'categoryId = :categoryId',
            ExpressionAttributeValues: {
                    ':categoryId': categoryId
                }
		})
		.promise()
	
      console.log('Get Category: ', result)
      
	  return !!result.Items
	}
    
}

function createDynamoDbClient(){
    if(process.env.IS_OFFLINE){
        console.log('Creating local dynamodb instance');
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        });

    
    }
    return new XAWS.DynamoDB.DocumentClient();
}