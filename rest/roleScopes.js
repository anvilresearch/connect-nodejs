/**
 * Module dependencies
 */

var request = require('../lib/request')

/**
 * List Scopes
 */

function listScopes (roleId, options) {
  options = options || {}
  options.url = '/v1/roles/' + roleId + '/scopes'
  return request.bind(this)(options)
}

exports.listScopes = listScopes

/**
 * Add Scope
 */

function addScope (role, scope, options) {
  options = options || {}
  options.url = '/v1/roles/' + role + '/scopes/' + scope
  options.method = 'PUT'
  return request.bind(this)(options)
}

exports.addScope = addScope

/**
 * Delete Scope
 */

function deleteScope (role, scope, options) {
  options = options || {}
  options.url = '/v1/roles/' + role + '/scopes/' + scope
  options.method = 'DELETE'
  delete options.json
  return request.bind(this)(options)
}

exports.deleteScope = deleteScope
