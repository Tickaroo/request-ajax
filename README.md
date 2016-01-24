# request-ajax [![npm version](https://badge.fury.io/js/request-ajax.svg)](https://www.npmjs.com/package/request-ajax) [![Build Status](https://travis-ci.org/Tickaroo/request-ajax.svg?branch=master)](https://travis-ci.org/Tickaroo/request-ajax)

HTTP request client for APIs, based on request

## Install

```bash
$ npm install --save request-ajax
```

## Usage

Below is a example of usage.

```javascript
var express = require('express');
var ajax = require('request-ajax');

var app = express();

app.get('/', function(req, res, next){
  ajax({
    // only JSON API is supported
    url: 'http://my-api.com/users.json'
    // your API auth
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    // callbacks
    error: function(apiRequestError, apiResponse, statusCode) {
      next(apiRequestError || new Error('API error: ' + apiResponse.body));
    },
    success: function(data, apiResponse, statusCode) {
      var userCount = data.length;
      res.send('user count: ' + userCount);
    },
    complete: function(apiRequestError, isApiSuccess, apiResponse) {
      // ...
    }
  });
});
```

## Options

#### `url`, required

API url, `https` will be removed from the url

#### `allowHTTPS`
default `false`

if `false`: HTTPS requests are changed to HTTP

#### `method`
default `'GET'`

HTTP method to use for the request e.g. 'POST'

#### `type`
same as `method`


#### `headers`
default `{}`, custom headers

```javascript
headers: {
  'X-FOO': 'BAR'
}
```

#### `locale`
default `undefined`, sets `Accept-Language` header

#### `accessToken`
default `undefined`, sets `Bearer`

```javascript
requestOptions.auth = {
  bearer: options.accessToken
};
```
[more about request auth option](https://github.com/request/request)

#### `apiClientId, origin`
default `undefined`, sets `Authorization` header

```javascript
requestOptions.headers.Authorization = 'Basic ' + new Buffer(options.apiClientId + ':').toString('base64');
requestOptions.headers.Origin = options.origin;
```

#### `clientId, clientSecret`
default `undefined`, sets `Bearer`

```javascript
requestOptions.auth = {
  user: options.clientId,
  pass: options.clientSecret
};
```
[more about request auth user/pass option](https://github.com/request/request)

###### auth note:
`accessToken` wins over `apiClientId, origin` wins over `clientId, clientSecret`

#### `timeout`
default `undefined`, [proxy to the request timeout option](https://github.com/request/request)


------

Backbone tests were copied form [artsy/backbone-super-sync](https://github.com/artsy/backbone-super-sync)
