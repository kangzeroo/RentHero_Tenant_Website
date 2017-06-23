// AWS Cognito for authenticating user
// https://github.com/aws/amazon-cognito-identity-js

import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails, CognitoIdentityCredentials, WebIdentityCredentials } from 'amazon-cognito-identity-js';
import {createUserS3Album} from './aws-S3'
import { userPool, LANDLORD_USERPOOL_ID, LANDLORD_IDENTITY_POOL_ID, TENANT_IDENTITY_POOL_ID } from './aws-profile'
import uuid from 'uuid'
import AWS from 'aws-sdk/global'
// import AWS_CognitoIdentity from 'aws-sdk/clients/cognitoidentity'
// import AWS_CognitoSyncManager from 'aws-sdk/clients/cognitosync'

// https://github.com/aws/amazon-cognito-js/
// entire cognito sync
import 'amazon-cognito-js'

export function signUpLandlord({email, company_name, password}){
	const p = new Promise((res, rej)=>{
		const attributeList = []
		const dataEmail = {
		    Name : 'email',
		    Value : email
		}
		const dataCompanyName = {
		    Name : 'custom:company_name',
		    Value : company_name
		}
		const dataId = {
		    Name : 'custom:id',
		    Value : uuid.v4()
		}
		const dataWebsite = {
		    Name : 'website',
		    Value : ""
		}
		const dataPricingPlan = {
		    Name : 'custom:pricingPlan',
		    Value : "free"
		}
		const now = Date.now()
		// console.log(now)
		// console.log(typeof now)
		const dataUpdatedAt = {
		    Name : 'updated_at',
		    Value : now.toString()
		}
		const attributeEmail = new CognitoUserAttribute(dataEmail)
		const attributeCompanyEmail = new CognitoUserAttribute(dataCompanyName)
		const attributeId = new CognitoUserAttribute(dataId)
		const attributeWebsite = new CognitoUserAttribute(dataWebsite)
		const attributeUpdatedAt = new CognitoUserAttribute(dataUpdatedAt)
		const attributePricingPlan = new CognitoUserAttribute(dataPricingPlan)
		attributeList.push(attributeEmail, attributeCompanyEmail, attributeId, attributeWebsite, attributeUpdatedAt, attributePricingPlan)
		userPool.signUp(email, password, attributeList, null, function(err, result){
		    if (err) {
		        // console.log(err);
		        rej(err)
		        return;
		    }
		    res({email, password})
		})
	})
	return p
}

export function signInLandlord({email, password}){
	const p = new Promise((res, rej)=>{
		const authenticationDetails = new AuthenticationDetails({
			Username: email,
			Password: password
		})
		const userData = {
			Username: email,
			Pool: userPool
		}
		const cognitoUser = new CognitoUser(userData)
		authenticateUser(cognitoUser, authenticationDetails)
	    	.then(()=>{
	    		return createUserS3Album(email)
	    	})
			.then(()=>{
				return buildUserObject(cognitoUser)
			})
			.then((userProfileObject)=>{
				res(userProfileObject)
			})
			.catch((err)=>{
				rej(err)
			})
	})
	return p
}

function authenticateUser(cognitoUser, authenticationDetails){
	const p = new Promise((res, rej)=>{
		cognitoUser.authenticateUser(authenticationDetails, {
	        onSuccess: function (result) {
	            //// console.log('access token + ' + result.getAccessToken().getJwtToken());
	            // localStorage.setItem('cognito_landlord_token', result.getAccessToken().getJwtToken());
	            localStorage.setItem('cognito_landlord_token', result.accessToken.jwtToken);
	            // console.log("======== VIEW THE REFRESH TOKEN =========")
	            // console.log(localStorage.getItem('cognito_landlord_token'))
	            // console.log(result)

			    		// Edge case, AWS Cognito does not allow for the Logins attr to be dynamically generated. So we must create the loginsObj beforehand
	            const loginsObj = {
	                // Change the key below according to the specific region your user pool is in.
	                [LANDLORD_USERPOOL_ID]: result.getIdToken().getJwtToken()
	            }
			    		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
	                IdentityPoolId : LANDLORD_IDENTITY_POOL_ID, // your identity pool id here
	                Logins : loginsObj
	            })
	            AWS.config.credentials.refresh(function(){
	            	// console.log(AWS.config.credentials)
	            })
	            res()
	        },
	        onFailure: function(err) {
	            // console.log(err)
	            rej(err)
	        },
	    })
	})
	return p
}

