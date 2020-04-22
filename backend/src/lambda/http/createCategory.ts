import {  APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import 'source-map-support/register'
import { CreateCategoryRequest } from '../../requests/CreateCategoryRequest'
import { createCategory } from '../../businessLogic/categories'
import { cors } from 'middy/middlewares'

export const handler= middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event);
  const newGroup: CreateCategoryRequest= JSON.parse(event.body);
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  const newItem = await createCategory(newGroup, jwtToken);
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem
    })
  }
})

handler.use(cors({credentials: true}))
