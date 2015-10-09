/**
 * Module dependencies
 */

var request = require('../lib/request')

/**
 * List Users
 */

function listUsers (options) {
  options = options || {}
  options.url = '/v1/users'
  return request.bind(this)(options)
}

exports.list = listUsers

/**
 * Get User
 */

function getUser (id, options) {
  options = options || {}
  options.url = '/v1/users/' + id
  return request.bind(this)(options)
}

exports.get = getUser

/**
 * Create User
 */

function createUser (data, options) {
  options = options || {}
  options.url = '/v1/users'
  options.method = 'POST'
  options.json = data
  return request.bind(this)(options)
}

exports.create = createUser

/**
 * Update User
 */

function updateUser (id, data, options) {
  options = options || {}
  options.url = '/v1/users/' + id
  options.method = 'PATCH'
  options.json = data
  return request.bind(this)(options)
}

exports.update = updateUser

/**
 * Delete User
 */

function deleteUser (id, options) {
  options = options || {}
  options.url = '/v1/users/' + id
  options.method = 'DELETE'
  delete options.json
  return request.bind(this)(options)
}

exports.delete = deleteUser
