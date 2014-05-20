/**
 * Module dependencies
 */

var util = require('util');


/**
 * CallbackError
 */

function CallbackError(options) {
  var message     = options.error_description
                 || options.error
                 || 'Could not authorize the user'
                  ;

  this.name       = 'CallbackError';
  this.message    = message;
  this.statusCode = options.statusCode || 400;
  Error.call(this, this.message);
  Error.captureStackTrace(this, arguments.callee);
}

util.inherits(CallbackError, Error);


/**
 * Exports
 */

module.exports = CallbackError;
