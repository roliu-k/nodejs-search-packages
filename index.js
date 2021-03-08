// initialize express and path	
const express = require('express');
const path = require('path');

// initialize assert
const assert = require('assert');

//initialize app
const app = express();
const bodyParser = require('body-parser');

//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// initialize MONGODB, its server URL and reference the client instance and collection
var mongodb = require('mongodb');
const dbConn = mongodb.MongoClient.connect('YourMongodbServerUrl', { useNewUrlParser: true, useUnifiedTopology: true });

// this is going to serve static files like css and script and
// use the path method to help direct to the other directory
app.use('/static', express.static(path.join(__dirname, 'static')));

// url for mongodb when calling specific packages
const url = 'YourMongodbServerUrl';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, 'views')));

// start server
app.listen(8000, function () {
    console.log('Server started on port 8000');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/registration', (req, res) => {
    res.render('registration');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.post('/contact', function (req, res) {
    dbConn.then(function (db) {
        const dbo = db.db('TravelAgency');
        delete req.body._id; // this is here for security reasons
        dbo.collection('Contact').insertOne(req.body);
    });
    // this will place a string of submitted data on a new page   
    res.send('Data received:\n' + JSON.stringify(req.body));
});

// received the data from registration form and then send it to the database
app.post("/submitform", (req, res) => {
    dbConn.then(function(db) {
        const dbo = db.db('TravelAgency');
        delete req.body._id;
        dbo.collection('Customer').insertOne(req.body);
    })
    // write out the data received for test purpose
    res.send('Data received:\n' + JSON.stringify(req.body));
});

// this section is to route from main packages to the package clicked
mongodb.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) {
        throw new Error('danger will robinson');
        return;
    }

    const db = client.db('database');
    const collection = db.collection('packages');

    app.get('/packages(*)', (req, res, next) => {
        let path = req.url;
        let newPath = path.replace(/%20/g, " ");
        let query = newPath.split('/');
        let regex = new RegExp(query[2], "i");

        collection.find({ PkgName: regex }).toArray((err, packages) => {
            assert.equal(err, null);
            res.render('single', { packages });
        });
    });

    app.get('/index', (req, res, next) => {
        collection.find({}).toArray((err, packages) => {
            assert.equal(err, null);
            res.render('index', { packages });
        });
    });
    app.get('/', (req, res, next) => {
        collection.find({}).toArray((err, packages) => {
            assert.equal(err, null);
            res.render('index', { packages });
        });
    });
});
