var express = require('express');
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config');
var port;
var urlmongo = '';
var hostname = '0.0.0.0';
var prod = true;

if (prod) {
    port = 8080;
    urlmongo = "mongodb://uiqih4yxnei1hpm:wmKFfwvWZufjvb3TGr0V@bus1nkbynrpnrwo-mongodb.services.clever-cloud.com:27017/bus1nkbynrpnrwo";
    hostname = 'memento.cleverapps.io';
    var hostname = '0.0.0.0';
} else {
    port = 3000;
    hostname = 'localhost';
    urlmongo = "mongodb://localhost/db_test_2";
}

var options = {
    server: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}},
    replset: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}}
};
mongoose.connect(urlmongo, {useMongoClient: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur lors de la connexion'));
db.once('open', function () {
    console.log("Connexion à la base OK");
});
var app = express();
app.set('port', process.env.PORT || port);
app.set('host', process.env.HOST || hostname);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // * => allow all origins
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token, Accept'); // add remove headers according to your needs
    next()
})
app.set('superSecret', config.secret); // secret variable
var categorySchema = mongoose.Schema({
    name: String,
    list: Array,
    search: String,
    icon: String,
    userId: String
});
var listSchema = mongoose.Schema({
    name: String,
    cat_id: String
});
var userShema = mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    id: Number,
    password: String
});
var Category = mongoose.model('Category', categorySchema);
var List = mongoose.model('List', listSchema);
var User = mongoose.model('User', userShema);

var myRouter = express.Router();


myRouter.route('/')
    .all(function (req, res) {
        res.json({message: "Bienvenue sur notre Frugal API ", methode: req.method});
    });


myRouter.route('/addUser')
    .post(function (req, res) {

		if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email.toLowerCase())){
			var user = new User();
			user.first_name = req.body.first_name.toLowerCase();
			user.last_name = req.body.last_name.toLowerCase();
			user.email = req.body.email.toLowerCase();
			user.password = (req.body.password) ? req.body.password : '';
			user.id = req.body.id;
			user.save(function (err) {
				if (err) {
					res.send(err);
				}
				var token = jwt.sign(user, app.get('superSecret'));
				info = {
					success: true,
					message: 'Enjoy your token!',
					token: token
				}
				res.send(info);
			});
		} else {
			info = {
				success: false,
				message: 'You have entered an invalid email address!',
				token: ''
			}
        }
    });
/*myRouter.route('/loggin')
	.post(function (req, res) {
		console.log(req.body);
		User.findOne({email: req.body.email, password: req.body.password}, function (err, user) {
			if (err)
				res.send(err);
			var userFind;
			if(user.length){
				userFind = user;
			} else {
				userFind = false;
			}
			res.json(userFind);
		});
	})*/

myRouter.route('/loggin')
    .post(function (req, res) {
        var info;
        // find the user
        User.findOne({
            email: req.body.email.toLowerCase()
        }, function (err, user) {

            if (err) {
                info = err
            }
            ;

            if (!user) {
                info = {success: false, message: 'Authentication failed. User not found.'};
            } else if (user) {

                // check if password matches
                if (user.password != req.body.password) {
                    info = {success: false, message: 'Authentication failed. Wrong password.'};
                } else {

                    // if user is found and password is right
                    // create a token
                    // console.log('user', user);
                    var token = jwt.sign(user, app.get('superSecret'));
                    // console.log('token', token);
                    info = {
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    }

                    // return the information including token as JSON
                }

            }
            res.json(info);
        });
    });
//FB
myRouter.route('/findUserByIdFB/:id')
    .get(function (req, res) {
        User.find({id: req.params.id}, function (err, user) {
            var info;
            if (err)
                res.send(err);
            if (user) {
                var token = jwt.sign(user[0], app.get('superSecret'));
                info = {
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                }
                res.send(info);
            } else {

                info = {
                    success: false,
                    message: 'create account!',
                    token: ''
                }
                res.send(info);
            }
        });
    })
myRouter.route('/deleteUserById/:id')
    .delete(function (req, res) {
        User.remove({_id: req.params.id}, function (err, list) {
            if (err) {
                res.send(err);
            }
            res.status(200).json({_id: req.params.id});
        });

    });

myRouter.route('/category')
    .get(function (req, res) {

        var token = req.body.token || req.query.token || req.headers['x-auth-token'];
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, app.get('superSecret'), function (err, decoded) {
                if (err) {
                    info = {success: false, message: 'Failed to authenticate token.'};
                    return res.status(200).send(info);
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    info = {
                        success: true,
                        message: '',
                        user: decoded._doc
                    }
                    Category.find({userId: decoded._doc._id.toString()},
                        function (err, category) {
                            if (err) {
                                res.send(err);
                            }
                            res.status(200).send(category);
                        });


                    //next();
                }
            });


        }
    });
