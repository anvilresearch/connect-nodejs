/**
 * Module dependencies
 */

var qs = require('qs')
var url = require('url')
var async = require('async')
var request = require('request-promise')
var IDToken = require('./lib/IDToken')
var AccessToken = require('./lib/AccessToken')

/**
 * Constructor
 */

function AnvilConnect (options) {
  options = options || {}

  // assign required options
  this.issuer = options.issuer
  this.client_id = options.client_id
  this.client_secret = options.client_secret
  this.redirect_uri = options.redirect_uri

  // add scope to defaults
  var defaultScope = ['openid', 'profile']
  if (typeof options.scope === 'string') {
    this.scope = defaultScope.concat(options.scope.split(' ')).join(' ')
  } else if (Array.isArray(options.scope)) {
    this.scope = defaultScope.concat(options.scope).join(' ')
  } else {
    this.scope = defaultScope.join(' ')
  }
}

/**
 * Initializer
 */

function initializer (options) {
  return new AnvilConnect(options)
}

/**
 * Configure
 *
 * Requests OIDC configuration from the AnvilConnect instance's provider.
 */

function discover () {
  var self = this

  // construct the uri
  var uri = url.parse(this.issuer)
  uri.pathname = '.well-known/openid-configuration'
  uri = url.format(uri)

  // return a promise
  return new Promise(function (resolve, reject) {
    request({
      url: uri,
      method: 'GET',
      json: true
    })
    .then(function (data) {
      self.configuration = data
      resolve(data)
    })
    .catch(function (err) {
      reject(err)
    })
  })
}

AnvilConnect.prototype.discover = discover

/**
 * JWK set
 *
 * Requests JSON Web Key set from configured provider
 */

function jwks () {
  var self = this
  var uri = this.configuration.jwks_uri

  return new Promise(function (resolve, reject) {
    request({
      url: uri,
      method: 'GET',
      json: true
    })
    .then(function (data) {
      self.jwks = data
      resolve(data)
    })
    .catch(function (err) {
      reject(err)
    })
  })
}

AnvilConnect.prototype.jwks = jwks

/**
 * Register client
 *
 * Right now this only works with dynamic registration. Anvil Connect server instances
 * that are configured with `token` or `scoped` for `client_registration` don't yet
 * work.
 */

function register (registration) {
  var self = this
  var uri = this.configuration.registration_endpoint

  return new Promise(function (resolve, reject) {
    request({
      url: uri,
      method: 'POST',
      json: registration
    })
    .then(function (data) {
      self.client_id = data.client_id
      self.client_secret = data.client_secret
      self.registration = data
      resolve(data)
    })
    .catch(function (err) {
      reject(err)
    })
  })
}

AnvilConnect.prototype.register = register

/**
 * Authorization URI
 */

function authorizationUri (options) {
  var u = url.parse(this.configuration.authorization_endpoint)

  // assign endpoint and ensure options
  var endpoint = 'authorize'
  if (typeof options === 'string') {
    endpoint = options
    options = {}
  } else if (typeof options === 'object') {
    endpoint = options.endpoint
  } else {
    options = {}
  }

  // pathname
  u.pathname = endpoint

  // request params
  u.query = this.authorizationParams(options)

  return url.format(u)
}

AnvilConnect.prototype.authorizationUri = authorizationUri

/**
 * Authorization Params
 */

function authorizationParams (options) {
  // ensure options is defined
  options = options || {}

  // essential request params
  var params = {
    response_type: options.response_type || 'code',
    client_id: this.client_id,
    redirect_uri: options.redirect_uri || this.redirect_uri,
    scope: options.scope || this.scope
  }

  // optional request params
  var optionalParameters = [
    'email',
    'password',
    'provider',
    'state',
    'response_mode',
    'nonce',
    'display',
    'prompt',
    'max_age',
    'ui_locales',
    'id_token_hint',
    'login_hint',
    'acr_values'
  ]

  // assign optional request params
  optionalParameters.forEach(function (param) {
    if (options[param]) {
      params[param] = options[param]
    }
  })

  return params
}

AnvilConnect.prototype.authorizationParams = authorizationParams

/**
 * Login
 */

function login (email, password) {
  var self = this

  // construct the endpoint
  // this one isn't included in openid-configuration
  var uri = this.issuer + '/signin'

  // authorization parameters
  var params = this.authorizationParams({
    provider: 'password',
    email: email,
    password: password
  })

  return new Promise(function (resolve, reject) {
    request({
      url: uri,
      method: 'POST',
      form: params,
      headers: { 'referer': uri }
    })
    // this is so ugly, but redirects get treated as errors by HTTP clients.
    // So we need to handle the expected result using `catch`. Ugh.
    .catch(function (err) {
      if (err.statusCode === 302) {
        var u = url.parse(err.response.headers.location)
        var code = qs.parse(u.query).code

        self.token({ code: code })
        .then(function (data) {
          resolve(data)
        })
        .catch(function (err) {
          reject(err)
        })
      } else {
        reject(err)
      }
    })
  })
}

AnvilConnect.prototype.login = login

/**
 * Token
 */

function token (options) {
  var self = this
  var uri = this.configuration.token_endpoint

  return new Promise(function (resolve, reject) {
    request({
      url: uri,
      method: 'POST',
      form: {
        grant_type: options.grant_type || 'authorization_code',
        code: options.code,
        redirect_uri: options.redirect_uri || self.redirect_uri,
      },
      json: true,
      auth: {
        user: self.client_id,
        pass: self.client_secret
      }
    })
    .then(function (data) {

      // verify tokens
      async.parallel({
        id_claims: function (done) {
          IDToken.verify(data.id_token, {
            iss: self.issuer,
            aud: self.client_id,
            key: self.jwks.keys[0]
          }, function (err, token) {
            if (err) { return done(err) }
            done(null, token.payload)
          })
        },

        access_claims: function (done) {
          AccessToken.verify(data.access_token, {
            //client: client,
            key: self.jwks.keys[0],
            issuer: self.issuer
          }, function (err, claims) {
            if (err) { return done(err) }
            done(null, claims)
          })
        }
      }, function (err, result) {
        if (err) {
          return reject(err)
        }

        data.id_claims = result.id_claims
        data.access_claims = result.access_claims

        resolve(data)
      })
    })
    .catch(function (err) {
      reject(err)
    })
  })
}

AnvilConnect.prototype.token = token

/**
 * User Info
 */

function userInfo () {
  var self = this
  var uri = this.configuration.userinfo_endpoint
  var token = this.tokens.access_token

  return new Promise(function (resolve, reject) {
    request({
      url: uri,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
    .then(function (data) {
      resolve(data)
    })
    .catch(function (err) {
      reject(err)
    })
  })
}

AnvilConnect.prototype.userInfo = userInfo

/**
 * Exports
 */

module.exports = initializer
