/**
 * Module dependencies
 */

var request = require('../lib/request')

/**
 * List Roles
 */

function listRoles (options) {
  options = options || {}
  options.url = '/v1/roles'
  return request.bind(this)(options)
}

exports.list = listRoles

/**
 * Get Role
 */

function getRole (id, options) {
  options = options || {}
  options.url = '/v1/roles/' + id
  return request.bind(this)(options)
}

exports.get = getRole

/**
 * Create Role
 */

function createRole (data, options) {
  options = options || {}
  options.url = '/v1/roles'
  options.method = 'POST'
  options.json = data
  return request.bind(this)(options)
}

exports.create = createRole

/**
 * Update Role
 */

function updateRole (id, data, options) {
  options = options || {}
  options.url = '/v1/roles/' + id
  options.method = 'PATCH'
  options.json = data
  return request.bind(this)(options)
}

exports.update = updateRole

/**
 * Delete Role
 */

function deleteRole (id, options) {
  options = options || {}
  options.url = '/v1/roles/' + id
  options.method = 'DELETE'
  delete options.json
  return request.bind(this)(options)
}

exports.delete = deleteRole
