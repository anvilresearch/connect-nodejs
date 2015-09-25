/**
 * Module dependencies
 */

var request = require('request-promise')

/**
 * List Scopes
 */

function listScopes (roleId, options) {
  var uri = this.configuration.issuer + '/v1/roles/' + roleId + '/scopes'
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

exports.listScopes = listScopes

/**
 * Add Scope
 */

function addScope (role, scope) {
  var uri = this.configuration.issuer + '/v1/roles/' + role + '/scopes/' + scope
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

exports.addScope = addScope

/**
 * Delete Scope
 */

function deleteScope (role, scope) {
  var uri = this.configuration.issuer + '/v1/roles/' + role + '/scopes/' + scope
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

exports.deleteScope = deleteScope
