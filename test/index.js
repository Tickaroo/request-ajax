var expect = require('chai').expect;
var ajax = require('../');
var api = require('./fixture/api.js');

describe('request-ajax', function() {
  var server;

  before(function(done) {
    server = api.listen(1235, done);
  });

  after(function() {
    server.close();
  });

  it('empty ajax() should not throw errors', function() {
    expect(ajax()).to.be.an('object');
  });

  it('should count json response', function(done) {
    ajax({
      url: 'http://localhost:1235/users',
      dataType: 'json',
      accessToken: true,
      error: function() {},
      success: function(data, res, statusCode) {
        expect(statusCode).to.equal(200);
        expect(res.body.length).to.equal(33);
        expect(data.length).to.equal(2);
        done();
      }
    });
  });

  it('should update via POST', function(done) {
    ajax({
      url: 'http://localhost:1235/update',
      method: 'POST',
      data: {number: 5},
      accessToken: true,
      error: function() {},
      success: function(data, res, statusCode) {
        expect(statusCode).to.equal(200);
        expect(data.updated).to.equal(15);
        done();
      }
    });
  });

  it('should call complete for success', function(done) {
    ajax({
      url: 'http://localhost:1235/users',
      accessToken: true,
      error: function() {},
      complete: function(error, isSuccess, res) {
        expect(isSuccess).to.equal(true);
        expect(res.body).to.equal('[{"name":"Ivan"},{"name":"Vlad"}]');
        done();
      }
    });
  });

  it('should call complete for error', function(done) {
    ajax({
      url: 'http://localhost:1235/error',
      accessToken: true,
      error: function() {},
      complete: function(error, isSuccess, res) {
        expect(isSuccess).to.equal(false);
        expect(res.body).to.equal('{"error":true}');
        done();
      }
    });
  });

  it('should call error', function(done) {
    ajax({
      url: 'http://localhost:1235/error',
      accessToken: true,
      error: function(error, res, statusCode) {
        expect(statusCode).to.equal(500);
        expect(res.body).to.equal('{"error":true}');
        done();
      }
    });
  });

  it('should call error after `request` fails', function(done) {
    ajax({
      url: 'http://localhost:1235/error',
      error: function(error, res, statusCode) {
        expect(statusCode).to.equal(undefined);
        expect(error.toString()).to.equal('Error: no auth mechanism defined');
        done();
      }
    });
  });

  it('should call complete after `request` fails', function(done) {
    ajax({
      url: 'http://localhost:1235/error',
      error: function() {},
      complete: function(error, isSuccess, res) {
        expect(error.toString()).to.equal('Error: no auth mechanism defined');
        expect(isSuccess).to.equal(false);
        expect(res).to.equal(undefined);
        done();
      }
    });
  });

  it('should not call success', function(done) {
    ajax({
      url: 'http://localhost:1235/error',
      accessToken: true,
      success: function(){
        throw new Error('success callback was called!');
      },
      complete: function() {
        setTimeout(done);
      }
    });
  });

  it('should not call error', function(done) {
    ajax({
      url: 'http://localhost:1235/users',
      accessToken: true,
      error: function(){
        throw new Error('error callback was called!');
      },
      complete: function() {
        setTimeout(done);
      }
    });
  });

  it('should override default method option', function(done) {
    ajax({
      url: 'http://localhost:1235/users',
      method: 'POST',
      accessToken: true,
      error: function(error, res, statusCode) {
        expect(statusCode).to.equal(404);
        done();
      }
    });
  });

  it('should remove "https" form url', function(done) {
    ajax({
      url: 'https://localhost:1235/users',
      accessToken: true,
      error: function() {},
      complete: function(error, isSuccess, res) {
        expect(res.request.uri.protocol).to.equal('http:');
        done();
      }
    });
  });

  it('should allow "https" form url', function(done) {
    ajax({
      url: 'https://localhost:1235/users',
      allowHTTPS: true,
      accessToken: true,
      error: function(error) {
        // https request fails because api.js can't handle it
        expect(error.toString()).to.equal('Error: socket hang up');
        done();
      }
    });
  });

  it('should use locale', function(done) {
    ajax({
      url: 'http://localhost:1235/users',
      method: 'POST',
      accessToken: true,
      locale: 'de',
      error: function() {},
      complete: function(error, isSuccess, res) {
        expect(res.request.headers['Accept-Language']).to.equal('de');
        done();
      }
    });
  });

  it('should use apiClientId', function(done) {
    ajax({
      url: 'http://localhost:1235/users',
      method: 'POST',
      apiClientId: 'foobar',
      error: function() {},
      complete: function(error, isSuccess, res) {
        expect(res.request.headers.Authorization).to.equal('Basic Zm9vYmFyOg==');
        done();
      }
    });
  });

  it('should combine headers', function(done) {
    ajax({
      url: 'http://localhost:1235/users',
      method: 'POST',
      apiClientId: 'foobar',
      locale: 'de',
      error: function() {},
      complete: function(error, isSuccess, res) {
        expect(res.request.headers.Authorization).to.equal('Basic Zm9vYmFyOg==');
        expect(res.request.headers['Accept-Language']).to.equal('de');
        done();
      }
    });
  });

  it('should use clientId and clientSecret', function(done) {
    ajax({
      url: 'http://localhost:1235/users',
      method: 'POST',
      clientId: 'foo',
      clientSecret: 'bar',
      error: function() {},
      complete: function(error, isSuccess, res) {
        expect(res.request._auth.user).to.equal('foo');
        expect(res.request._auth.pass).to.equal('bar');
        done();
      }
    });
  });

});
