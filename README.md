# Rentburrow Tenant
The public facing website for future and current tenants. Use it to search for properties, sign leases and view your tenant profile.
<br/><br/>
Includes the following technologies:
- NodeJS v6.3.1 LTS
- ExpressJS with HTTPS
- ReactJS v15
- RxJS
- Webpack 2
- Websockets via Socket.io
- Dockerized


## Setup
// $ npm install
// To use in dev, $ npm run start
// To use in prod, $ npm run build; $ npm run prod

### Build and run docker images with:
$ bash build.sh
$ bash run.sh

### Check docker images and containers with:
$ docker images
$ docker ps

### remove docker images and containers with:
$ docker rm <CONTAINER_ID>
$ docker rmi <IMAGE_ID>
