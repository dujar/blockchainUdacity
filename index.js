const {
  Block,
  Blockchain
} = require('./simpleChain')
const myBlockChain = new Blockchain
const express = require('express')
const bodyParser = require('body-parser')

const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}))

// parse application/json
app.use(bodyParser.json())


app.get('/', (req, res) => res.send('Welcome to my Blockchain'))
app.get('/block/:id', (req, res) => {
  let {
    id
  } = req.params
  console.log(id)
  myBlockChain.getBlockHeight().then(val => {

    if (id >= 0) {
      if (Number(val) >= id) {
        myBlockChain.getBlock(id)
          .then(result => {

            res.send(result)

          })
      } else {
        res.send(`block height is not yet available, blockHeight: ${val} `)
      }
    }
  })

})

app.post('/block', (req, res) => {
  console.log(req.body)
  let {
    body
  } = req.body
  if (body) {
    let newblock = new Block("" + body)
    myBlockChain.addBlock(newblock).then(result => {
      myBlockChain.getBlock(Number(result))
        .then(block => {
          res.send(block)
        })
    })
  } else {
    res.send("please add a content to the new block in a body field!")
  }
})
app.get('/*', (req, res) => {
  res.send("not a url u could use...")
})
let port = 8000
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
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