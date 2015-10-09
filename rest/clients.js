/**
 * Module dependencies
 */

var request = require('../lib/request')

/**
 * List Clients
 */

function listClients (options) {
  options = options || {}
  options.url = '/v1/clients'
  return request.bind(this)(options)
}

exports.list = listClients

/**
 * Get Client
 */

function getClient (id, options) {
  options = options || {}
  options.url = '/v1/clients/' + id
  return request.bind(this)(options)
}

exports.get = getClient

/**
 * Create Client
 */

function createClient (data, options) {
  options = options || {}
  options.url = '/v1/clients'
  options.method = 'POST'
  options.json = data
  return request.bind(this)(options)
}

exports.create = createClient

/**
 * Update Client
 */

function updateClient (id, data, options) {
  options = options || {}
  options.url = '/v1/clients/' + id
  options.method = 'PATCH'
  options.json = data
  return request.bind(this)(options)
}

exports.update = updateClient

/**
 * Delete Client
 */

function deleteClient (id, options) {
  options = options || {}
  options.url = '/v1/clients/' + id
  options.method = 'DELETE'
  delete options.json
  return request.bind(this)(options)
}

exports.delete = deleteClient