myRouter.route('/addCategory')
    .post(function (req, res) {
        var token = req.body.token || req.query.token || req.headers['x-auth-token'];
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, app.get('superSecret'), function (err, decoded) {
                if (err) {
                    info = {success: false, message: 'Failed to authenticate token.'};
                    return res.send(info);
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    info = {
                        success: true,
                        message: '',
                        user: decoded._doc
                    }

                    var category = new Category();
                    category.userId = decoded._doc._id;
                    category.name = req.body.name;
                    category.search = req.body.search;
                    category.icon = req.body.icon;
                    category.list = [];
                    category.save(function (err) {
                        if (err) {
                            res.send(err);
                        }
                        res.send(category);
                    });
                    //next();
                }
            });
        }

    });

myRouter.route('/categoryById/:category_id')
    .get(function (req, res) {
        console.log(req.body.category_id);
        Category.findById(req.body.category_id, function (err, piscine) {
            if (err)
                res.send(err);
            res.json(piscine);
        });
    })
    .delete(function (req, res) {
		var token = req.body.token || req.query.token || req.headers['x-auth-token'];
		// decode token
		if (token) {
			// verifies secret and checks exp
			jwt.verify(token, app.get('superSecret'), function (err, decoded) {
				if (err) {
					info = {success: false, message: 'Failed to authenticate token.'};
					return res.send(info);
				} else {
					// if everything is good, save to request for use in other routes
					req.decoded = decoded;
					info = {
						success: true,
						message: '',
						user: decoded._doc
					}
					console.log(req.params.category_id);
					Category.remove({_id: req.params.category_id, userId: decoded._doc._id}, function (err, result) {
						if (err) {
							res.send(err);
						}
						console.log('remove');
						res.status(200).send({_id: req.params.category_id});
					});
				}
			});
		}else {
			res.status(200).send({_id: ''});
        }
    });

myRouter.route('/updateListCategory/:category_id')
    .put(function (req, res) {
        console.log('put updateListCategory');
        Category.findById(req.params.category_id, function (err, piscine) {
            if (err) {
                res.send(err);
            }
            console.log(req.body);
            if (piscine.list.indexOf(req.body.params._id) !== -1) {
                piscine.list.splice(piscine.list.indexOf(req.body.params._id), 1);
            } else {
                piscine.list.push(req.body.params._id);
            }
            piscine.save(function (err) {
                if (err) {
                    res.send(err);
                }
                res.status(200).json({_id: req.body.params._id});
            });
        });
    })


myRouter.route('/addList')
    .post(function (req, res) {
        var list = new List();
        list.name = req.body.name;
        list.cat_id = req.body.cat_id;
        // console.log(req);
        list.save(function (err) {
            if (err) {
                res.send(err);
            }
            res.send(list);
        });
    });

myRouter.route('/list/:cat_id')
    .get(function (req, res) {
        List.find({cat_id: req.params.cat_id}, function (err, list) {
            if (err) {
                res.send(err);
            }
            res.status(200).send(list);
        });
    });


myRouter.route('/deleteList/:id')
    .delete(function (req, res) {
        console.log('delete list');
        List.remove({_id: req.params.id}, function (err, list) {
            if (err) {
                res.send(err);
            }
            res.status(200).json({_id: req.params.id});
        });

    });

myRouter.route('/updateList/:id')
    .put(function (req, res) {
        console.log('put updateList');
        List.findById(req.params.id, function (err, list) {
            if (err) {
                res.send(err);
            }
            list.name = req.body.params.name;
            list.save(function (err) {
                if (err) {
                    res.send(err);
                }
                res.status(200).json(list);
            });
        });
    });

myRouter.route('/getToken')
    .get(function (req, res, next) {
        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.headers['x-auth-token'];
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, app.get('superSecret'), function (err, decoded) {
                if (err) {
                    info = {success: false, message: 'Failed to authenticate token.'};
                    return res.status(200).send(info);
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    info = {
                        success: true,
                        message: '',
                        user: decoded._doc
                    }
                    return res.send(info);
                    //next();
                }
            });
        } else {
            // if there is no token
            // return an error
            info = {
                success: false,
                message: 'No token provided.'
            }
            return res.status(200).send(info);
        }
    });

app.use(myRouter);

app.listen(port, hostname, function () {
    console.log("Mon serveur fonctionne sur http://" + hostname + ":" + port);
});


/*
 */