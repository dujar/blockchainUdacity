# Blockchain website - RESTFUL API

## Prerequisites

needs nodejs

express framework

## install & run

clone this repo

commands:

`
npm install
`

`
npm start
`
## routes

-  GET ( '/') --> welcome to my blockchain
-  POST ( '/block') --> post JSON { "body": "write block message!"}
-  GET ('/block/:id') --> get block info for :id which should be a number within the height of the block


you may try posting with

`curl -d "body=fabricio da boss" http://localhost:8000/block`
