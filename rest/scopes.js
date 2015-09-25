/**
 * Module dependencies
 */

var request = require('request-promise')

/**
 * List Scopes
 */

function listScopes (options) {
  var uri = this.configuration.issuer + '/v1/scopes'
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

exports.list = listScopes

/**
 * Get Scope
 */

function getScope (id, options) {
  var uri = this.configuration.issuer + '/v1/scopes/' + id
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

exports.get = getScope

/**
 * Create Scope
 */

function createScope (data, options) {
  var uri = this.configuration.issuer + '/v1/scopes'
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

exports.create = createScope

/**
 * Update Scope
 */

function updateScope (id, data, options) {
  var uri = this.configuration.issuer + '/v1/scopes/' + id
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

exports.update = updateScope

/**
 * Delete Scope
 */

function deleteScope (id, options) {
  var uri = this.configuration.issuer + '/v1/scopes/' + id
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

exports.delete = deleteScope
