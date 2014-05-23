/**
 * Module dependencies
 */


var URL = require('url')
  , request = require('request')
  , FormUrlencoded = require('form-urlencoded')
  , IDToken = require('./lib/IDToken')
  ;


/**
 * Client constructor
 */

function Client (config) {
  this.providerUri  = config.providerUri;
  this.providerKey  = config.providerKey;
  this.clientId     = config.clientId;
  this.clientToken  = config.clientToken;
  this.redirectUri  = config.redirectUri;
  this.idTokenSignedResponseAlg = config.idTokenSignedResponseAlg || 'RS256';
}


/**
 * Authorization URI
 */

Client.prototype.authorizeUri = function (responseType, scope) {
  var provider = this.providerUri
    , params = {
        response_type:  responseType,
        client_id:      this.clientId,
        redirect_uri:   this.redirectUri,
        scope:          scope
      }
    ;

  return provider + '/authorize?' + FormUrlencoded.encode(params);
};


/**
 * Authorization Response Handler
 */

Client.prototype.callback = function (uri, callback) {
  var client = this
    , publicKey = client.providerKey
    , authResponse = URL.parse(uri, true).query
    ;

  // handle authorization error response
  if (authResponse.error) {
    return callback(new Error(authResponse.error))
  }

  // handle authorization code response
  else if (authResponse.code) {
    request.post({
      uri: client.providerUri + '/token',
      headers: {
        'Authorization': 'Bearer ' + client.clientToken,
        'Content-type': 'application/json'
      },
      form: {
        grant_type:   'authorization_code',
        redirect_uri: client.redirectUri,
        code:         authResponse.code
      }
    }, function (err, res, body) {
      if (err) { return callback(err); }

      try {
        var tokenResponse;

        if (typeof body === 'string') {
          tokenResponse= JSON.parse(body);
        } else {
          tokenResponse = body;
        }

      } catch (e) {
        return callback(new Error('Unable to parse token response'))
      }


      if (res.statusCode === 403) {
        return callback(new Error('You hoser'));
      }

      // error response
      if (tokenResponse.error) {
        var err = new Error();
        err.error = tokenResponse.error
        err.error_description = tokenResponse.error_description
        return callback(err);
      }

      // access token response
      else {

        var idToken = IDToken.decode(tokenResponse.id_token, publicKey);

        // can't verify token
        if (!idToken || idToken instanceof Error) {
          return callback(idToken || new Error('Invalid ID Token'));
        }

        // verifiable token
        else {

          /**
           * http://bit.ly/openid-connect-client-validation
           */


          // validate iss
          if (idToken.payload.iss !== client.providerUri) {
            return callback(new Error('Mismatching issuer'));
          }

          // validate aud
          if (idToken.payload.aud !== client.clientId) {
            return callback(new Error('Mismatching audience'));
          }

          // validate alg header
          if (idToken.header.alg !== client.idTokenSignedResponseAlg) {
            return callback(new Error('Mismatching algorithm'));
          }

          // verify not expired
          if (idToken.payload.exp < Date.now()) {
            return callback(new Error('Expired ID Token'));
          }

          callback(null, {
            response: tokenResponse,
            accessToken: tokenResponse.access_token,
            idToken: idToken
          });
        }
      }
    });
  } else {
    console.log('WTF');
  }

  return URL.parse(uri, true);
}


/**
 * UserInfo
 */

Client.prototype.userInfo = function (accessToken, callback) {
  var client = this;

  request.get({
    uri: client.providerUri + '/userinfo',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  },
  function(err, res, body) {
    if(err) {return callback(err);}

    try {
      var response = JSON.parse(body);
    } catch (e) {
      return callback(e);
    }

    if(response.error) {
      return callback(new Error(response.error));
    }

    return callback(null, response);
  });
};


/**
 * Verify Token Middleware
 */

Client.prototype.authorize = function (scope) {
  return function (req, res, next) {

    var header = req.headers.authorization;

    if (!header || header.indexOf('Bearer') !== -1) {

    }
    // if jwt, decode
    // otherwise, verify with auth server
  };
}


/**
 * Export
 */

module.exports = {

  Client: Client,

  createClient: function (config) {
    return new Client(config);
  }

};

