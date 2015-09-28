# Anvil Connect client for Nodejs
[![Build Status](https://travis-ci.org/anvilresearch/connect-nodejs.svg?branch=master)](https://travis-ci.org/anvilresearch/connect-nodejs)

[Anvil Connect][connect] is a modern authorization server built to authenticate 
your users and protect your APIs. It's based on [OAuth 2.0][oauth2] and 
[OpenID Connect][oidc]. 

[This library][connect-nodejs] is a low level OpenID Connect and Anvil Connect 
API client. Previous versions included Express-specific functions and 
middleware. These higher-level functions are being split out into a 
[separate library][connect-express].

[oauth2]: http://tools.ietf.org/html/rfc6749
[oidc]: http://openid.net/connect/
[connect]: https://github.com/anvilresearch/connect
[connect-nodejs]: https://github.com/anvilresearch/connect-nodejs
[connect-express]: https://github.com/anvilresearch/connect-express



### Install

```bash
$ npm install anvil-connect-nodejs --save
```

### Example

```javascript
var AnvilConnect = require('anvil-connect-nodejs');

var anvil = new AnvilConnect({
  issuer: 'https://connect.example.com',
  client_id: 'CLIENT_ID',
  client_secret: 'CLIENT_SECRET',
  redirect_uri: 'REDIRECT_URI'
}) 

// get the discovery document for the OpenID Connect provider
anvil.discover()
  .then(function (configuration) {
    // the call to discover() cached the configuration on the client instance
    console.log(anvil.configuration)

    // get the public keys for verifying tokens
    return anvil.getJWKs()  
  })
  .then(function (jwks) {
    // the call to getJwks() cached the JWK set on the client instance too
    console.log(jwks)

    // get an authorization uri
    return anvil.authorizationUri()
  })
  .then(function (uri) {
    console.log(uri)

    // handle an authorization response
    return anvil.token({ code: 'AUTHORIZATION_CODE' })
  })
  .then(function (tokens) {
    // a successful call to tokens() gives us id_token, access_token, 
    // refresh_token, expiration, and the decoded payloads of the JWTs
    console.log(tokens)

    // get userinfo
    // this requires tokens to be set on the client instance
    // i.e., anvil.tokens
    return anvil.userInfo()
  })
  .then(function (userInfo) {
    console.log(userInfo)

    // verify an access token
    return anvil.verify(JWT, { scope: 'research' })
  })
```

### Configure

#### new AnvilConnect(config)

```javascript
var AnvilConnect = require('anvil-connect-nodejs');

var anvil = new AnvilConnect({
  issuer: 'https://connect.example.com',
  client_id: 'CLIENT_ID',
  client_secret: 'CLIENT_SECRET',
  redirect_uri: 'REDIRECT_URI',
  scope: 'realm'
})
```

**options**

* `issuer` – REQUIRED uri of your OpenID Connect provider
* `client_id` – OPTIONAL client identifier issued by OIDC provider during registration
* `client_secret` – OPTIONAL confidential value issued by OIDC provider during registration
* `redirect_uri` – OPTIONAL uri users will be redirected back to after authenticating with the issuer
* `scope` – OPTIONAL array of strings, or space delimited string value containing scopes to be included in authorization requests. Defaults to `openid profile`

### OpenID Connect

#### anvil.discover()
#### anvil.getJWKs()
#### anvil.register(registration)
#### anvil.authorizationUri(options)
#### anvil.authorizationParams(options)
#### anvil.token(options)
#### anvil.userInfo()
#### anvil.verify(token, options)

### Anvil Connect API

#### Clients

#### anvil.clients.list()
#### anvil.clients.get(id)
#### anvil.clients.create(data)
#### anvil.clients.update(id, data)
#### anvil.clients.delete(id)

#### Roles

#### anvil.roles.list()
#### anvil.roles.get(id)
#### anvil.roles.create(data)
#### anvil.roles.update(id, data)
#### anvil.roles.delete(id)

#### Scopes

#### anvil.scopes.list()
#### anvil.scopes.get(id)
#### anvil.scopes.create(data)
#### anvil.scopes.update(id, data)
#### anvil.scopes.delete(id)

#### Users

#### anvil.users.list()
#### anvil.users.get(id)
#### anvil.users.create(data)
#### anvil.users.update(id, data)
#### anvil.users.delete(id)
