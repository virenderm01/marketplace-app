# Serverless Marketplace

Marketplace is a serverless application developed using AWS Lambda, API Gateway, Elastic Search, DynamoDB and NodeJS


# Functionality of the application

This application will allow creating/removing/updating/fetching advertisements. Each advertisement can have an attachment image. 
Each user only has access to all the advertisements posted.
User can only edit/delete the advertisement that was created by him/her.
Pagination support has been build into the get calls.

# Functions 

* `GetCategories` - Fetches all the categories in the marketplace.
GET - https://v9c8md6x19.execute-api.us-east-2.amazonaws.com/dev/categories
QueryParameters:
```
limit
nextKey
owner - 'y'
```
* `CreateCategory` - create a new category where registered users can post their advertisements.
POST - https://v9c8md6x19.execute-api.us-east-2.amazonaws.com/dev/categories

  
* `GetAdvertisements` - Fetches all the advertisements in the category.
 
  GET - https://v9c8md6x19.execute-api.us-east-2.amazonaws.com/dev/categories/{categoryId}/advertisements
  
```
limit
nextKey
owner - 'y'
```
* `CreateAdvertisement` - create new advertisement in the category.

 POST - https://v9c8md6x19.execute-api.us-east-2.amazonaws.com/dev/categories/{categoryId}/advertisements
  
* `UpdateAdvertisement` - user who has created the advertisement can update the advertisement.
 
  PATCH - https://v9c8md6x19.execute-api.us-east-2.amazonaws.com/dev/categories/{categoryId}/advertisements/{advId}
  
* `DeleteAdvertisement` - user who has created the advertisement can delete the advertisement.

  DELETE - https://v9c8md6x19.execute-api.us-east-2.amazonaws.com/dev/categories/{categoryId}/advertisements/{advId}
  
* `GeteUploadUrlForImage` - user who has created the advertisement can get the url to upload the image.

  GET - https://v9c8md6x19.execute-api.us-east-2.amazonaws.com/dev/categories/{categoryId}/advertisements/{advId}/attachment
 
* `WebSocket` - As a new advertisement is posted with an image, all logged in users will receive the instant update
 
  wss://ikw66p3pm3.execute-api.us-east-2.amazonaws.com/dev


## Authentication 

All the API's are protected. However user can query all the advertisements and categories. 
However user can filter his own created categories and advertisement by passing `owner=y` query parameter.
## Authorization
Only the user who have created the advertisement will be able to update or delete it.


## Logging And Tracing

All the components are traced and mapped using AWS XRay. Screenshot of the same is below

![Alt text](images/xrayFullScreenshot.PNG?raw=true "XRayScreenshot")

Component based screenshot:

![Alt text](images/xRayComponentIcons.PNG?raw=true "XRayScreenshot")

Once the user uploads a picture, all the logged in users will receive an instant update in the below format:

![Alt text](images/websocketMsg.PNG?raw=true "XRayScreenshot")

# Suggestions

```

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

# Postman collection

An alternative way to test your API, you can use the Postman collection that contains sample requests. You can find a Postman collection in this project. To import this collection, do the following.

Click on the import button:

![Alt text](images/import-collection-1.png?raw=true "Image 1")


Click on the "Choose Files":

![Alt text](images/import-collection-2.png?raw=true "Image 2")


Select a file to import:

![Alt text](images/import-collection-3.png?raw=true "Image 3")


Right click on the imported collection to set variables for the collection:

![Alt text](images/import-collection-4.png?raw=true "Image 4")

Provide variables for the collection (similarly to how this was done in the course):

![Alt text](images/import-collection-5.png?raw=true "Image 5")
