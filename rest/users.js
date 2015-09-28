/**
 * Module dependencies
 */

var request = require('request-promise')

/**
 * List Users
 */

function listUsers (options) {
  var uri = this.configuration.issuer + '/v1/users'
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

exports.list = listUsers

/**
 * Get User
 */

function getUser (id, options) {
  var uri = this.configuration.issuer + '/v1/users/' + id
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

exports.get = getUser

/**
 * Create User
 */

function createUser (data, options) {
  var uri = this.configuration.issuer + '/v1/users'
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

exports.create = createUser

/**
 * Update User
 */

function updateUser (id, data, options) {
  var uri = this.configuration.issuer + '/v1/users/' + id
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

exports.update = updateUser

/**
 * Delete User
 */

function deleteUser (id, options) {
  var uri = this.configuration.issuer + '/v1/users/' + id
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

exports.delete = deleteUser
