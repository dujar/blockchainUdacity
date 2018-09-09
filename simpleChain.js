/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const {
  addLevelDBData,
  getLevelDBData
} = require('./levelSandbox')





/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
  constructor(data) {
    this.hash = "",
      this.height = 0,
      this.body = data,
      this.time = 0,
      this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/


class Blockchain {
  constructor() {
    try {
    getLevelDBData("height")
      .then((val) => console.log("height is:", val))
      .catch(() => {
        addLevelDBData("height", -1).then(() => {
          this.addBlock(new Block("First block in the chain - Genesis block"));
        })
      })
    } catch (err) {
      console.log("genesis block already!")
    }
  }

  // Add new block
  addBlock(newBlock) {
    // Block height
    return new Promise((resolve,reject) => {

       this.getBlockHeight().then((height) => {
        console.log("HEIGHT:", height)
        newBlock.height = 1 + Number(height)
        addLevelDBData("height", newBlock.height)
        console.log("new height", newBlock.height)
        newBlock.time = new Date().getTime().toString().slice(0, -3);
        if (height > 0) {
          this.getBlock(height).then(block => {
            console.log("block:", block)
            newBlock.previousBlockHash = JSON.parse(block).hash;
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString())
            .then(result => resolve(result))

          })
        } else {
          newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
          addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString())
          .then(result => resolve(result))
        }
      })

    })
    }

    // Get block height
    getBlockHeight() {
    // return this.chain.length - 1;
    return getLevelDBData("height")
      .catch((err) => console.log("Error fetching height", err))
  }

  // get block
  getBlock(blockHeight) {
    // return object as a single string
    // return JSON.parse(JSON.stringify(this.chain[blockHeight]));
    return getLevelDBData(blockHeight)
  }

  // validate block
  validateBlock(blockHeight) {
    // get block object
    return new Promise((resolve, reject) => {

      this.getBlock(blockHeight)
        .then(result => {

          let block = JSON.parse(result)
          let blockHash = block.hash;
          // remove block hash to test block integrity
          block.hash = '';
          // generate block hash
          let validBlockHash = SHA256(JSON.stringify(block)).toString();
          // Compare
          if (blockHash === validBlockHash) {
            resolve(true);
          } else {
            console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
            resolve(false);
          }

        })

    })
    // get block hash
  }

  // Validate blockchain
  validateChain() {
    let errorLog = [];
    return new Promise((resolve, reject) => {

      this.getBlockHeight().then(height => {
        for (var i = 0; i < height - 1; i++) {
          // validate block
          this.validateBlock(i).then(result => {
            if (!result) erroLog.push(i);
            // compare blocks hash link
            this.getBlock(i).then(result => {
              let block = JSON.parse(result)
              let blockHash = block.hash;
              this.getBlock(i + 1).then(result => {
                let previousBlock = JSON.parse(result)
                let previousHash = previousBlock.previousBlockHash;
                if (blockHash !== previousHash) {
                  errorLog.push(i);
                }
                if (errorLog.length > 0) {
                  console.log('Block errors = ' + errorLog.length);
                  console.log('Blocks: ' + errorLog);
                  reject(errorLog)
                } else {
                  resolve('No errors detected')
                }
              })
            })
          })
        }
      })
    })
    }
  }

module.exports = {
  Block,
  Blockchain
}