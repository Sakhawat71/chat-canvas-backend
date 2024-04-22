const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT || 5000;


app.use(cors({
    origin: [
        'http://localhost:5173',
    ],
    credentials: true,
}))
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

        const canvasUsers = client.db('chatCanvas').collection('users');



        /**
         * ****************************************************************
         * ************************ User Releted Api **********************
         * ****************************************************************
         */


        // jwt access token
        app.post("/api/v1/jwt", async (req, res) => {

            const userEmail = req.body;
            const token = jwt.sign(userEmail, process.env.ACCESS_TOKEN, {
                expiresIn: '365d',
            });

            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                })
                .send({ seccess: true })
        })

        
        // remove jwt token
        app.get('/api/v1/remove-jwt', async (req, res) => {
            try {

                res.clearCookie('token', {
                    maxAge: 0,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                })
                    .send({ seccess: true })
            } catch (err) {
                res.status(500).send(err)
            }
        })

        // add user 
        app.put("/api/v1/add-user/:email", async (req, res) => {
            try {

                const email = req.params.email;
                const user = req.body;

                const filter = { email: email };
                const options = { upsert: true };

                const isExist = await canvasUsers.findOne(filter);
                if (isExist) return res.send({ exist: true, message: "user already exist" });

                const result = await canvasUsers.updateOne(
                    filter,
                    {
                        $set: { ...user }
                    },
                    options
                )
                res.send(result);


            } catch (error) {
                console.log("add user error : ", error);
            }
        })

        // get user 

        app.get("/api/v1/all-users", async (req, res) => {
            try {

                const result = await canvasUsers.find().toArray();
                res.send(result);

            } catch (error) {
                console.log('all user error : ', error);
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