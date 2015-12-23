/**
 * Module dependencies
 */

var request = require('../lib/request')

/**
 * List Roles
 */

function listRoles (clientId, options) {
  options = options || {}
  options.url = '/v1/clients/' + clientId + '/roles'
  return request.bind(this)(options)
}

exports.listRoles = listRoles

/**
 * Add Role
 */

function addRole (client, role, options) {
  options = options || {}
  options.url = '/v1/clients/' + client + '/roles/' + role
  options.method = 'PUT'
  return request.bind(this)(options)
}

exports.addRole = addRole

/**
 * Delete Role
 */

function deleteRole (client, role, options) {
  options = options || {}
  options.url = '/v1/clients/' + client + '/roles/' + role
  options.method = 'DELETE'
  delete options.json
  return request.bind(this)(options)
}

exports.deleteRole = deleteRole
