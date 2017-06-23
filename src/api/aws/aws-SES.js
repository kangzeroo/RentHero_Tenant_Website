// AWS SES (Simple Email Service) for sending emails via Amazon
import AWS_SES from 'aws-sdk/clients/ses'
import {BUCKET_NAME} from './aws-profile'
import AWS from 'aws-sdk/global'

export function sendAWSInquiryEmail(landlordEmail, tenantInfo, lease){
	const ses = new AWS_SES({
		region: 'us-east-1'
	})
	const p = new Promise((res, rej)=>{
		if(!tenantInfo || !tenantInfo.tenantEmail || !tenantInfo.tenantMessage){
			rej('Missing tenant email or message')
		}else{
			const params = createInquiryParamsConfig(landlordEmail, tenantInfo, lease)
			// console.log('Sending email with attached params!')
			AWS.config.credentials.refresh(function(){
				// console.log(AWS.config.credentials)
				ses.sendEmail(params, function(err, data) {
				  if(err){
				  	 // console.log(err, err.stack); // an error occurred
				  	 rej(err)
				  }else{
				  	// console.log(data);           // successful response
					res('Success! Email sent')
				  }
				})
			})
		}
	})
	return p
}

// setup for AWS SES config
function createInquiryParamsConfig(landlordEmail, tenantInfo, lease){
	const params = {
	  Destination: { /* required */
	    BccAddresses: [
	      'email.records.rentburrow@gmail.com',
	      /* more items */
	    ],
	    CcAddresses: [
	      /* more items */
	    ],
	    ToAddresses: [
	      landlordEmail
	      /* more items */
	    ]
	  },
	  Message: { /* required */
	    Body: { /* required */
	      Html: {
	        Data: generateHTMLInquiryEmail(landlordEmail, tenantInfo, lease),
	        Charset: 'UTF-8'
	      },
	      // Text: {
	      //   Data: tenantInfo.tenantMessage,
	      //   Charset: 'UTF-8'
	      // }
	    },
	    Subject: { /* required */
	      Data: 'RentBurrow Inquiry for ' + lease.core.formatted_address, /* required */
	      Charset: 'UTF-8'
	    }
	  },
	  Source: 'support@rentburrow.com', /* required */
	  // ConfigurationSetName: 'STRING_VALUE',
	  ReplyToAddresses: [
	      tenantInfo.tenantEmail,
	      'email.records.rentburrow@gmail.com'
	    /* more items */
	  ],
	  ReturnPath: 'email.records.rentburrow@gmail.com',
	  // ReturnPathArn: 'STRING_VALUE',
	  // SourceArn: 'STRING_VALUE',
	  Tags: [
	    {
	      Name: 'LeaseInquiry', /* required */
	      Value: 'lease' /* required */
	    },
	    /* more items */
	  ]
	}
	return params
}

// generate the HTML email
function generateHTMLInquiryEmail(landlordEmail, tenantInfo, lease){
	let leaseLink
	if(lease.meta.claimed){
		leaseLink = "http://rentburrow.com?v=3&lease=" + lease._id
	}else{
		leaseLink = "http://rentburrow.com?v=3&claim="+ lease.core.owner_id + "&lease=" + lease._id
	}
	return `
		<!DOCTYPE html>
		<html>
		  <head>
		    <meta charset='UTF-8' />
		    <title>title</title>
		  </head>
		  <body>
		  	<table border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' id='bodyTable'>
		    <tr>
		        <td align='center' valign='top'>
		            <table border='0' cellpadding='20' cellspacing='0' width='600' id='emailContainer'>
		                <tr style='background-color:#74a9d8'>
		                    <td align='center' valign='top'>
		                        <table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailHeader'>
		                            <tr>
		                                <td align='center' valign='top'>
		                                    <img src='https://s3.amazonaws.com/${BUCKET_NAME}/rentburrow_logo.png' style='width:150px; height: auto; margin: auto;' />
		                                </td>
		                            </tr>
		                        </table>
		                    </td>
		                </tr>
		                <tr style='background-color:#99ccff;'>
		                    <td align='center' valign='top'>
		                        <table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailBody'>
		                            <tr>
		                                <td align='center' valign='top' style='color:#337ab7;'>
		                                    <h2>${lease.core.formatted_address}</h2>
		                                    <h3>${tenantInfo.tenantName} sent a message:</h3>
		                                </td>
		                            </tr>
		                            <tr style='border: 1px solid red; font-size: 1.2rem'>
		                                <td align='center' valign='top'>
		                                    <p>${tenantInfo.tenantMessage}</p>
		                                </td>
		                            </tr>
		                        </table>
		                    </td>
		                </tr>
		                <tr style='background-color:#74a9d8;'>
		                    <td align='center' valign='top'>
		                        <table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailReply'>
		                            <tr style='font-size: 1.2rem'>
		                                <td align='center' valign='top'>
		                                    <span style='color:#286090; font-weight:bold;'>Reply:</span> <br/> ${tenantInfo.tenantEmail}
		                                </td>
		                                <td align='center' valign='top'>
		                                    <span style='color:#286090; font-weight:bold;'>Phone:</span> <br/> ${tenantInfo.tenantPhone || 'None Provided'}
		                                </td>
		                            </tr>
		                        </table>
		                    </td>
		                </tr>
		                <tr style='background-color:#74a9d8; font-size: 1rem; border: 1px solid red'>
		                    <td align='center' valign='top'>
		                        View your property on RentBurrow at <a href=${leaseLink}> ${leaseLink}</a>
		                    </td>
		                </tr>
		            </table>
		        </td>
		    </tr>
		    </table>
		  </body>
		</html>
	`
}


