/**
 * Module dependencies
 */

var request = require('request-promise')

/**
 * Returns a promise for a protected API request.
 * Used by the Anvil Connect API client methods (in rest/*).
 * @method protectedAPIRequest
 * @private
 * @param [options={}] {Object} Options hashmap object
 * @param options.url {String} (Required) URL to send the request to. Can be
 *   relative (if relative, gets prefixed with the `configuration.issuer`).
 * @param options.token {String} (Required) Access token. Gets sent as an
 *   Authorization: Bearer <token> header.
 * @param [options.headers={}] {Object} Optional headers hashmap
 * @param [options.method='GET'] {String} HTTP request method (default: GET)
 * @param [options.json=true] {Object|Boolean} JSON payload (for create()
 *   requests and so on).
 * @return {Promise<Request>}
 */
function protectedAPIRequest (options) {
  var self = this

  return new Promise(function (resolve, reject) {
    options = options || {}

    // validate the options
    if (!options.url) { return reject(new Error('Missing request url')) }
    if (!options.token) { return reject(new Error('Missing access token')) }

    // initialize default values
    if (!options.url.match(/^http/)) {
      options.url = self.configuration.issuer + options.url
    }

    options.method = options.method || 'GET'
    options.headers = options.headers || {}
    options.headers['Authorization'] = 'Bearer ' + options.token
    options.json = options.json || true
    options.agentOptions = self.agentOptions

    // make the request
    request(options)
    .then(function (data) {
      resolve(data)
    })
    .catch(function (err) {
      reject(err)
    })
  })
}

/**
 * Export
 */

module.exports = protectedAPIRequest
