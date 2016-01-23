var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.get('/users', function(req, res, next){
  res.json([{name: 'Ivan'}, {name: 'Vlad'}]);
});

app.post('/update', function(req, res, next){
  res.json({updated: 10 + req.body.number});
});

app.get('/error', function(req, res, next){
  res.status(500);
  res.json({error: true});
});

app.get('/forbidden', function(req, res, next){
  res.status(403);
  res.json({forbidden: true});
});

app.get('/not_found', function(req, res, next){
  res.status(404);
  res.json({not_found: true});
});

module.exports = app;
