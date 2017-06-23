// AWS S3 (Simple Scalable Storage) for storing files on the cloud
import { BUCKET_NAME } from './aws-profile'
import { Observable } from 'rxjs/Rx'
import AWS from 'aws-sdk/global'
import AWS_S3 from 'aws-sdk/clients/s3'


export function createUserS3Album(albumName){
	const p = new Promise((res, rej)=>{
	    AWS.config.credentials.refresh(function(){
			const S3 = new AWS_S3()
			albumName = albumName.trim();
			if (!albumName) {
				const msg = 'Album names must contain at least one non-space character.'
		    	// console.log(msg);
		    	rej(msg)
		    	return
		  	}
			if (albumName.indexOf('/') !== -1) {
				const msg = 'Album names cannot contain slashes.'
			    // console.log(msg);
			    rej(msg)
			    return
			}
		  	var albumKey = encodeURIComponent(albumName) + '/';
		  	const params = {
		  		Bucket: BUCKET_NAME,
		  		Key: albumKey
		  	}
		  	S3.headObject(params, function(err, data) {
			    if (!err) {
			    	const msg = 'Album already exists.'
			    	// console.log(msg);
			      	res()
			      	return
			    }
			    if (err.code !== 'NotFound') {
			    	const msg = 'There was an error creating your album: ' + err.message
			    	// console.log(msg);
			      	rej()
			      	return
			    }
					if(err){
				    const albumParams = {
				    	...params,
				    	ACL: "bucket-owner-full-control",
				    	StorageClass: "STANDARD"
				    }
				    S3.putObject(params, function(err, data) {
				      	if (err) {
				      		const msg = 'There was an error creating your album: ' + err.message
				      		// console.log(msg);
				        	rej(msg)
				        	return
				      	}
				      	// console.log('Successfully created album.')
				      	res('Successfully created album.');
				    });
					}
		  	});
		})
	})
	return p
}

// observables style
export function uploadImagesSeriesRx(email, files){
	const o = Observable.create((observer) => {
		if (!files.length || files.length == 0) {
			// const msg = 'Please choose a file to upload first.'
			observer.complete()
		}
		AWS.config.credentials.refresh(function(){
			const S3 = new AWS_S3()
			// observer.onNext (many)
			// observer.onError (once -- breaks observable once called)
			// observer.onCompleted (once -- breaks observable once called)
			const uploadImagesPromises = files.map((file) => {
				return uploadImageToS3(S3, file, email)
					.then((S3ImageObj) => {
						// console.log("S3ImageObj: " + S3ImageObj)
						observer.next(S3ImageObj)
					})
					.catch((err) => {
						console.log(err)
						observer.error(err)
					})
			})
			Promise.all(uploadImagesPromises).then(() => {
				// console.log("Done uploading")
				observer.complete()
			})
		})
	})
	return o
}


// one by one upload
function uploadImageToS3(S3, file, email){
	const p = new Promise((res, rej)=>{
		console.log(file)
		const fileName = file.name;
		const albumPhotosKey = encodeURIComponent(email) + '/';
		const timestamp = new Date().getTime()/1000

		// const imageKey = albumPhotosKey + "--" + timestamp + "--" + fileName;
		const imageKey = albumPhotosKey + fileName;
		const thumbnailImageKey = albumPhotosKey + "thumbnail" + "--" + timestamp + "--" + fileName;
		S3.upload({
				Bucket: BUCKET_NAME,
		    Key: imageKey,
		    Body: file,
		    ACL: 'public-read'
		}, function(err, data) {
		    if (err) {
		      	const msg = 'There was an error uploading your photo: '+ err.message
		      	// console.log(msg)
		      	rej(msg)
		      	return
		    }
				const msg = 'Successfully uploaded original photo: ' + fileName
				// console.log(msg)
				createThumbnail(file, thumbnailImageKey, {
					imageKey: imageKey,
					originalUrl: data.Location
				}).then((S3ImageObj)=>{
					console.log(S3ImageObj)
					/*
						S3ImageObj = {
							imageKey: imageKey,
							originalUrl: data.Location,
							urlThumbnail: data.Location
						}
					}
					*/
			    res(S3ImageObj)
				})
		})
	})
	return p
}

