# Blockchain website - RESTFUL API

## Prerequisites

needs nodejs

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