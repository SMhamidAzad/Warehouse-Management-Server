const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware 
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a6oi5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const productCollection = client.db('tilesWarehouse').collection('product')

    // AUTH token 
    app.post('/gettoken', async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '2d'
      });
      res.send({ accessToken })
    })
    // product api 
    app.get('/product', async (req, res) => {
      const email = req.query.email;
      if (email) {
        const authHeaders = req.headers.authorization;

        if (!authHeaders) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        const token = authHeaders.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
          }
          console.log('decoded', decoded);
          req.decoded = decoded;
        })

        const decodedEmail = req.decoded.email;
        if (decodedEmail === email) {
          const query = { email: email };
          const cursor = productCollection.find(query);
          const result = await cursor.toArray();
          res.send(result);
        }
        else{
          res.status(403).send({message: 'forbidden access'})
        }
      }
      else {
        const query = {};
        const cursor = productCollection.find(query);
        const allProduct = await cursor.toArray();
        res.send(allProduct)
      }
    })

    //  api for single product 
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    })

    // delivered product and update quantity
    app.put('/product/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity: data.newQuantity
        }
      };
      const result = await productCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    })

    // added new inventory 
    app.post('/product', async (req, res) => {
      const newInventory = req.body;
      console.log("Successfully adding new inventory", newInventory);
      const result = await productCollection.insertOne(newInventory);
      res.send(result)
    });

    // delete api 
    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });
  }
  finally {

  }
}
run().catch(console.dir)

// root api
app.get('/', (req, res) => {
  res.send('door warehouse is running');
})

app.listen(port, () => {
  console.log('Listening to port ', port);
})



// https://blooming-hollows-74511.herokuapp.com/