"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var express = require('express');

var app = express();

var cors = require('cors');

var _require = require('mongodb'),
    MongoClient = _require.MongoClient,
    ServerApiVersion = _require.ServerApiVersion,
    ObjectId = _require.ObjectId;

require('dotenv').config();

var jwt = require('jsonwebtoken');

var stripe = require('stripe')(process.env.STRIPE_Secret_key);

var PORT = process.env.PORT || 5000; // console.log(stripe._api.auth);

app.use(cors({
  origin: ['http://localhost:5173', 'https://chat-canvas-71.web.app' // 'https://chat-canvas-client.web.app'
  ],
  credentials: true
}));
app.use(express.json());
var uri = "mongodb+srv://".concat(process.env.DB_NAME, ":").concat(process.env.DB_PASS, "@cluster0.vcouptk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"); // Create a MongoClient with a MongoClientOptions object to set the Stable API version

var client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true // serverSelectionTimeoutMS: 5000

  }
});

function run() {
  var canvasUsers, canvasPosts, canvasPostTest, canvasComments, canvasAnnounce;
  return regeneratorRuntime.async(function run$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          _context18.prev = 0;
          // Connect the client to the server	(optional starting in v4.7)
          client.connect();
          canvasUsers = client.db('chatCanvas').collection('users');
          canvasPosts = client.db('chatCanvas').collection('posts');
          canvasPostTest = client.db('chatCanvas').collection('test');
          canvasComments = client.db('chatCanvas').collection('comments');
          canvasAnnounce = client.db('chatCanvas').collection('announcement');
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

          app.post("/api/v1/jwt", function _callee(req, res) {
            var userEmail, token;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    userEmail = req.body;
                    token = jwt.sign(userEmail, process.env.ACCESS_TOKEN, {
                      expiresIn: '365d'
                    });
                    res.cookie('token', token, {
                      httpOnly: true,
                      secure: process.env.NODE_ENV === 'production',
                      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
                    }).send({
                      seccess: true
                    });

                  case 3:
                  case "end":
                    return _context.stop();
                }
              }
            });
          }); // remove jwt token

          app.get('/api/v1/remove-jwt', function _callee2(req, res) {
            return regeneratorRuntime.async(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    try {
                      res.clearCookie('token', {
                        maxAge: 0,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
                      }).send({
                        seccess: true
                      });
                    } catch (err) {
                      res.status(500).send(err);
                    }

                  case 1:
                  case "end":
                    return _context2.stop();
                }
              }
            });
          });
          /**
           * ****************************************************************
           * ************************ User Releted Api **********************
           * ****************************************************************
          */
          // add user 

          app.put("/api/v1/add-user/:email", function _callee3(req, res) {
            var email, user, filter, options, isExist, result;
            return regeneratorRuntime.async(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.prev = 0;
                    email = req.params.email;
                    user = req.body;
                    filter = {
                      email: email
                    };
                    options = {
                      upsert: true
                    };
                    _context3.next = 7;
                    return regeneratorRuntime.awrap(canvasUsers.findOne(filter));

                  case 7:
                    isExist = _context3.sent;

                    if (!isExist) {
                      _context3.next = 10;
                      break;
                    }

                    return _context3.abrupt("return", res.send({
                      exist: true,
                      message: "user already exist"
                    }));

                  case 10:
                    _context3.next = 12;
                    return regeneratorRuntime.awrap(canvasUsers.updateOne(filter, {
                      $set: _objectSpread({}, user)
                    }, options));

                  case 12:
                    result = _context3.sent;
                    res.send(result);
                    _context3.next = 19;
                    break;

                  case 16:
                    _context3.prev = 16;
                    _context3.t0 = _context3["catch"](0);
                    console.log("add user error : ", _context3.t0);

                  case 19:
                  case "end":
                    return _context3.stop();
                }
              }
            }, null, null, [[0, 16]]);
          }); // get user 

          app.get("/api/v1/all-users", function _callee4(req, res) {
            var result;
            return regeneratorRuntime.async(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    _context4.prev = 0;
                    _context4.next = 3;
                    return regeneratorRuntime.awrap(canvasUsers.find().toArray());

                  case 3:
                    result = _context4.sent;
                    res.send(result);
                    _context4.next = 10;
                    break;

                  case 7:
                    _context4.prev = 7;
                    _context4.t0 = _context4["catch"](0);
                    console.log('all user error : ', _context4.t0);

                  case 10:
                  case "end":
                    return _context4.stop();
                }
              }
            }, null, null, [[0, 7]]);
          }); // single user 

          app.get("/api/v1/user/:email", function _callee5(req, res) {
            var userEmail, query, result;
            return regeneratorRuntime.async(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    userEmail = req.params.email;
                    query = {
                      email: userEmail
                    };
                    _context5.next = 4;
                    return regeneratorRuntime.awrap(canvasUsers.findOne(query));

                  case 4:
                    result = _context5.sent;
                    res.send(result);

                  case 6:
                  case "end":
                    return _context5.stop();
                }
              }
            });
          }); // update user

          app.patch('/api/v1/update-user/:email', function _callee6(req, res) {
            var userEmail, filter, updateDoc, result;
            return regeneratorRuntime.async(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    _context6.prev = 0;
                    userEmail = req.params.email;
                    filter = {
                      email: userEmail
                    };
                    updateDoc = {
                      $set: {
                        badge: "gold"
                      }
                    };
                    _context6.next = 6;
                    return regeneratorRuntime.awrap(canvasUsers.updateOne(filter, updateDoc));

                  case 6:
                    result = _context6.sent;
                    res.send(result);
                    _context6.next = 13;
                    break;

                  case 10:
                    _context6.prev = 10;
                    _context6.t0 = _context6["catch"](0);
                    console.log(_context6.t0);

                  case 13:
                  case "end":
                    return _context6.stop();
                }
              }
            }, null, null, [[0, 10]]);
          });
          /**
           * ****************************************************************
           * ************************** Admin Api ***************************
           * ****************************************************************
          */

          app.get("/api/v1/announcement", function _callee7(req, res) {
            var result;
            return regeneratorRuntime.async(function _callee7$(_context7) {
              while (1) {
                switch (_context7.prev = _context7.next) {
                  case 0:
                    _context7.prev = 0;
                    _context7.next = 3;
                    return regeneratorRuntime.awrap(canvasAnnounce.find().toArray());

                  case 3:
                    result = _context7.sent;
                    res.send(result);
                    _context7.next = 10;
                    break;

                  case 7:
                    _context7.prev = 7;
                    _context7.t0 = _context7["catch"](0);
                    console.log('get error : ', _context7.t0);

                  case 10:
                  case "end":
                    return _context7.stop();
                }
              }
            }, null, null, [[0, 7]]);
          }); // announcement count

          app.get('/api/v1/announcement-count', function _callee8(req, res) {
            var result, count;
            return regeneratorRuntime.async(function _callee8$(_context8) {
              while (1) {
                switch (_context8.prev = _context8.next) {
                  case 0:
                    _context8.prev = 0;
                    _context8.next = 3;
                    return regeneratorRuntime.awrap(canvasAnnounce.estimatedDocumentCount());

                  case 3:
                    result = _context8.sent;
                    count = result.toString();
                    res.send(count);
                    _context8.next = 12;
                    break;

                  case 8:
                    _context8.prev = 8;
                    _context8.t0 = _context8["catch"](0);
                    console.error('Error in announcement-count:', _context8.t0);
                    res.status(500).send('Error fetching announcement count');

                  case 12:
                  case "end":
                    return _context8.stop();
                }
              }
            }, null, null, [[0, 8]]);
          }); // admin check

          app.get('/api/v1/admin/:email', function _callee9(req, res) {
            var email, query, user, admin;
            return regeneratorRuntime.async(function _callee9$(_context9) {
              while (1) {
                switch (_context9.prev = _context9.next) {
                  case 0:
                    email = req.params.email;
                    query = {
                      email: email
                    };
                    _context9.next = 4;
                    return regeneratorRuntime.awrap(canvasUsers.findOne(query));

                  case 4:
                    user = _context9.sent;
                    admin = false;

                    if (user) {
                      admin = user.role === 'admin';
                    }

                    console.log(email);
                    res.send(email);

                  case 9:
                  case "end":
                    return _context9.stop();
                }
              }
            });
          });
          /**
           * ****************************************************************
           * ************************ POST Releted Api **********************
           * ****************************************************************
          */
          // get all post ** not in use ** old v1 all posts router

          app.get("/api/v1/posts", function _callee10(req, res) {
            var page, size, result;
            return regeneratorRuntime.async(function _callee10$(_context10) {
              while (1) {
                switch (_context10.prev = _context10.next) {
                  case 0:
                    _context10.prev = 0;
                    page = parseInt(req.query.page) || 0;
                    size = 10;
                    _context10.next = 5;
                    return regeneratorRuntime.awrap(canvasPostTest.aggregate([// {
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
                        "let": {
                          postId: '$_id'
                        },
                        pipeline: [{
                          $match: {
                            $expr: {
                              $eq: ['$postId', {
                                $toString: '$$postId'
                              }]
                            }
                          }
                        }],
                        as: 'comments'
                      }
                    }, {
                      $addFields: {
                        commentCount: {
                          $size: '$comments'
                        }
                      }
                    }, {
                      $sort: {
                        postTime: -1
                      }
                    }, {
                      $skip: page * size
                    }, {
                      $limit: size
                    }, {
                      $project: {
                        comments: 0 // Exclude comments array from the result

                      }
                    }]).toArray());

                  case 5:
                    result = _context10.sent;
                    res.send(result);
                    _context10.next = 12;
                    break;

                  case 9:
                    _context10.prev = 9;
                    _context10.t0 = _context10["catch"](0);
                    console.log('get error : ', _context10.t0);

                  case 12:
                  case "end":
                    return _context10.stop();
                }
              }
            }, null, null, [[0, 9]]);
          }); // search api **  use for tag

          app.get("/api/v1/search/:key", function _callee11(req, res) {
            var key, query, result;
            return regeneratorRuntime.async(function _callee11$(_context11) {
              while (1) {
                switch (_context11.prev = _context11.next) {
                  case 0:
                    _context11.prev = 0;
                    key = req.params.key;
                    query = {
                      "tag": {
                        $regex: key,
                        $options: "i"
                      }
                    }; // const result = await canvasPosts.find(query).toArray();

                    _context11.next = 5;
                    return regeneratorRuntime.awrap(canvasPosts.aggregate([{
                      $match: query
                    }, {
                      $lookup: {
                        from: 'comments',
                        "let": {
                          postId: '$_id'
                        },
                        pipeline: [{
                          $match: {
                            $expr: {
                              $eq: ['$postId', {
                                $toString: '$$postId'
                              }]
                            }
                          }
                        }],
                        as: 'comments'
                      }
                    }, {
                      $addFields: {
                        commentCount: {
                          $size: '$comments'
                        }
                      }
                    }, {
                      $sort: {
                        postTime: -1
                      }
                    }]).toArray());

                  case 5:
                    result = _context11.sent;
                    res.send(result);
                    _context11.next = 13;
                    break;

                  case 9:
                    _context11.prev = 9;
                    _context11.t0 = _context11["catch"](0);
                    console.error("Error searching posts:", _context11.t0);
                    res.status(500).send("Error searching posts");

                  case 13:
                  case "end":
                    return _context11.stop();
                }
              }
            }, null, null, [[0, 9]]);
          }); // all posts and search post 

          app.get('/api/v2/posts', function _callee12(req, res) {
            var page, size, search, query, result;
            return regeneratorRuntime.async(function _callee12$(_context12) {
              while (1) {
                switch (_context12.prev = _context12.next) {
                  case 0:
                    _context12.prev = 0;
                    page = parseInt(req.query.page) || 0;
                    size = 5;
                    search = req.query.search || '';
                    query = {
                      "$or": [{
                        "post.title": {
                          $regex: search,
                          $options: "i"
                        }
                      }, {
                        "post.description": {
                          $regex: search,
                          $options: "i"
                        }
                      }, {
                        "tag": {
                          $regex: search,
                          $options: "i"
                        }
                      }]
                    }; // const result = await canvasPosts.find(query)
                    //     .sort({ postTime: -1 })
                    //     .skip(size * page)
                    //     .limit(size)
                    //     .toArray()

                    _context12.next = 7;
                    return regeneratorRuntime.awrap(canvasPosts.aggregate([{
                      $match: query
                    }, {
                      $lookup: {
                        from: 'comments',
                        "let": {
                          postId: '$_id'
                        },
                        pipeline: [{
                          $match: {
                            $expr: {
                              $eq: ['$postId', {
                                $toString: '$$postId'
                              }]
                            }
                          }
                        }],
                        as: 'comments'
                      }
                    }, {
                      $addFields: {
                        commentCount: {
                          $size: '$comments'
                        }
                      }
                    }, {
                      $sort: {
                        postTime: -1
                      }
                    }, {
                      $skip: page * size
                    }, {
                      $limit: size
                    }, {
                      $project: {
                        comments: 0 // Exclude comments array from the result

                      }
                    }]).toArray());

                  case 7:
                    result = _context12.sent;
                    res.send(result);
                    _context12.next = 15;
                    break;

                  case 11:
                    _context12.prev = 11;
                    _context12.t0 = _context12["catch"](0);
                    res.status(500).send("Error fetching posts");
                    console.log("Error fetching posts ", _context12.t0);

                  case 15:
                  case "end":
                    return _context12.stop();
                }
              }
            }, null, null, [[0, 11]]);
          }); // total POST count

          app.get('/api/v1/post-count', function _callee13(req, res) {
            var count, totalPost;
            return regeneratorRuntime.async(function _callee13$(_context13) {
              while (1) {
                switch (_context13.prev = _context13.next) {
                  case 0:
                    _context13.prev = 0;
                    _context13.next = 3;
                    return regeneratorRuntime.awrap(canvasPosts.estimatedDocumentCount());

                  case 3:
                    count = _context13.sent;
                    totalPost = count.toString();
                    res.send(totalPost);
                    _context13.next = 12;
                    break;

                  case 8:
                    _context13.prev = 8;
                    _context13.t0 = _context13["catch"](0);
                    console.error("Error fetching count:", _context13.t0);
                    res.status(500).send("Error fetching count");

                  case 12:
                  case "end":
                    return _context13.stop();
                }
              }
            }, null, null, [[0, 8]]);
          }); // get sigele post

          app.get('/api/v1/post-details/:id', function _callee14(req, res) {
            var id, query, result;
            return regeneratorRuntime.async(function _callee14$(_context14) {
              while (1) {
                switch (_context14.prev = _context14.next) {
                  case 0:
                    _context14.prev = 0;
                    id = req.params.id; // const query = { _id: id }

                    query = {
                      _id: new ObjectId(id)
                    }; // console.log(" query = {}: ",query);

                    _context14.next = 5;
                    return regeneratorRuntime.awrap(canvasPosts.findOne(query));

                  case 5:
                    result = _context14.sent;
                    res.send(result);
                    _context14.next = 13;
                    break;

                  case 9:
                    _context14.prev = 9;
                    _context14.t0 = _context14["catch"](0);
                    res.send({
                      error: _context14.t0
                    });
                    console.log(_context14.t0.message);

                  case 13:
                  case "end":
                    return _context14.stop();
                }
              }
            }, null, null, [[0, 9]]);
          }); // recent 3 posts for user profile
          // TODO: get recent 3 post **

          /** *******************************************************************
           * ************************** Comments Api  ***************************
           * ********************************************************************
          */

          app.get('/api/v1/comments/:pId', function _callee15(req, res) {
            var postId, query, result;
            return regeneratorRuntime.async(function _callee15$(_context15) {
              while (1) {
                switch (_context15.prev = _context15.next) {
                  case 0:
                    postId = req.params.pId;
                    query = {
                      postId: postId
                    };
                    _context15.next = 4;
                    return regeneratorRuntime.awrap(canvasComments.find(query).sort({
                      commentTime: -1
                    }).toArray());

                  case 4:
                    result = _context15.sent;
                    res.send(result);

                  case 6:
                  case "end":
                    return _context15.stop();
                }
              }
            });
          });
          app.post('/api/v1/add-comment', function _callee16(req, res) {
            var newComment, result;
            return regeneratorRuntime.async(function _callee16$(_context16) {
              while (1) {
                switch (_context16.prev = _context16.next) {
                  case 0:
                    newComment = req.body;
                    _context16.next = 3;
                    return regeneratorRuntime.awrap(canvasComments.insertOne(newComment));

                  case 3:
                    result = _context16.sent;
                    res.send(result);

                  case 5:
                  case "end":
                    return _context16.stop();
                }
              }
            });
          });
          /**
           * ****************************************************************
           * ********************   Stripe for Payment   ********************
           * ****************************************************************
          */

          app.post('/api/v1/create-payment-intent', function _callee17(req, res) {
            var price, amount, paymentIntent;
            return regeneratorRuntime.async(function _callee17$(_context17) {
              while (1) {
                switch (_context17.prev = _context17.next) {
                  case 0:
                    _context17.prev = 0;
                    price = req.body.price;
                    amount = price * 100;
                    _context17.next = 5;
                    return regeneratorRuntime.awrap(stripe.paymentIntents.create({
                      amount: amount,
                      currency: 'usd',
                      payment_method_types: ["card"]
                    }));

                  case 5:
                    paymentIntent = _context17.sent;
                    res.send({
                      clientSecret: paymentIntent.client_secret
                    });
                    _context17.next = 13;
                    break;

                  case 9:
                    _context17.prev = 9;
                    _context17.t0 = _context17["catch"](0);
                    console.error('Error creating payment intent:', _context17.t0);
                    res.status(500).send({
                      error: 'Failed to create payment intent'
                    });

                  case 13:
                  case "end":
                    return _context17.stop();
                }
              }
            }, null, null, [[0, 9]]);
          }); // Send a ping to confirm a successful connection

          _context18.next = 26;
          return regeneratorRuntime.awrap(client.db("admin").command({
            ping: 1
          }));

        case 26:
          console.log("Pinged your deployment. You successfully connected to MongoDB!");

        case 27:
          _context18.prev = 27;
          return _context18.finish(27);

        case 29:
        case "end":
          return _context18.stop();
      }
    }
  }, null, null, [[0,, 27, 29]]);
}

run()["catch"](console.dir);
app.get('/', function (req, res) {
  res.send('chat canvas server running..........');
});
app.listen(PORT, function () {
  console.log("Example app listening on port ".concat(PORT));
});