/**
 * Module dependencies
 */

var request = require('request-promise')

/**
 * List Roles
 */

function listRoles (options) {
  var uri = this.configuration.issuer + '/v1/roles'
  var token = this.tokens.access_token
  var self = this

  return new Promise(function (resolve, reject) {
    request({
      url: uri,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json: true,
      agentOptions: self.agentOptions
    })
    .then(function (data) {
      resolve(data)
    })
    .catch(function (err) {
      reject(err)
    })
  })
}

exports.list = listRoles

/**
 * Get Role
 */

function getRole (id, options) {
  var uri = this.configuration.issuer + '/v1/roles/' + id
  var token = this.tokens.access_token
  var self = this

  return new Promise(function (resolve, reject) {
    request({
      url: uri,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json: true,
      agentOptions: self.agentOptions
    })
    .then(function (data) {
      resolve(data)
    })
    .catch(function (err) {
      reject(err)
    })
  })
}

exports.get = getRole

/**
 * Create Role
 */

function createRole (data, options) {
  var uri = this.configuration.issuer + '/v1/roles'
  var token = this.tokens.access_token
  var self = this

  return new Promise(function (resolve, reject) {
    request({
      url: uri,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json: data,
      agentOptions: self.agentOptions
    })
    .then(function (data) {
      resolve(data)
    })
    .catch(function (err) {
      reject(err)
    })
  })
}

exports.create = createRole

/**
 * Update Role
 */

function updateRole (id, data, options) {
  var uri = this.configuration.issuer + '/v1/roles/' + id
  var token = this.tokens.access_token
  var self = this

  return new Promise(function (resolve, reject) {
    request({
      url: uri,
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json: data,
      agentOptions: self.agentOptions
    })
    .then(function (data) {
      resolve(data)
    })
    .catch(function (err) {
      reject(err)
    })
  })
}

exports.update = updateRole

/**
 * Delete Role
 */

function deleteRole (id, options) {
  var uri = this.configuration.issuer + '/v1/roles/' + id
  var token = this.tokens.access_token
  var self = this

  return new Promise(function (resolve, reject) {
    request({
      url: uri,
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      agentOptions: self.agentOptions
    })
    .then(function (data) {
      resolve(data)
    })
    .catch(function (err) {
      reject(err)
    })
  })
}

exports.delete = deleteRole
