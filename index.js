/**
 * Module dependencies
 */

var qs = require('qs')
var url = require('url')
var async = require('async')
var request = require('request-promise')
var clientRoles = require('./rest/clientRoles')
var clients = require('./rest/clients')
var roles = require('./rest/roles')
var roleScopes = require('./rest/roleScopes')
var scopes = require('./rest/scopes')
var users = require('./rest/users')
var userRoles = require('./rest/userRoles')
var IDToken = require('./lib/IDToken')
var AccessToken = require('./lib/AccessToken')
var UnauthorizedError = require('./errors/UnauthorizedError')

/**
 * OpenID Connect client (also an Anvil Connect server API client)
 * @class AnvilConnect
 * @param options {Object}
 * @constructor
 */
function AnvilConnect (options) {
  options = options || {}

  // assign required options
  this.issuer = options.issuer
  this.client_id = options.client_id
  this.client_secret = options.client_secret
  this.redirect_uri = options.redirect_uri
  this.agentOptions = options.agentOptions

  this.clients = {
    list: clients.list.bind(this),
    get: clients.get.bind(this),
    create: clients.create.bind(this),
    update: clients.update.bind(this),
    delete: clients.delete.bind(this),
    roles: {
      list: clientRoles.listRoles.bind(this),
      add: clientRoles.addRole.bind(this),
      delete: clientRoles.deleteRole.bind(this)
    }
  }

  this.roles = {
    list: roles.list.bind(this),
    get: roles.get.bind(this),
    create: roles.create.bind(this),
    update: roles.update.bind(this),
    delete: roles.delete.bind(this),
    scopes: {
      list: roleScopes.listScopes.bind(this),
      add: roleScopes.addScope.bind(this),
      delete: roleScopes.deleteScope.bind(this)
    }
  }

  this.scopes = {
    list: scopes.list.bind(this),
    get: scopes.get.bind(this),
    create: scopes.create.bind(this),
    update: scopes.update.bind(this),
    delete: scopes.delete.bind(this)
  }

  this.users = {
    list: users.list.bind(this),
    get: users.get.bind(this),
    create: users.create.bind(this),
    update: users.update.bind(this),
    delete: users.delete.bind(this),
    roles: {
      list: userRoles.listRoles.bind(this),
      add: userRoles.addRole.bind(this),
      delete: userRoles.deleteRole.bind(this)
    }
  }

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
 * Errors
 */

AnvilConnect.UnauthorizedError = UnauthorizedError

/**
 * Requests OIDC configuration from the AnvilConnect instance's provider.
 * Requires issuer to be set.
 * @method discover
 * @returns {Promise}
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
      json: true,
      agentOptions: self.agentOptions
    })
    .then(function (data) {
      // data will be an object if the server returned JSON
      if (typeof data === 'object') {
        self.configuration = data
        resolve(data)
      // If data is not an object, the server is not serving
      // .well-known/openid-configuration as expected
      } else {
        reject(new Error('Unable to retrieve OpenID Connect configuration'))
      }
    })
    .catch(function (err) {
      reject(err)
    })
  })
}
AnvilConnect.prototype.discover = discover

/**
 * Requests JSON Web Key set from configured provider.
 * Requires provider info to be initialized (like via `discover()`).
 * @method getJWKs
 * @returns {Promise}
 */
function getJWKs () {
  var self = this
  var uri = this.configuration.jwks_uri

  return new Promise(function (resolve, reject) {
    request({
      url: uri,
      method: 'GET',
      json: true,
      agentOptions: self.agentOptions
    })
    .then(function (data) {
      // make it easier to reference the JWK by use
      data.keys.forEach(function (jwk) {
        data[jwk.use] = jwk
      })

      // make the JWK set available on the client
      self.jwks = data
      resolve(data)
    })
    .catch(function (err) {
      reject(err)
    })
  })
}
AnvilConnect.prototype.getJWKs = getJWKs

/**
 * Initializes provider-related configurations for this client
 * (loads OP endpoints via `discover()` and keys via `getJWKs()`).
 * Requires the issuer to be already set. Usage:
 *
 *   ```
 *   var client = new AnvilConnect({ issuer: 'https://example.com' })
 *   client.initProvider()
 *     .then(function () {
 *       // now the client is ready to register() or verify()
 *     })
 *     .catch(function (err) {
 *       // handle error
 *     })
 *   ```
 * @method initProvider
 * @throws {Error} If `issuer` is not configured
 * @return {Promise}
 */
function initProvider () {
  if (!this.issuer) {
    throw new Error('initClient requires an issuer to be configured')
  }
  var self = this
  return self.discover()
    .then(function () {
      return self.getJWKs()
    })
}
AnvilConnect.prototype.initProvider = initProvider

/**
 * Registers the client with an OIDC provider. Currently works with dynamic
 * registration only (Anvil Connect server instances configured with
 * `token` or `scoped` values for `client_registration` will not work).
 * Requires that the OIDC provider's registration endpoint is loaded
 * (say, via `initProvider()`)
 *
 * @method register
 * @param options {Object} Options hashmap of registration params
 * @param options.redirect_uris {Array<String>} Client callback URLs, for
 *   redirecting users after authentication. Required.
 * @param [options.client_name] {String} Name of the client app or service
 * @param [options.client_uri] {String} Reference app URL (displayed to user)
 * @param [options.logo_uri] {String} Client logo (displayed to user)
 * @param [options.response_types] {Array<String>} List of allowed
 *   response types. Allowed values are: either some combination of
 *   `code`, `token` or `id_token`, OR `none` by itself.
 *   Defaults to `['code']`
 * @param [options.grant_types] {Array<String>} List
 *   of allowed grant types. Defaults to `['authorization_code']`.
 * @param [options.default_max_age] {Number} Token expiration, in seconds
 * @param [options.post_logout_redirect_uris] {Array<String>}
 * @param [options.trusted] {Boolean} Is the client part of your security
 *   realm (is a privileged client), or is it a third party.
 * @param [options.default_client_scope] {Array<String>} List of client
 *   access token scopes issued by a client_credentials grant.
 *   For example: ['profile', 'realm']
 * @param [options.scopes] {Array<String>}
 * @returns {Promise<Object>} Resolves to client configs/metadata
 *   returned from the provider (also sets the relevant client attributes).
 */
function register (options) {
  var self = this
  var uri = this.configuration.registration_endpoint
  var token = this.tokens && this.tokens.access_token

  return new Promise(function (resolve, reject) {
    request({
      url: uri,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json: options,
      agentOptions: self.agentOptions
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
 * Refresh
 */

function refresh (options) {
  options = options || {}

  var self = this
  var refresh_token = options.refresh_token
  return new Promise(function (resolve, reject) {
    if (!refresh_token) {
      return reject(new Error('Missing refresh_token'))
    }
    AccessToken.refresh(refresh_token, {
      issuer: self.issuer,
      client_id: self.client_id,
      client_secret: self.client_secret
    }, function (err, token) {
      if (err) {
        return reject(err)
      }
      AccessToken.verify(token.access_token, {
        key: self.jwks.keys[ 0 ],
        issuer: self.issuer
      }, function (err) {
        if (err) {
          return reject(err)
        }
        return resolve(token)
      })
    })
  })
}

AnvilConnect.prototype.refresh = refresh

/**
 * Token
 */

function token (options) {
  options = options || {}

  var self = this
  var uri = this.configuration.token_endpoint
  var code = options.code

  // get the authorization code
  if (!code && options.responseUri) {
    var u = url.parse(options.responseUri)
    code = qs.parse(u.query).code
  }

  return new Promise(function (resolve, reject) {
    if (!code) {
      return reject(new Error('Missing authorization code'))
    }

    var formRequestData = {
      code: code,
      grant_type: options.grant_type || 'authorization_code',
      redirect_uri: options.redirect_uri || self.redirect_uri
    }

    if (formRequestData.grant_type === 'client_credentials') {
      formRequestData.scope = options.scope || self.scope
    }

    request({
      url: uri,
      method: 'POST',
      form: formRequestData,
      json: true,
      auth: {
        user: self.client_id,
        pass: self.client_secret
      },
      agentOptions: self.agentOptions
    })
    .then(function (data) {
      var verifyClaims = {
        access_claims: function (done) {
          AccessToken.verify(data.access_token, {
            key: self.jwks.keys[0],
            issuer: self.issuer
          }, function (err, claims) {
            if (err) { return done(err) }
            done(null, claims)
          })
        }
      }

      // when requesting a token using client credentials no ID information is
      // returned
      if (formRequestData.grant_type !== 'client_credentials') {
        verifyClaims.id_claims = function (done) {
          IDToken.verify(data.id_token, {
            iss: self.issuer,
            aud: self.client_id,
            key: self.jwks.keys[0]
          }, function (err, token) {
            if (err) { return done(err) }
            done(null, token.payload)
          })
        }
      }

      // verify tokens
      async.parallel(verifyClaims, function (err, result) {
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
 * Retrieves user info / profile from the OIDC Provider (requires a valid access
 * token).
 * @method userInfo
 * @param options {Object} Options hashmap
 * @returns {Promise<Object>} Resolves to userinfo hashmap object
 */
function userInfo (options) {
  options = options || {}

  var uri = this.configuration.userinfo_endpoint
  var self = this

  return new Promise(function (resolve, reject) {
    if (!options.token) {
      return reject(new Error('Missing access token'))
    }

    request({
      url: uri,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + options.token
      },
      json: true,
      agentOptions: self.agentOptions
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
 * Verifies a given OIDC token
 * @method verify
 * @param token {String} JWT AccessToken for OpenID Connect (base64 encoded)
 * @param options {Object} Options hashmap
 * @throws {UnauthorizedError} HTTP 401 or 403 errors (invalid tokens etc)
 * @returns {Promise}
 */
function verify (token, options) {
  options = options || {}
  options.issuer = options.issuer || this.issuer
  options.client_id = options.client_id || this.client_id
  options.client_secret = options.client_secret || this.client_secret
  options.scope = options.scope || this.scope
  options.key = options.key || this.jwks.sig

  return new Promise(function (resolve, reject) {
    AccessToken.verify(token, options, function (err, claims) {
      if (err) { return reject(err) }
      resolve(claims)
    })
  })
}
AnvilConnect.prototype.verify = verify

/**
 * Exports
 */
module.exports = AnvilConnect
