const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;



// middleware 
app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a6oi5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
     await client.connect();
     const productCollection = client.db('tilesWarehouse').collection('product')

    //  api for all product 
     app.get('/product', async(req, res)=>{
       const query = {};
       const cursor = productCollection.find(query);
       const allProduct = await cursor.toArray();
       res.send(allProduct)
     })

    //  api for single product 
     app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
  });
  }
  finally{

  }
}
run().catch(console.dir)

// root api
app.get('/',(req, res)=>{
    res.send('tiles warehouse is running');
})

app.listen(port, ()=>{
    console.log('Listening to port ',port);
})