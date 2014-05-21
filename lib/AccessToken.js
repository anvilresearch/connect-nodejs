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

    // select the appropriate result
    // validate the fuck out of this thing here

    callback(null, result.random || result.jwt.payload);
  });

}


/**
 * Export
 */

module.exports = AccessToken;
