/**
 * Module dependencies
 */

var request = require('../lib/request')

/**
 * List Roles
 */

function listRoles (userId, options) {
  options = options || {}
  options.url = '/v1/users/' + userId + '/roles'
  return request.bind(this)(options)
}

exports.listRoles = listRoles

/**
 * Add Role
 */

function addRole (user, role, options) {
  options = options || {}
  options.url = '/v1/users/' + user + '/roles/' + role
  options.method = 'PUT'
  return request.bind(this)(options)
}

exports.addRole = addRole

/**
 * Delete Role
 */

function deleteRole (user, role, options) {
  options = options || {}
  options.url = '/v1/users/' + user + '/roles/' + role
  options.method = 'DELETE'
  delete options.json
  return request.bind(this)(options)
}

exports.deleteRole = deleteRole
