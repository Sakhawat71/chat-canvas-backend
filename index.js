const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const PORT = process.env.PORT || 5000;


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.vcouptk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        const canvasUser = client.db('chatCanvas').collection('users');



        /**
         * ****************************************************************
         * **************************  user  ******************************
         * ****************************************************************
         */


        // add user 
        app.post("/api/v1/add-user", async (req, res) => {
            try {

                const user = req.body;
                const result = await canvasUser.insertOne(user);
                res.send(result);

            } catch (error) {
                console.log("add user error : ",error);
            }
        })

        // get user 

        app.get("/api/v1/all-users", async(req,res) => {
            try{

                const result = await canvasUser.find().toArray();
                res.send(result);

            }catch(error){
                console.log('all user error : ',error);
            }
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('chat canvas server running..........')
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})