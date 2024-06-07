const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_Secret_key)
const PORT = process.env.PORT || 5000;

// console.log(stripe._api.auth);
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://chat-canvas-71.web.app',
        // 'https://chat-canvas-client.web.app'
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
        // serverSelectionTimeoutMS: 5000
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        const canvasUsers = client.db('chatCanvas').collection('users');
        const canvasPosts = client.db('chatCanvas').collection('posts');
        const canvasPostTest = client.db('chatCanvas').collection('test');
        const canvasComments = client.db('chatCanvas').collection('comments');
        const canvasAnnounce = client.db('chatCanvas').collection('announcement');



        /**
         * ****************************************************************
         * ************************** Middleware **************************
         * ****************************************************************
        */



        /**
        * 1. TODO : verifyToken middleware  
        * 2. TODO : verifyAdmin middleware
        * 3. ToDo : 
        * 
        */




        /**
         * ****************************************************************
         * ************************ JWT Releted Api **********************
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


        /**
         * ****************************************************************
         * ************************ User Releted Api **********************
         * ****************************************************************
        */

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

        // update user
        app.patch('/api/v1/update-user/:email', async (req, res) => {
            try {
                const userEmail = req.params.email;

                const filter = {
                    email: userEmail
                };

                const updateDoc = {
                    $set: {
                        badge: "gold"
                    }
                }

                const result = await canvasUsers.updateOne(filter, updateDoc);
                res.send(result)

            } catch (error) {
                console.log(error);
            }
        })

        /**
         * ****************************************************************
         * ************************** Admin Api ***************************
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

        // admin check
        app.get('/api/v1/admin/:email', async (req, res) => {

            const email = req.params.email;
            const query = { email: email }

            const user = await canvasUsers.findOne(query);

            let admin = false;
            if (user) {
                admin = user?.role === 'admin';
            }
            res.send({ admin })
        })

        /**
         * ****************************************************************
         * ************************ POST Releted Api **********************
         * ****************************************************************
        */

        // get all post ** not in use ** old v1 all posts router
        app.get("/api/v1/posts", async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 0;
                const size = 10;

                const result = await canvasPostTest.aggregate([

                    // {
                    //     $lookup: {
                    //         from: 'comments',
                    //         localField: '_id',
                    //         foreignField: 'postId',
                    //         as: 'comments'
                    //     }
                    // },
                    {
                        $lookup: {
                            from: 'comments',
                            let: { postId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ['$postId', { $toString: '$$postId' }]
                                        }
                                    }
                                }
                            ],
                            as: 'comments'
                        }
                    },
                    {
                        $addFields: {
                            commentCount: { $size: '$comments' }
                        }
                    },
                    {
                        $sort: { postTime: -1 }
                    },
                    {
                        $skip: page * size
                    },
                    {
                        $limit: size
                    },
                    {
                        $project: {
                            comments: 0 // Exclude comments array from the result
                        }
                    }

                ]).toArray()

                res.send(result)

            } catch (error) {
                console.log('get error : ', error);
            }
        })

        // search api **  use for tag
        app.get("/api/v1/search/:key", async (req, res) => {

            try {
                const key = req.params.key;
                const query = {
                    "tag": { $regex: key, $options: "i" }
                }
                // const result = await canvasPosts.find(query).toArray();
                const result = await canvasPosts.aggregate([
                    {
                        $match: query
                    },
                    {
                        $lookup: {
                            from: 'comments',
                            let: { postId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ['$postId', { $toString: '$$postId' }]
                                        }
                                    }
                                }
                            ],
                            as: 'comments'
                        }
                    },
                    {
                        $addFields: {
                            commentCount: { $size: '$comments' }
                        }
                    },
                    {
                        $sort: { postTime: -1 }
                    }

                ]).toArray()
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
                const search = req.query.search || '';

                const query = {
                    "$or": [
                        { "post.title": { $regex: search, $options: "i" } },
                        { "post.description": { $regex: search, $options: "i" } },
                        { "tag": { $regex: search, $options: "i" } }
                    ]
                }

                // const result = await canvasPosts.find(query)
                //     .sort({ postTime: -1 })
                //     .skip(size * page)
                //     .limit(size)
                //     .toArray()
                const result = await canvasPosts.aggregate([
                    {
                        $match: query
                    },
                    {
                        $lookup: {
                            from: 'comments',
                            let: { postId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ['$postId', { $toString: '$$postId' }]
                                        }
                                    }
                                }
                            ],
                            as: 'comments'
                        }
                    },
                    {
                        $addFields: {
                            commentCount: { $size: '$comments' }
                        }
                    },
                    {
                        $sort: { postTime: -1 }
                    },
                    {
                        $skip: page * size
                    },
                    {
                        $limit: size
                    },
                    {
                        $project: {
                            comments: 0 // Exclude comments array from the result
                        }
                    }

                ]).toArray()
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
                // const query = { _id: id }
                let query = { _id: new ObjectId(id) };
                // console.log(" query = {}: ",query);

                const result = await canvasPosts.findOne(query);
                res.send(result);

            } catch (error) {
                res.send({ error })
                console.log(error.message);
            }
        })

        // add post
        app.post('/api/v1/add-post', async (req, res) => {
            try {

                const post = req.body;
                // console.log(post);
                const result = await canvasPosts.insertOne(post);
                res.send(result)

            } catch (error) {
                console.log(error);
            }
        })

        // recent 3 posts for user profile
        // TODO: get recent 3 post **


        /** *******************************************************************
         * ************************** Comments Api  ***************************
         * ********************************************************************
        */

        app.get('/api/v1/comments/:pId', async (req, res) => {

            const postId = req.params.pId;
            const query = { postId: postId }
            const result = await canvasComments.find(query)
                .sort({ commentTime: -1 }).
                toArray()
            res.send(result)
        })

        app.post('/api/v1/add-comment', async (req, res) => {
            const newComment = req.body;
            const result = await canvasComments.insertOne(newComment);
            res.send(result)
        })

        /**
         * ****************************************************************
         * ********************   Stripe for Payment   ********************
         * ****************************************************************
        */

        app.post('/api/v1/create-payment-intent', async (req, res) => {

            try {
                const { price } = req.body;
                const amount = price * 100;

                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amount,
                    currency: 'usd',
                    payment_method_types: [
                        "card"
                    ]
                })

                res.send({
                    clientSecret: paymentIntent.client_secret,
                })
            } catch (error) {
                console.error('Error creating payment intent:', error);
                res.status(500).send({ error: 'Failed to create payment intent' });
            }
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
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