/**
 * Module dependencies
 */

var request = require('../lib/request')

/**
 * List Scopes
 */

function listScopes (options) {
  options = options || {}
  options.url = '/v1/scopes'
  return request.bind(this)(options)
}

exports.list = listScopes

/**
 * Get Scope
 */

function getScope (id, options) {
  options = options || {}
  options.url = '/v1/scopes/' + id
  return request.bind(this)(options)
}

exports.get = getScope

/**
 * Create Scope
 */

function createScope (data, options) {
  options = options || {}
  options.url = '/v1/scopes'
  options.method = 'POST'
  options.json = data
  return request.bind(this)(options)
}

exports.create = createScope

/**
 * Update Scope
 */

function updateScope (id, data, options) {
  options = options || {}
  options.url = '/v1/scopes/' + id
  options.method = 'PATCH'
  options.json = data
  return request.bind(this)(options)
}

exports.update = updateScope

/**
 * Delete Scope
 */

function deleteScope (id, options) {
  options = options || {}
  options.url = '/v1/scopes/' + id
  options.method = 'DELETE'
  delete options.json
  return request.bind(this)(options)
}

exports.delete = deleteScope
