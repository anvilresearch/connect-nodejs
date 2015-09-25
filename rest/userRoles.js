/**
 * Module dependencies
 */

var request = require('request-promise')

/**
 * List Roles
 */

function listRoles (userId, options) {
  var uri = this.configuration.issuer + '/v1/users/' + userId + '/roles'
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

exports.listRoles = listRoles

/**
 * Add Role
 */

function addRole (userId, role) {
  var uri = this.configuration.issuer + '/v1/users/' + userId + '/roles/' + role
  var token = this.tokens.access_token
  var self = this

  return new Promise(function (resolve, reject) {
    request({
      url: uri,
      method: 'PUT',
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

exports.addRole = addRole

/**
 * Delete Role
 */

function deleteRole (userId, role) {
  var uri = this.configuration.issuer + '/v1/users/' + userId + '/roles/' + role
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

exports.deleteRole = deleteRole
