/**
 * Module dependencies
 */

var JWT = require('./JWT')
  , async = require('async')
  , request = require('superagent')
  , UnauthorizedError = require('../errors/UnauthorizedError')
  ;

/**
 * AccessToken
 */

var AccessToken = JWT.define({

});


/**
 * Verify
 */

AccessToken.verify = function (token, options, callback) {

  async.parallel({

    jwt: function (done) {
      if (token.indexOf('.') !== -1) {
        var at = AccessToken.decode(token, options.key);
        if (!at || at instanceof Error) {
          done(at);
        } else {
          done(null, at);
        }
      } else {
        done();
      }
    },

    random: function (done) {
      if (token.indexOf('.') === -1) {
        request
          .post(options.iss + '/token/verify')
          .set('Authorization', 'Bearer ' + options.jwt)
          .set('Content-Type',  'application/json')
          .send({ access_token: token })
          .end(function (err, response) {
            // superagent error
            if (err) {
              return done(err);
            }

            // Forbidden client or invalid access token
            if (response.body && response.body.error) {
              done(new UnauthorizedError(response.body));
            }

            else {
              done(null, response.body)
            }
          });

      } else {
        done();
      }
    }

  }, function (err, result) {

    if (err) { return callback(err); }

    var claims  = result.random || result.jwt.payload
      , clients = options.clients
      ;

    // mismatching issuer
    if (claims.iss !== options.iss) {
      return callback(new UnauthorizedError({
        error:              'invalid_token',
        error_description:  'Mismatching issuer',
        statusCode:          403
      }));
    }

    // mismatching audience
    if (clients && clients.indexOf(claims.aud) === -1) {
      return callback(new UnauthorizedError({
        error:              'invalid_token',
        error_description:  'Mismatching audience',
        statusCode:          403
      }));
    }

    // expired token
    if (claims.exp < Date.now()) {
      return callback(new UnauthorizedError({
        error:              'invalid_token',
        error_description:  'Expired access token',
        statusCode:          403
      }));
    }

    // insufficient scope
    if (claims.scope.indexOf(options.scope) === -1) {
      return callback(new UnauthorizedError({
        error:              'insufficient_scope',
        error_description:  'Insufficient scope',
        statusCode:          403
      }));
    }

    callback(null, claims);
  });

}


/**
 * Export
 */

module.exports = AccessToken;
