var request = require('request');

module.exports = function(opts) {
  var options, optionsError, requestOptions;
  options = opts ? opts : {};
  requestOptions = {
    auth: undefined,
    headers: options.headers || {},
    timeout: options.timeout,
    method: options.method || options.type || 'GET',
    url: options.prefilterUrl ? options.prefilterUrl(options.url) : options.url
  };
  request.debug = options.debug;

  if (options.data) {
    if (requestOptions.method === 'GET') {
      requestOptions.qs = options.data;
    }
    else {
      if (typeof options.data === 'string') {
        requestOptions.json = JSON.parse(options.data);
      }
      else {
        requestOptions.json = options.data;
      }
    }
  }

  if ( ! options.error) {
    optionsError = new Error('`options.error` callback has to be defined');
  }

  if (options.locale) {
    requestOptions.headers = Object.assign({
      'Accept-Language': options.locale
    }, options.headers);
  }

  if (options.accessToken) {
    requestOptions.auth = {
      bearer: options.accessToken
    };
  }
  else {
    if (options.apiClientId) {
      requestOptions.headers.Authorization = 'Basic ' + new Buffer(options.apiClientId + ':').toString('base64');
      requestOptions.headers.Origin = options.origin;
    }
    else {
      requestOptions.auth = {
        user: options.clientId,
        pass: options.clientSecret
      };
    }
  }

  return request(requestOptions, function(error, response, body) {
    var statusCode = response && response.statusCode ? response.statusCode : 404;
    var isApiSuccess = statusCode < 400;
    var moduleError = error || optionsError;
    if (options.complete) {
      options.complete(moduleError, isApiSuccess, response, statusCode);
    }
    if (moduleError && options.error) {
      options.error(moduleError);
    }
    else {
      if (isApiSuccess) {
        if (options.success) {
          if (typeof body === 'string') {
            options.success(JSON.parse(body), response, statusCode);
          }
          else {
            options.success(body, response, statusCode);
          }
        }
      }
      else {
        if (options.error) {
          options.error(undefined, response, statusCode);
        }
      }
    }
  });
};
