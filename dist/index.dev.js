"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var express = require('express');

var app = express();

var cors = require('cors');

var _require = require('mongodb'),
    MongoClient = _require.MongoClient,
    ServerApiVersion = _require.ServerApiVersion;

require('dotenv').config();

var jwt = require('jsonwebtoken');

var PORT = process.env.PORT || 5000;
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
var uri = "mongodb+srv://".concat(process.env.DB_NAME, ":").concat(process.env.DB_PASS, "@cluster0.vcouptk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"); // Create a MongoClient with a MongoClientOptions object to set the Stable API version

var client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

function run() {
  var canvasUsers, canvasPosts, canvasAnnounce;
  return regeneratorRuntime.async(function run$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          try {
            // Connect the client to the server	(optional starting in v4.7)
            client.connect();
            canvasUsers = client.db('chatCanvas').collection('users');
            canvasPosts = client.db('chatCanvas').collection('test');
            canvasAnnounce = client.db('chatCanvas').collection('announcement');
            /**
             * ****************************************************************
             * ************************ User Releted Api **********************
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
            }); // add user 

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
            });
            /**
             * ****************************************************************
             * *********************** Admin Announcement Api *****************
             * ****************************************************************
             */

            app.get("/api/v1/announcement", function _callee5(req, res) {
              var result;
              return regeneratorRuntime.async(function _callee5$(_context5) {
                while (1) {
                  switch (_context5.prev = _context5.next) {
                    case 0:
                      _context5.prev = 0;
                      _context5.next = 3;
                      return regeneratorRuntime.awrap(canvasAnnounce.find().toArray());

                    case 3:
                      result = _context5.sent;
                      res.send(result);
                      _context5.next = 10;
                      break;

                    case 7:
                      _context5.prev = 7;
                      _context5.t0 = _context5["catch"](0);
                      console.log('get error : ', _context5.t0);

                    case 10:
                    case "end":
                      return _context5.stop();
                  }
                }
              }, null, null, [[0, 7]]);
            }); // announcement count

            app.get('/api/v1/announcement-count', function _callee6(req, res) {
              var result, count;
              return regeneratorRuntime.async(function _callee6$(_context6) {
                while (1) {
                  switch (_context6.prev = _context6.next) {
                    case 0:
                      _context6.prev = 0;
                      _context6.next = 3;
                      return regeneratorRuntime.awrap(canvasAnnounce.estimatedDocumentCount());

                    case 3:
                      result = _context6.sent;
                      count = result.toString();
                      res.send(count);
                      _context6.next = 12;
                      break;

                    case 8:
                      _context6.prev = 8;
                      _context6.t0 = _context6["catch"](0);
                      console.error('Error in announcement-count:', _context6.t0);
                      res.status(500).send('Error fetching announcement count');

                    case 12:
                    case "end":
                      return _context6.stop();
                  }
                }
              }, null, null, [[0, 8]]);
            });
            /**
             * ****************************************************************
             * ************************ POST Releted Api **********************
             * ****************************************************************
             */
            // test api posts

            app.get("/api/v1/test-posts", function _callee7(req, res) {
              var result;
              return regeneratorRuntime.async(function _callee7$(_context7) {
                while (1) {
                  switch (_context7.prev = _context7.next) {
                    case 0:
                      _context7.prev = 0;
                      _context7.next = 3;
                      return regeneratorRuntime.awrap(canvasPosts.find().sort({
                        updatedAt: -1
                      }).toArray());

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
            }); // get all post

            app.get("/api/v1/posts", function _callee8(req, res) {
              var result;
              return regeneratorRuntime.async(function _callee8$(_context8) {
                while (1) {
                  switch (_context8.prev = _context8.next) {
                    case 0:
                      _context8.prev = 0;
                      _context8.next = 3;
                      return regeneratorRuntime.awrap(canvasPosts.find().toArray());

                    case 3:
                      result = _context8.sent;
                      res.send(result);
                      _context8.next = 10;
                      break;

                    case 7:
                      _context8.prev = 7;
                      _context8.t0 = _context8["catch"](0);
                      console.log('get error : ', _context8.t0);

                    case 10:
                    case "end":
                      return _context8.stop();
                  }
                }
              }, null, null, [[0, 7]]);
            }); // total POST count

            app.get('/api/v1/post-count', function _callee9(req, res) {
              var count, totalPost;
              return regeneratorRuntime.async(function _callee9$(_context9) {
                while (1) {
                  switch (_context9.prev = _context9.next) {
                    case 0:
                      _context9.prev = 0;
                      _context9.next = 3;
                      return regeneratorRuntime.awrap(canvasPosts.estimatedDocumentCount());

                    case 3:
                      count = _context9.sent;
                      totalPost = count.toString();
                      res.send(totalPost);
                      _context9.next = 12;
                      break;

                    case 8:
                      _context9.prev = 8;
                      _context9.t0 = _context9["catch"](0);
                      console.error("Error fetching count:", _context9.t0);
                      res.status(500).send("Error fetching count");

                    case 12:
                    case "end":
                      return _context9.stop();
                  }
                }
              }, null, null, [[0, 8]]);
            }); // Send a ping to confirm a successful connection
            // await client.db("admin").command({ ping: 1 });
            // console.log("Pinged your deployment. You successfully connected to MongoDB!");
          } finally {// Ensures that the client will close when you finish/error
            // await client.close();
          }

        case 1:
        case "end":
          return _context10.stop();
      }
    }
  });
}

run()["catch"](console.dir);
app.get('/', function (req, res) {
  res.send('chat canvas server running..........');
});
app.listen(PORT, function () {
  console.log("Example app listening on port ".concat(PORT));
});