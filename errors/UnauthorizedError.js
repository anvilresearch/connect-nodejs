/**
 * Module dependencies
 */

var util = require('util');


/**
 * UnauthorizedError
 */

function UnauthorizedError() {
  this.name = 'UnauthorizedError';
  this.message = 'Unauthorized request';
  this.statusCode = 403;
  Error.call(this, this.message);
  Error.captureStackTrace(this, arguments.callee);
}

util.inherits(UnauthorizedError, Error);


/**
 * Exports
 */

module.exports = UnauthorizedError;
