const {
  Block,
  Blockchain
} = require('./simpleChain')



const myBlockChain = new Blockchain

function theLoop (i) {
  setTimeout(function () {
      let blockTest = new Block("Test Block - " + (i + 1));
      myBlockChain.addBlock(blockTest).then((result) => {
          console.log(result);
          i++;
          if (i < 10) theLoop(i);
      });
  }, 1000);
}

theLoop(0)

setTimeout(() => {

  myBlockChain.validateBlock(1)
  .then(result => console.log("validated?",result))
  .catch(err => console.log(err))

  myBlockChain.validateChain()
  .then(result => console.log(result))
  .catch(err => console.log(err))
},10000)