/**
 * Module dependencies
 */

var util = require('util')

/**
 * IDTokenError
 */

function IDTokenError (options) {
  var message = options.error_description ||
    options.error ||
    'Invalid ID Token'

  this.name = 'IDTokenError'
  this.message = message
  this.statusCode = options.statusCode || 400
}

util.inherits(IDTokenError, Error)

/**
 * Exports
 */

module.exports = IDTokenError
