const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json())

// root api
app.get('/',(req, res)=>{
    res.send('tiles warehouse is running');
})

app.listen(port, ()=>{
    console.log('Listening to port ',port);
})