/**
 * Module dependencies
 */

var request = require('request-promise')

/**
 * Protected API Request
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
