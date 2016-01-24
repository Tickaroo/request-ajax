var express = require('express');
var Backbone = require('backbone');
var ajax = require('../');
require('should');

var lastRequest, model;
var app = express();

app.use(function(req, res, next) {
  lastRequest = req;
  next();
});

require('./fixture/backbone_api.js')(app);

describe('Backbone.ajax', function() {

  before(function(done){
    Backbone.ajax = ajax;
    app.listen(5000, done);
  });

  beforeEach(function() {
    model = new Backbone.Model();
    model.url = 'http://localhost:5000/foo/bar';
  });

  context('GET requests', function() {

    it('updates the model', function(done) {
      model.fetch({
        accessToken: true,
        success: function() {
          model.get('foo').should.equal('bar');
          done();
        }
      });
    });

    it("it returns the full 'res' object from superagent because it is the " +
       "closest thing to an xhr we have", function(done) {
      model.url = 'http://localhost:5000/err';
      model.fetch({
        accessToken: true,
        error: function(model, error, options) {
          options.xhr.href.should.equal(model.url);
          done();
        }
      });
    });

    it("can handle true errors", function(done) {
      model.url = 'http://localhost:5001/trueerr';
      model.fetch({
        accessToken: true,
        error: function(model, error) {
          error.toString().should.containEql("ECONNREFUSED");
          done();
        }
      });
    });

    it('accepts data params and adds them to query params', function(done) {
      model.fetch({
        accessToken: true,
        data: { foo: 'bar' },
        success: function() {
          lastRequest.query.foo.should.equal('bar');
          done();
        }
      });
    });

    it('preferences the options url', function(done) {
      model.url = 'http://localhost:5000/custom/url';
      model.fetch({
        accessToken: true,
        url: 'http://localhost:5000/custom/url',
        success: function() {
          model.get('baz').should.equal('qux');
          done();
        }
      });
    });

    it('can get the headers', function(done) {
      model.fetch({
        accessToken: true,
        url: 'http://localhost:5000/headers',
        success: function(model, res, options) {
          options.xhr.response.headers['x-foo-bar'].should.equal('baz');
          done();
        }
      });
    });

    it('can pass in the headers', function(done) {
      model.url = 'http://localhost:5000/passheaders';
      model.fetch({
        accessToken: true,
        headers: { "X-Foo": "Bar" },
        success: function(m, res) {
          res['x-foo'].should.equal('Bar');
          done();
        }
      });
    });

    it("accepts the `complete` option", function(done) {
      model.url = 'http://localhost:5000/err';
      model.fetch({
        accessToken: true,
        complete: function(error, isSuccess, res) {
          JSON.parse(res.body).message.should.equal("Not Found");
          done();
        }
      });
    });

    it("accepts the `error` option", function(done) {
      model.url = 'http://localhost:5000/err';
      model.fetch({
        accessToken: true,
        error: function(model, error, options) {
          JSON.parse(options.xhr.response.body).message.should.equal("Not Found");
          done();
        }
      });
    });


    it('can timeout at a custom ms when specificed', function(done) {
      model.url = 'http://localhost:5000/timeout';
      model.fetch({
        timeout: 10,
        accessToken: true,
        error: function(m, err) {
          err.message.should.containEql('ETIMEDOUT');
          done();
        }
      });
    });

    it('does not send empty body params', function(done) {
      model.url = 'http://localhost:5000/raw/body';
      model.fetch({
        accessToken: true,
        success: function() {
          lastRequest.rawBody.length.should.equal(0);
          done();
        }
      });
    });
  });

  context('POST requests', function() {

    it('adds the content-length header', function(done) {
      model.save({ foo: 'bar test' }, {
        accessToken: true,
        success: function() {
          lastRequest.headers['content-length'].should.equal('18');
          done();
        }
      });
    });

    it("it returns the full 'res' object from superagent because it is the " +
       "closest thing to an xhr we have", function(done) {
      model.url = 'http://localhost:5000/err';
      model.fetch({
        accessToken: true,
        error: function(model, err, options) {
          options.xhr.uri.href.should.equal(model.url);
          done();
        }
      });
    });

    it('adds the body data', function(done) {
      model.save({ foo: 'bar' }, {
        accessToken: true,
        success: function() {
          lastRequest.body.foo.should.equal('bar');
          done();
        }
      });
    });

    it('passes options to toJSON', function(done) {
      model.toJSON = function(options) {
        return { foo: options.foo };
      };
      model.save({}, {
        accessToken: true,
        foo: 'moo',
        success: function() {
          lastRequest.body.foo.should.equal('moo');
          done();
        }
      });
    });

    it('does not send empty query params', function(done) {
      model.url = 'http://localhost:5000/foo/bar';
      model.save({}, {
        accessToken: true,
        success: function() {
          Object.keys(lastRequest.query).length.should.equal(0);
          done();
        }
      });
    });
  });
});
