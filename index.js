const { Block, Blockchain } = require("./simpleChain");
const myBlockChain = new Blockchain();
const express = require("express");
const bodyParser = require("body-parser");
const validator = require("validator");
// Setup libraries
const bitcoin = require("bitcoinjs-lib");
const bitcoinMessage = require("bitcoinjs-message");

const app = express();
let messageKeeper;
let timeKeeper=0
let verified;
let addressMatch;
let validTime = 30000;//5 min in milliseconds
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
        myBlockChain.getBlock(id).then(block => {
          let result = JSON.parse(block);
          result.body.star.storyDecoded = Buffer.from(result.body.star.story, "hex").toString();
          console.log(result);
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
        let blockResults = response.map(blockEl => {
          let block = JSON.parse(JSON.stringify(blockEl));
          block.body.star.storyDecoded = Buffer.from(block.body.star.story, "hex").toString();
          return block;
        });
        res.send(blockResults);
      });
  } else {
    res.send("wrong address somehow!");
  }
})
;

app.post("/block", (req, res) => {
  console.log(req.body);

  let { address, star } = req.body;
  if (star) {
    let story = star.story;
    let dec = star.dec;
    let ra = star.ra;
    if (!story && !dec && !ra) {
      res.json({ message: "invalid star, it is supposed to be ascii and the story needs to be 250 words maximum length" });
    }
    let valid = validator.isAscii(story);
    if (!valid) {
      res.json({ message: "invalid star, it is supposed to be ascii and the story needs to be 250 words maximum length" });
    }
    let boundary = story.split(" ").length <= 250 && story.split(" ").length > 0 && Buffer.byteLength(story) <= 500;
    if (!boundary) {
      res.json({ message: " invalid story, needs to be below 250 words" });
    }
  }
  if (address === addressMatch && verified && star) {
    let newblock = new Block(address, star);
    myBlockChain.addBlock(newblock).then(result => {
      myBlockChain.getBlock(Number(result)).then(block => {
        verified = false;
        addressMatch = "";
        timeKeeper = 0;
        messageKeeper = "";
        res.send(JSON.parse(block));
      });
    });
  } else {
    res.send("request a validation with your address to /requestValidation url endpoint and then sign the message response given, read the README");
  }
});
app.post("/requestValidation", (req, res) => {
  console.log(req.body);
  let { address } = req.body;
  if (address) {
    let time = new Date().getTime();
    let isSameAddress = address === addressMatch;
    let countDown = validTime;
    if (!isSameAddress) {
      addressMatch = address;
      timeKeeper = time;
    }
    let counter=countDown-(time-timeKeeper)
    if (isSameAddress && (counter > 0)) {
      countDown =  counter
    }
    if(counter <0){
      countDown = time
    }
    let response = {
      address,
      requestTimeStamp: isSameAddress ? timeKeeper : time,
      message: `${address}:${isSameAddress ? timeKeeper : time}:starRegistry`,
      validationWindow: countDown
    };
    console.log({ time, validTime, timeKeeper });
    messageKeeper = response.message;

    console.log(bitcoinMessage.sign(messageKeeper, Buffer.from("3f87320d282b4fac7450fe7d35d8e8bc2839c4e48b7ed2d5352490fa4819d61a", "hex"), false).toString("base64"));
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
    verified = messageVerified;

    let time = new Date().getTime();
    let timeKept = validTime - (time - Number((messageKeeper.split(":")[1])));
    if (timeKept < 0) {
      res.send(`you had 5 minutes to give sign the message, you overtimed it by${timeKept} milliseconds, kindly send another request to /resquestValidation`);
    }
    let response = {
      registerStar: messageVerified,
      status: {
        address,
        requestTimeStamp: time,
        message: messageKeeper,
        validationWindow: timeKept,
        messageSignature: messageVerified ? "valid" : "failed"
      }
    };
    res.send(response);
  } else {
    res.send({ message: "either it is a time out or need to request another message at the following url /requestValidation" });
  }
});
app.get("/*", (req, res) => {
  res.json("not a url u could use...");
});
let port = 8000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