function buildUserObject(cognitoUser){
	const p = new Promise((res, rej)=>{
		cognitoUser.getUserAttributes(function(err, result) {
	        if (err) {
	            // console.log(err);
	    		rej(err)
	            return;
	        }
	        let userProfileObject = {}
			for (let i = 0; i < result.length; i++) {
		        if(result[i].getName().indexOf('custom:') >= 0){
		    		let name = result[i].getName().slice(7, result[i].getName().length)
		    		userProfileObject[name] = result[i].getValue()
		    	}else{
		    		userProfileObject[result[i].getName()] = result[i].getValue()
		    	}
		    }
		    const landlordAttrs = ["email", "company_name", "company_logo", "default_email", "default_phone", "email_forward", "website", "id", "pricingPlan"]
		    for(let x = 0; x < landlordAttrs.length; x++){
		    	if(!userProfileObject[landlordAttrs[x]]){
		    		userProfileObject[landlordAttrs[x]] = null
		    	}
		    }
	        //// console.log(userProfileObject)
	        res(userProfileObject)
	    })
	})
	return p
}

export function verifyLandlordAccount({email, pin}){
	const p = new Promise((res, rej)=>{
		const userData = {
			Username: email,
			Pool: userPool
		}
		const cognitoUser = new CognitoUser(userData)
		//// console.log("Verifying account...")
		cognitoUser.confirmRegistration(pin, true, function(err, result) {
	        if (err) {
	            // console.log(err);
		        rej(err)
	            return;
	        }
	        //// console.log('call result: ' + result)
	        if(result == "SUCCESS"){
	        	// console.log("Successfully verified account!")
	        	cognitoUser.signOut()
	        	res()
	        }else{
	        	rej("Could not verify account")
	        }
	    })
	})
	return p
}

export function updateLandlordInfo(email, editedInfo){
	// console.log(editedInfo)
	const p = new Promise((res, rej)=>{
		const attrs = ["custom:company_name", "custom:company_logo", "custom:default_email", "custom:default_phone", "custom:email_forward", "website"]
		const attributeList = []
		for(let a = 0; a<attrs.length; a++){
			if(editedInfo[attrs[a]]){
				// console.log(editedInfo[attrs[a]])
				let attribute = {
			        Name : attrs[a],
			        Value : editedInfo[attrs[a]]
			    }
			    let x = new CognitoUserAttribute(attribute)
			    attributeList.push(x)
			}
		}
		// console.log(attributeList)
	    const cognitoUser = userPool.getCurrentUser()
	    cognitoUser.getSession(function(err, result) {
            if (result) {
                cognitoUser.updateAttributes(attributeList, function(err, result) {
			        if (err) {
			            // console.log(err);
		        		rej(err)
			            return;
			        }
			        setTimeout(()=>{
				        cognitoUser.getUserAttributes(function(err, result) {
					        if (err) {
					            // console.log(err);
		        				rej(err)
					            return;
					        }
					        buildUserObject(cognitoUser)
					        	.then((userProfileObject)=>{
					        		res(userProfileObject)
					        	})
					    })
			        }, 500)
			    });
            }
        });
	})
	return p
}

export function forgotPassword(email){
	const p = new Promise((res, rej)=>{
		// // console.log(email)
		// // console.log(userPool)
		const userData = {
			Username: email,
			Pool: userPool
		}
		const cognitoUser = new CognitoUser(userData)
		//// console.log(cognitoUser)

		cognitoUser.forgotPassword({
	        onSuccess: function (result) {
	            // console.log('call result: ' + result);
	        },
	        onFailure: function(err) {
	            // console.log(err);
		        rej(err)
	        },
	        //Optional automatic callback
	        inputVerificationCode: function(data) {
	            //// console.log('Code sent to: ' + data)
	            res({
	            	cognitoUser: cognitoUser,
	            	thirdArg: this
	            })
	        }
	    })
	})
	return p
}

