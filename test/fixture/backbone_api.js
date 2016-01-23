var bodyParser = require('body-parser');

module.exports = function (app) {
  app.get('/raw/body', function(req, res) {
    req.rawBody = '';
    req.on('data', function(chunk) {
      req.rawBody += chunk;
    });
    req.on('end', function() {
      res.send({ foo: 'bar' });
    });
  });
  app.use(bodyParser.json());
  app.all('/foo/bar', function(req, res) {
    res.send({ foo: 'bar' });
  });
  app.all('/custom/url', function(req, res) {
    res.send({ baz: 'qux' });
  });
  app.all('/timeout', function(req, res) {
    setTimeout(function() {
      res.send({ baz: 'qux' });
    }, 1000);
  });
  app.get('/err', function(req, res) {
    res.status(404).json({ message: 'Not Found' });
  });
  app.get('/headers', function(req, res) {
    res.set({ 'X-Foo-Bar': 'baz' });
    res.send({ foo: 'headers' });
  });
  app.get('/passheaders', function(req, res) {
    res.send(req.headers);
  });
};
