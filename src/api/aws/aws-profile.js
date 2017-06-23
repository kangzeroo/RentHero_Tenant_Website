import { CognitoUserPool } from 'amazon-cognito-identity-js';
import 'amazon-cognito-js'
import AWS from 'aws-sdk/global'

const REGION = "us-east-1"
const LANDLORD_USER_POOL_ID = 'us-east-1_htLwYcn4h'
const LANDLORD_CLIENT_ID = '6j3ib1ll1qmga7hgbdggm1k0qv'

AWS.config.update({
	region: REGION
})
const userData = {
    UserPoolId : LANDLORD_USER_POOL_ID,
    ClientId : LANDLORD_CLIENT_ID
}

export const BUCKET_NAME = 'rentburrow-images'

export const userPool = new CognitoUserPool(userData);
export const LANDLORD_USERPOOL_ID = 'cognito-idp.'+REGION+'.amazonaws.com/'+LANDLORD_USER_POOL_ID
export const TENANT_IDENTITY_POOL_ID = 'us-east-1:afd33f06-f5bd-43fb-b38c-ce867935f681'
export const LANDLORD_IDENTITY_POOL_ID = 'us-east-1:839df00c-2d36-4256-86f5-82af945604fa'
