const { Block, Blockchain } = require("./simpleChain");
const myBlockChain = new Blockchain();
const express = require("express");
const bodyParser = require("body-parser");
// Setup libraries
const bitcoin = require("bitcoinjs-lib");
const bitcoinMessage = require("bitcoinjs-message");

const app = express();
let messageKeeper;
let signatureKeeper;
let validTime = 3000;
// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Welcome to my Blockchain"));
app.get("/block/:id", (req, res) => {
  let { id } = req.params;
  console.log(id);
  myBlockChain.getBlockHeight().then(val => {
    if (id >= 0) {
      if (Number(val) >= id) {
        myBlockChain.getBlock(id).then(result => {
          res.send(result);
        });
      } else {
        res.send(`block height is not yet available, blockHeight: ${val} `);
      }
    }
  });
});
app.get("/stars/:param", (req, res) => {
  let { param } = req.params;

  if (param && param.split(":")[1] && param.split(":")[1].length >= 2) {
    let name = param.split(":")[0];
    myBlockChain
      .find(data => {
        return name === "hash" && data.hash && param.split(":")[1] === data.hash
          ? data
          : name === "address" &&
          data.body &&
          param.split(":")[1] === data.body.address
            ? data
            : false;
      })
      .then(response => {
        console.log("response", response);
        res.send(response);
      });
  } else {
    res.send("wrong address somehow!");
  }
});

app.post("/block", (req, res) => {
  console.log(req.body);
  let { address, star } = req.body;
  if (address && star) {
    let newblock = new Block(address, star);
    myBlockChain.addBlock(newblock).then(result => {
      myBlockChain.getBlock(Number(result)).then(block => {
        res.send(block);
      });
    });
  } else {
    res.send("please add a content to the new block in a body field!");
  }
});
app.post("/requestValidation", (req, res) => {
  console.log(req.body);
  let { address } = req.body;
  if (address) {
    let time = new Date().getTime();

    let response = {
      address,
      requestTimeStamp: time,
      message: `${address}:${time}:starRegistry`,
      validationWindow: validTime
    };
    messageKeeper = response.message;

    console.log(bitcoinMessage.sign(messageKeeper, Buffer.from("3f87320d282b4fac7450fe7d35d8e8bc2839c4e48b7ed2d5352490fa4819d61a", "hex"), false).toString('base64'));
    res.send(response);
  } else {
    res.send("please provide a body message");
  }
});

app.post("/message-signature/validate", (req, res) => {
  console.log(req.body);
  let { address, signature } = req.body;

  if (address && signature && messageKeeper) {
    let messageVerified = bitcoinMessage.verify(
      messageKeeper,
      address,
      signature
    );

    let time = new Date().getTime();
    let timeKept = validTime + time - Number(messageKeeper.split(":")[1]);
    let response = {
      registerStar: messageVerified,
      status: {
        address,
        requestTimeStamp: messageKeeper.split(":")[2],
        message: messageKeeper,
        validationWindow: timeKept,
        messageSignature: messageVerified ? "valid" : "failed"
      }
    };
    res.send(response);
  } else {
    res.send("time out");
  }
});
app.get("/*", (req, res) => {
  res.send("not a url u could use...");
});
let port = 8000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
// const myBlockChain = new Blockchain

// function theLoop (i) {
//   setTimeout(function () {
//       let blockTest = new Block("Test Block - " + (i + 1));
//       myBlockChain.addBlock(blockTest).then((result) => {
//           console.log(result);
//           i++;
//           if (i < 10) theLoop(i);
//       });
//   }, 1000);
// }

// theLoop(0)

// setTimeout(() => {

//   myBlockChain.validateBlock(1)
//   .then(result => console.log("validated?",result))
//   .catch(err => console.log(err))

//   myBlockChain.validateChain()
//   .then(result => console.log(result))
//   .catch(err => console.log(err))
// },10000)
