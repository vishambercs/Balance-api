var express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var routeindex = require('./Route/routeindex');
var app = express();
const https = require('http');
var path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
require('dotenv').config();
app.get('/', function (req, res) { res.send('Welcome to Lyo Merchant'); });
app.use('/api', routeindex);

mongoose.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true });

mongoose.connection.once('open', function () {
    console.log('Database connected Successfully');
}).on('error', function (err) {
    console.log('Error', err);
})

app.listen(process.env.SERVER_PORT, function () {
    console.log(`Example app listening at ${process.env.SERVER_PORT}`);
});













