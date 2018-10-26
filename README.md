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
- POST ('/requestValidation) --> post JSON {
                                           	"address": 
                                           "13nW7vLDQeeRJxbknU6NBCgwP9uDXX4fC8"
                                           }
- POST ('/message-signature/validate) --> post JSON {
                                                    	"address":"13nW7vLDQeeRJxbknU6NBCgwP9uDXX4fC8",
                                                    	"signature": "HJ6j3JiPgPOo9vP82ro1B6az1x/WXslWZFuykL37g3faeRcnDtr6eB1a8STim1j8mZTOwzRMYiToCxGH0jpYFMU="
                                                    }
-  POST ( '/block') --> post JSON {
                                  	"address": "13nW7vLDQeeRJxbknU6NBCgwP9uDXX4fC8",
                                    "star": {
                                      "dec": "hihih",
                                      "ra": "16h 29m 1.0s",
                                      "story": "Found star using https://www.google.com/sky/"
                                    }
                                  }
-  GET ('/block/:id') --> get block info for :id which should be a number within the height of the block

- GET ('/stars/adress:$adress) --> $adress is the wallet public adress like 13nW7vLDQeeRJxbknU6NBCgwP9uDXX4fC8
- GET('/stars/hash:$hash) --> $hash is the block hash you are looking for

any comments please share!