export function sendAWSClaimEmail(claim){
	const ses = new AWS_SES({
		region: 'us-east-1'
	})
	const p = new Promise((res, rej)=>{
		if(!claim.email_confirm || !claim.unique_code || !claim.lease_id){
			rej('Missing claim confirmation, unique code or lease ID')
		}else{
			const params = createClaimsParamsConfig(claim)
			// console.log("Sending claim email!")
			// console.log('Sending email with attached params!')
			AWS.config.credentials.refresh(function(){
				// console.log(AWS.config.credentials)
				ses.sendEmail(params, function(err, data) {
				  if(err){
				  	 // console.log(err, err.stack); // an error occurred
				  	 rej(err)
				  }else{
				  	// console.log(data);           // successful response
					res('Success! Email sent')
				  }
				})
			})
		}
	})
	return p
}


// setup for AWS SES config
function createClaimsParamsConfig(claim){
	const params = {
	  Destination: { /* required */
	    BccAddresses: [
	      'email.records.rentburrow@gmail.com',
	      /* more items */
	    ],
	    CcAddresses: [
	      /* more items */
	    ],
	    ToAddresses: [
	      claim.email_confirm
	      /* more items */
	    ]
	  },
	  Message: { /* required */
	    Body: { /* required */
	      Html: {
	        Data: generateHTMLClaimEmail(claim),
	        Charset: 'UTF-8'
	      },
	      // Text: {
	      //   Data: tenantInfo.tenantMessage,
	      //   Charset: 'UTF-8'
	      // }
	    },
	    Subject: { /* required */
	      Data: 'Claim ' + claim.address + ' on RentBurrow', /* required */
	      Charset: 'UTF-8'
	    }
	  },
	  Source: 'support@rentburrow.com', /* required */
	  // ConfigurationSetName: 'STRING_VALUE',
	  ReplyToAddresses: [
	      'email.records.rentburrow@gmail.com'
	    /* more items */
	  ],
	  ReturnPath: 'email.records.rentburrow@gmail.com',
	  // ReturnPathArn: 'STRING_VALUE',
	  // SourceArn: 'STRING_VALUE',
	  Tags: [
	    {
	      Name: 'ClaimProperty', /* required */
	      Value: 'claim' /* required */
	    },
	    /* more items */
	  ]
	}
	return params
}


// generate the HTML email
function generateHTMLClaimEmail(claim){
	const claimLink = "http://rentburrow.com/landlord/claim?claim="+ claim.unique_code
	const signupLink = "http://rentburrow.com/signup"
	return `
		<!DOCTYPE html>
		<html>
		  <head>
		    <meta charset='UTF-8' />
		    <title>title</title>
		  </head>
		  <body>
		  	<table border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' id='bodyTable'>
		    <tr>
		        <td align='center' valign='top'>
		            <table border='0' cellpadding='20' cellspacing='0' width='600' id='emailContainer'>
		                <tr style='background-color:#74a9d8'>
		                    <td align='center' valign='top'>
		                        <table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailHeader'>
		                            <tr>
		                                <td align='center' valign='top'>
		                                    <img src='https://s3.amazonaws.com/${BUCKET_NAME}/rentburrow_logo.png' style='width:150px; height: auto; margin: auto;' />
		                                </td>
		                            </tr>
		                        </table>
		                    </td>
		                </tr>
		                <tr style='background-color:#99ccff;'>
		                    <td align='center' valign='top'>
		                        <table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailBody'>
		                            <tr>
		                                <td align='center' valign='top' style='color:#337ab7;'>
		                                    <h2>${claim.address}</h2>
		                                    <h3>Claim Your Property On RentBurrow</h3>
		                                </td>
		                            </tr>
		                            <tr style='border: 1px solid red; font-size: 1.2rem; text-align: center;'>
		                                <td align='center' valign='top'>
																				<h4>Step 1: Create A RentBurrow Landlord Account</h4>
		                                    <a href=${signupLink}> ${signupLink}</a>
		                                </td>
		                            </tr>
		                            <tr style='border: 1px solid red; font-size: 1.2rem; text-align: center;'>
		                                <td align='center' valign='top'>
																				<h4>Step 2: Follow link</h4>
		                                    <a href=${claimLink}> ${claimLink}</a>
		                                </td>
		                            </tr>
		                        </table>
		                    </td>
		                </tr>
		            </table>
		        </td>
		    </tr>
		    </table>
		  </body>
		</html>
	`
}
