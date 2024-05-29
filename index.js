const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const canvasPosts = client.db('chatCanvas').collection('test');
        const canvasAnnounce = client.db('chatCanvas').collection('announcement');



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

        // single user 
        app.get("/api/v1/user/:email", async (req, res) => {
            const userEmail = req.params.email;
            const query = { email: userEmail }

            const result = await canvasUsers.findOne(query);
            res.send(result);
        })

        /**
         * ****************************************************************
         * *********************** Admin Announcement Api *****************
         * ****************************************************************
         */

        app.get("/api/v1/announcement", async (req, res) => {
            try {
                const result = await canvasAnnounce.find().toArray();

                res.send(result)
            } catch (error) {
                console.log('get error : ', error);
            }
        })

        // announcement count
        app.get('/api/v1/announcement-count', async (req, res) => {
            try {

                const result = await canvasAnnounce.estimatedDocumentCount();
                const count = result.toString();
                res.send(count);

            } catch (error) {

                console.error('Error in announcement-count:', error);
                res.status(500).send('Error fetching announcement count');
            }

        })

        /**
         * ****************************************************************
         * ************************ POST Releted Api **********************
         * ****************************************************************
         */

        // get all post ** not in use ** old v1 all posts
        app.get("/api/v1/posts", async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 0;
                const size = 5;

                console.log('page', page, "size", size);
                const result = await canvasPosts.find()
                    .sort({ postTime: -1 })
                    .skip(page * size)
                    .limit(size)
                    .toArray();
                res.send(result);

            } catch (error) {
                console.log('get error : ', error);
            }
        })

        // search api **  use for tag
        app.get("/api/v1/search/:key", async (req, res) => {

            try {
                const key = req.params.key;
                const query = {
                    "$or": [
                        // { "post.title": { $regex: key, $options: "i" } },
                        // { "post.description": { $regex: key, $options: "i" } },
                        { "tag": { $regex: key, $options: "i" } }
                    ]
                }
                const result = await canvasPosts.find(query).toArray();
                res.send(result)

            } catch (error) {
                console.error("Error searching posts:", error);
                res.status(500).send("Error searching posts");
            }
        })

        // all posts and search post 
        app.get('/api/v2/posts', async (req, res) => {
            try {

                const page = parseInt(req.query.page) || 0;
                const size = 5;
                const search = req.query.search;

                const query = {
                    "$or": [
                        { "post.title": { $regex: search, $options: "i" } },
                        { "post.description": { $regex: search, $options: "i" } },
                        { "tag": { $regex: search, $options: "i" } }
                    ]
                }

                const result = await canvasPosts.find(query)
                    .sort({ postTime: -1 })
                    .skip(size * page)
                    .limit(size)
                    .toArray()

                res.send(result)

            } catch (error) {
                res.status(500).send("Error fetching posts");
                console.log("Error fetching posts ", error);
            }
        })


        // total POST count
        app.get('/api/v1/post-count', async (req, res) => {

            try {
                const count = await canvasPosts.estimatedDocumentCount();
                const totalPost = count.toString();
                res.send(totalPost);
            } catch (error) {
                console.error("Error fetching count:", error);
                res.status(500).send("Error fetching count");
            }
        })

        // get sigele post
        app.get('/api/v1/post-details/:id', async (req, res) => {
            try {

                const id = req.params.id;
                const query = { _id: id }
                // let query = {_id: new ObjectId(id)};
                // console.log(" query = {}: ",query);

                const result = await canvasPosts.findOne(query);
                res.send(result);

            } catch (error) {
                res.send({ error })
                console.log(error.message);
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