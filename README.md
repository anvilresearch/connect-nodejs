# Node SDK for Anvil Connect

**[Anvil Connect](https://github.com/christiansmith/anvil-connect)** aims to be a scalable, full-featured, ready-to-run [**OpenID Connect**](http://openid.net/connect/) + [**OAuth 2.0**](http://tools.ietf.org/html/rfc6749) **Provider**. This package is a SDK for Nodejs client developers.


### Install

```bash
$ npm install anvil-connect-sdk --save
```

### Usage

Configuration example:

```javascript
var anvil = require('anvil-connect-sdk');

anvil.configure({
  provider: {
    uri: 'https://your.authorization.server',
    key: '/path/to/public.key.pem'
  },
  client: {
    id: 'uuid',
    token: 'client.jwt.access.token'
  },
  params: {
    redirectUri: 'https://your.client.tld/callback'
  }
});
```


### Protecting Services

Anvil Connect SDK includes Connect/Express/Restify compatible middleware for authenticating access tokens issued by Anvil Connect and enforcing authorization based on OAuth 2.0 scope.

This middleware can be used as route specific middleware...

```javascript
var authorize = anvil.verify({ scope: 'research' });

server.post('/protected', authorize, function (req, res, next) {
  // handle the request
});
```

...or to protect the entire server:

```javascript
server.use(anvil.verify({ scope: 'research' }));
```

