'use strict'

//first we import our dependencies…
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//and create our instances
var app = express();
var router = express.Router();

//set our port to either a predetermined port number if you have set 
//it up, or 3001
var port = process.env.API_PORT || 3005;

//db connection
mongoose.connect(`mongodb://${process.env.MLABUSER}:${process.env.MLABPASS}@ds159747.mlab.com:59747/traction_cookbook`);
mongoose.set('debug', true);
var db = mongoose.connection;

// When successfully connected
db.on('connected', function() {
    console.log('Mongo DB connection open for DB');
});

//now we should configure the API to use bodyParser and look for 
//JSON data in the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//To prevent errors from Cross Origin Resource Sharing, we will set 
//our headers to allow CORS with middleware like so:
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    
    //and remove cacheing so we get the most recent comments
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

//now we can set the route path & initialize the API
router.get('/', function(req, res) {
    res.json({ message: 'API Initialized for CookBook' });
});

//adding the /recipes route to our /api router
router.route('/recipes')
    //retrieve all recipes from the database
    .get((req, res) => {
        //looks at our recipes Schema
       db.collection('recipes').find().toArray(function(err, recipes) {
         console.log(recipes)
         res.json(recipes);
         // send HTML file populated with quotes here
       });

    })
    .put((req, res) => {
		db.collection('recipes').findOneAndUpdate({ id: req.body.id },
			req.body, {
				sort: {_id: -1},
				upsert: true
			}, (err, result) => {
				if (err) return res.send(err);
				res.send(result);
		})
	})
	.delete((req, res) => {
		db.collection('recipes').findOneAndDelete({ id: req.body.id },
			(err, result) => {
				if (err) return res.send(500, err);
				res.send({message: 'recipe deleted'});
			});
	})
	.post((req, res) => {
		db.collection('recipes').insert(req.body,
			(err, result) => {
				if (err) return res.send(500, err);
				res.json({ message: 'Recipe successfully added!' });
			});
	});

//Use our router configuration when we call /api
app.use('/api', router);

//starts the server and listens for requests
app.listen(port, function() {
    console.log(`api running on port ${port}`);
});