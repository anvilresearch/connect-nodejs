/**
 * Module dependencies
 */

var JWT = require('anvil-connect-jwt')
var async = require('async')
var request = require('superagent')
var UnauthorizedError = require('../errors/UnauthorizedError')
var nowSeconds = require('./time-utils.js').nowSeconds

/**
 * AccessToken
 */

var AccessToken = JWT.define({
  // default header
  header: {
    alg: 'RS256'
  },

  headers: [
    'alg'
  ],

  // modify header schema
  registeredHeaders: {
    alg: { format: 'StringOrURI', required: true, enum: ['RS256'] }
  },

  // permitted claims
  claims: ['jti', 'iss', 'sub', 'aud', 'exp', 'iat', 'scope'],

  // modify payload schema
  registeredClaims: {
    jti: { format: 'String', required: true },
    iss: { format: 'URI', required: true },
    iat: { format: 'IntDate', required: true },
    exp: { format: 'IntDate', required: true },
    sub: { format: 'String', required: true },
    aud: { format: 'String', required: true },
    scope: { format: 'String', required: true }
  }

})

/**
 * Refresh
 */

AccessToken.refresh = function (refresh_token, options, callback) {
  if (!options.client_id || !options.client_secret || !refresh_token) {
    return callback(new UnauthorizedError('Missing client credentials'))
  }
  request
    .post(options.issuer + '/token')
    .auth(options.client_id, options.client_secret)
    .set('Content-Type', 'application/json')
    .send({ refresh_token: refresh_token, grant_type: 'refresh_token' })
    .end(function (err, response) {
      // superagent error
      if (err) {
        return callback(err)
      }

      // Forbidden client or invalid access token
      if (response.body && response.body.error) {
        return callback(new UnauthorizedError(response.body))
      } else {
        return callback(null, response.body)
      }
    })
}

/**
 * Verify
 */

AccessToken.verify = function (token, options, callback) {
  async.parallel({
    jwt: function (done) {
      if (token.indexOf('.') !== -1) {
        var at = AccessToken.decode(token, options.key)
        if (!at || at instanceof Error) {
          done(new UnauthorizedError({
            realm: 'user',
            error: 'invalid_token',
            error_description: 'Invalid access token',
            statusCode: 401
          }))
        } else {
          done(null, at)
        }
      } else {
        done()
      }
    },

    random: function (done) {
      if (token.indexOf('.') === -1) {
        request
          .post(options.issuer + '/token/verify')
          .auth(options.client_id, options.client_secret)
          .set('Content-Type', 'application/json')
          .send({ access_token: token })
          .end(function (err, response) {
            // superagent error
            if (err) {
              return done(err)
            }

            // Forbidden client or invalid access token
            if (response.body && response.body.error) {
              done(new UnauthorizedError(response.body))
            } else {
              done(null, response.body)
            }
          })

      } else {
        done()
      }
    }

  }, function (err, result) {
    if (err) { return callback(err) }

    var claims = result.random || result.jwt.payload
    var issuer = options.issuer
    var clients = options.clients
    var scope = options.scope

    // mismatching issuer
    if (claims.iss !== issuer) {
      return callback(new UnauthorizedError({
        error: 'invalid_token',
        error_description: 'Mismatching issuer',
        statusCode: 403
      }))
    }

    // mismatching audience
    if (clients && clients.indexOf(claims.aud) === -1) {
      return callback(new UnauthorizedError({
        error: 'invalid_token',
        error_description: 'Mismatching audience',
        statusCode: 403
      }))
    }

    // expired token
    if (claims.exp < nowSeconds()) {
      return callback(new UnauthorizedError({
        error: 'invalid_token',
        error_description: 'Expired access token',
        statusCode: 403
      }))
    }

    // insufficient scope
    if (scope && claims.scope.indexOf(scope) === -1) {
      return callback(new UnauthorizedError({
        error: 'insufficient_scope',
        error_description: 'Insufficient scope',
        statusCode: 403
      }))
    }

    callback(null, claims)
  })

}

/**
 * Export
 */

module.exports = AccessToken
