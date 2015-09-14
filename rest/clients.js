/**
 * Module dependencies
 */

var request = require('request-promise')

/**
 * List Clients
 */

function listClients (options) {
  var uri = this.configuration.issuer + '/v1/clients'
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

exports.list = listClients

/**
 * Get Client
 */

function getClient (id, options) {
  var uri = this.configuration.issuer + '/v1/clients/' + id
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

exports.get = getClient

/**
 * Create Client
 */

function createClient (data, options) {
  var uri = this.configuration.issuer + '/v1/clients'
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

exports.create = createClient

/**
 * Update Client
 */

function updateClient (id, data, options) {
  var uri = this.configuration.issuer + '/v1/clients/' + id
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

exports.update = updateClient

/**
 * Delete Client
 */

function deleteClient (id, options) {
  var uri = this.configuration.issuer + '/v1/clients/' + id
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

exports.delete = deleteClient


