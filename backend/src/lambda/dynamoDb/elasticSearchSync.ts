    import {DynamoDBStreamEvent, DynamoDBStreamHandler} from 'aws-lambda'
    import 'source-map-support/register'
    import * as elasticsearch from 'elasticsearch';
    import * as httpAwsEs from 'http-aws-es';
//import { RemoteCredentials } from 'aws-sdk';

    const esHost = process.env.ES_ENDPOINT;

    const es = new elasticsearch.Client({
        hosts: [esHost],
        connectionClass: httpAwsEs
    })

    export const handler: DynamoDBStreamHandler = async(event: DynamoDBStreamEvent) => {
        console.log('Processing event from DynamoDB ', JSON.stringify(event));
        for(const record of event.Records){
            console.log('Processing record ', JSON.stringify(record));

            if(record.eventName !== 'INSERT'){
                continue;
            }
            const newItem = record.dynamodb.NewImage;


            const advId = newItem.advId.S;
            const body = {
                advId : newItem.advId.S,
                categoryId : newItem.categoryId.S,
                attachmentUrl: newItem.attachmentUrl.S,
                name: newItem.name.S,
                description: newItem.description.S,
                timestamp: newItem.timestamp.S,
                userId: newItem.userId.S
            }

            await es.index({
                index: 'advertisement-index',
                type: 'advertisements',
                id: advId,
                body
            })
        }

        
    }