// regular style
export function uploadImagesBatch(email, files){
	const p = new Promise((res, rej)=>{
	  	if (!files.length || files.length == 0) {
   			const msg = 'Please choose a file to upload first.'
   			rej(msg)
		}
	    AWS.config.credentials.refresh(function(){
			// console.log(files)
			const S3 = new AWS_S3()
			const S3ImageObjs = []
			let uploadedCount = 0
			for(let f = 0; f<files.length; f++){
				const file = files[f];
				const fileName = file.name;
				const albumPhotosKey = encodeURIComponent(email) + '/';
				const timestamp = new Date().getTime()/1000

				const imageKey = albumPhotosKey + fileName;
				const thumbnailImageKey = albumPhotosKey + "thumbnail" + "--" + timestamp + "--" + fileName;
				S3.upload({
						Bucket: BUCKET_NAME,
				    Key: imageKey,
				    Body: file,
				    ACL: 'public-read'
				}, function(err, data) {
				    if (err) {
				      	const msg = 'There was an error uploading your photo: '+ err.message
				      	// console.log(msg)
				      	rej(msg)
				      	return
				    }
				    const msg = 'Successfully uploaded original photo: ' + fileName
				    // console.log(msg)
						createThumbnail(file, thumbnailImageKey, {
				    	imageKey: imageKey,
				    	originalUrl: data.Location
				    }).then((S3ImageObj)=>{
							// console.log(S3ImageObj)
							/*
								S3ImageObj = {
									imageKey: imageKey,
									originalUrl: data.Location,
									urlThumbnail: data.Location
								}
							}
							*/
							// console.log(S3ImageObjs)
				    	S3ImageObjs.push(S3ImageObj)
					    uploadedCount++
					    // console.log(uploadedCount)
					    if(uploadedCount==files.length){
						    res(S3ImageObjs)
							}
						})
				})
			}
		})
	})
	return p
}

// creating thumbnails
export function createThumbnail(original, thumbnailImageKey, S3ImageObj) {
	const p = new Promise((res, rej)=>{
		// create an HTML5 canvas to put the originl image on
		let canvas = document.createElement("canvas");
		// create a new Image object with the original image contents
		let img = new Image()
		img.src = original.preview
		// scale the HTML5 canvas to a fraction of what the original (all thumbnails will be 250px wide and auto height)
		const constantThumbnailWidth = 250
		const scale = 250/img.width
		canvas.width = img.width * scale;
		canvas.height = img.height * scale;
		// draw a
		canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
		const dataUrl = canvas.toDataURL('image/jpeg')
		const resizedImage = dataURLToBlob(dataUrl);

		AWS.config.credentials.refresh(function(){
			const S3 = new AWS_S3()
			S3.upload({
					Bucket: BUCKET_NAME,
					Key: thumbnailImageKey,
					Body: resizedImage,
					ACL: 'public-read'
			}, function(err, data) {
					if (err) {
							const msg = 'There was an error uploading your photo: '+ err.message
							// console.log(msg)
							rej(msg)
							return
					}
					const msg = 'Successfully uploaded photo: ' + thumbnailImageKey
					// console.log(msg)
					// console.log(data)
					S3ImageObj.thumbnailUrl = data.Location
					// console.log(S3ImageObj)
					res(S3ImageObj)
			})
		})
	})
	return p
}

// Utility function to convert a canvas to a BLOB
function dataURLToBlob(dataURL){
	const BASE64_MARKER = ';base64,';
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
      const parts = dataURL.split(',');
      const contentType = parts[0].split(':')[1];
      const raw = parts[1];

      return new Blob([raw], {type: contentType});
  }

  const parts = dataURL.split(BASE64_MARKER);
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;

  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], {type: contentType});
}