export function resetVerificationPIN(email){
	const p = new Promise((res, rej)=>{
		const userData = {
			Username: email,
			Pool: userPool
		}
		const cognitoUser = new CognitoUser(userData)
		cognitoUser.resendConfirmationCode(function(err, result) {
	        if (err) {
	            // console.log(err);
		        rej(err)
	        }
	        //// console.log('call result: ' + result);
	        res()
	    })
	})
	return p
}

export function retrieveLandlordFromLocalStorage(){
	const p = new Promise((res, rej)=>{
	    const cognitoUser = userPool.getCurrentUser();
	    // console.log("Getting cognitoUser from local storage...")
	    // console.log(cognitoUser)
	    if (cognitoUser != null) {
	        cognitoUser.getSession(function(err, session) {
	            if (err) {
	                alert(err);
	                return;
	            }
	            // console.log('session validity: ' + session.isValid());
	            // console.log(session);
	            localStorage.setItem('cognito_landlord_token', session.getAccessToken().getJwtToken());
	            //// console.log(localStorage.getItem('cognito_landlord_token'))
	            // Edge case, AWS Cognito does not allow for the Logins attr to be dynamically generated. So we must create the loginsObj beforehand
	            const loginsObj = {
	                // Change the key below according to the specific region your user pool is in.
	                [LANDLORD_USERPOOL_ID] : session.getIdToken().getJwtToken()
	            }
			    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
	                IdentityPoolId : LANDLORD_IDENTITY_POOL_ID, // your identity pool id here
	                Logins : loginsObj
	            })
	            AWS.config.credentials.refresh(function(){
	            	// console.log(AWS.config.credentials)
	            	res(buildUserObject(cognitoUser))
	            })
	        });
	    }else{
	    	rej('Failed to retrieve landlord from localStorage')
	    }
	})
	return p
}

export function signOutLandlord(){
	const p = new Promise((res, rej)=>{
		const cognitoUser = userPool.getCurrentUser()
		cognitoUser.signOut()
	})
	return p
}

export function registerFacebookLoginWithCognito(response){
	// console.log("registerFacebookLoginWithCognito")
	// console.log(response)
	// Check if the user logged in successfully.
	  if (response.authResponse) {

	    // console.log('You are now logged in.');
	    const cognitoidentity = new AWS.CognitoIdentity();

	    // Add the Facebook access token to the Cognito credentials login map.
	    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
	      IdentityPoolId: TENANT_IDENTITY_POOL_ID,
	      Logins: {
	         'graph.facebook.com': response.authResponse.accessToken
	      }
	    })

	    // AWS Cognito Sync to sync Facebook
	    AWS.config.credentials.get(function() {
		    const client = new AWS.CognitoSyncManager();
		    // console.log(AWS.config.credentials)
			});

	  } else {
	    // console.log('There was a problem logging you in.');
	  }
}

export function landlordClaimViewIdentity(){
	// Add the unauthenticated user to the Cognito credentials login map.
	AWS.config.credentials = new AWS.CognitoIdentityCredentials({
		IdentityPoolId: TENANT_IDENTITY_POOL_ID
	})

	// AWS Cognito Sync to sync Facebook
	AWS.config.credentials.get(function() {
		const client = new AWS.CognitoSyncManager();
		// console.log(AWS.config.credentials)
	});
}

export function unauthRoleTenantLogin(){
	const p = new Promise((res, rej)=>{
		// Add the unauthenticated user to the Cognito credentials login map.
		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
			IdentityPoolId: TENANT_IDENTITY_POOL_ID
		})
		// AWS Cognito Sync to sync Facebook
		AWS.config.credentials.get(function() {
			const client = new AWS.CognitoSyncManager();
			// console.log(AWS.config.credentials)
			res({
				id: AWS.config.credentials.identityId,
				name: "Student on RentBurrow",
				picurl: "https://image.flaticon.com/icons/png/128/149/149071.png"
			})
		});
	})
	return p
}
