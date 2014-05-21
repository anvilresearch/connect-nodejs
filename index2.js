/**
 * Module dependencies
 */

var URL               = require('url')
  , request           = require('superagent')
  , CallbackError     = require('./errors/CallbackError')
  , IDToken           = require('./lib/IDToken')
  , AccessToken       = require('./lib/AccessToken')
  , UnauthorizedError = require('./errors/UnauthorizedError')
  //, UserInfoError     = require('./lib/UserInfoError')
  , FormUrlencoded    = require('form-urlencoded')
  ;


/**
 * Anvil Connect Client
 */

module.exports = {


  /**
   * Anvil Connect Provider Settings
   */

  provider: {
    // uri
    // key
  },


  /**
   * Registered Client Settings
   */

  client: {
    // id
    // token
  },


  /**
   * Default Authorization Request Params
   */

  params: {
    // responseType
    // redirectUri
    // scope
  },


  /**
   * Client Configuration Setter
   */

  configure: function (options) {
    // validate configuration
    if (!options) {
      throw new Error('A valid configuration is required.');
    }

    if (!options.provider) {
      throw new Error('A valid provider configuration is required');
    }

    if (!options.provider.uri) {
      throw new Error('Provider uri is required');
    }

    if (!options.provider.key) {
      throw new Error('Provider public key is required');
    }

    if (!options.client) {
      throw new Error('A valid client configuration is required');
    }

    //if (!options.client.uri) {
    //  throw new Error('Client uri is required');
    //}

    if (!options.client.id) {
      throw new Error('Client ID is required');
    }

    if (!options.client.token) {
      throw new Error('Client token is required');
    }

    if (!options.params) {
      throw new Error('Valid authorization params configuration is required');
    }

    if (!options.params.redirectUri) {
      throw new Error('Redirect URI is required');
    }

    // default values
    if (!options.params.responseType) {
      options.params.responseType = 'code';
    }

    if (!options.params.scope) {
      options.params.scope = 'openid profile';
    }



    // initialize settings
    this.provider = options.provider;
    this.client   = options.client;
    this.params   = options.params;
  },


  /**
   * URI Generator
   *
   * Example:
   *
   *    var uri = anvil.uri({
   *      endpoint: 'signin',
   *      // override defaults here
   *    })
   */

  uri: function (options) {
    var anvil    = this
      , options  = options || {}
      , provider = anvil.provider
      , client   = anvil.client
      , params   = anvil.params
      , uri      = anvil.provider.uri + '/'
                 + (options.endpoint || 'authorize') + '?'
                 ;

    var params = {
      response_type: options.responseType || params.responseType || 'code',
      redirect_uri:  options.redirectUri  || params.redirectUri,
      client_id:     options.clientId     || client.id,
      scope:         options.scope        || params.scope
    };

    // optionally add state onto params
    // and any other options like prompt/display/etc

    return uri + FormUrlencoded.encode(params);
  },


  /**
   * Authorize
   * - redirect to the authorize endpoint
   *
   *   app.get('/authorize', anvil.authorize({
   *     // options
   *   }));
   */

  authorize: function (options) {
    var anvil   = this
      , options = options || {}
      ;

    return function (req, res, next) {
      res.redirect(anvil.uri({
        endpoint:     options.endpoint || 'authorize',
        responseType: options.responseType,
        redirectUri:  options.redirectUri,
        clientId:     options.clientId,
        scope:        options.scope
      }));
    };
  },


  /**
   * Signin
   * - redirect directly to signin endpoint
   *
   *   app.get('/signin', anvil.signin());
   */

  signin: function (options) {
    options = options || {};
    options.endpoint = 'signin';
    return this.authorize(options);
  },


  /**
   * Signup
   * - redirect directly to signup endpoint
   */

  signup: function (options) {
    options = options || {};
    options.endpoint = 'signup';
    return this.authorize(options);
  },


  /**
   * Connect a Third Party Account
   *
   *    app.get('/signin/:provider', anvil.connect({
   *      provider: req.params.provider
   *    }));
   */

  connect: function (options) {
    options = options || {};
    options.provider = options.provider;
    options.endpoint = 'connect/' + options.provider;
    return this.authorize(options);
  },


  /**
   * Callback Handler
   *
   *    anvil.callback(req.url, function (err, authorization) {
   *      // authorization.access_token
   *      // authorization.access_token_payload
   *      // authorization.refresh_token
   *      // authorization.expires_in
   *      // authorization.id_token
   *      // authorization.id_token_payload
   *    });
   *
   * Can this be used inside a Passport Strategy?
   */

  callback: function (uri, callback) {
    var anvil        = this
      , provider     = anvil.provider
      , client       = anvil.client
      , params       = anvil.params
      , authResponse = URL.parse(uri, true).query
      ;

    // handle error response from authorization server
    if (authResponse.error) {
      return callback(new CallbackError(authResponse));
    }

    // token request parameters
    var tokenRequest = FormUrlencoded.encode({
      grant_type:   'authorization_code',
      redirect_uri:  params.redirectUri,
      code:          authResponse.code
    });

    // exchange authorization code for tokens
    request
      .post(provider.uri + '/token')
      .set('Authorization', 'Bearer ' + client.token)
      .send(tokenRequest)
      .end(function (err, tokenResponse) {
        // superagent error
        if (err) {
          return callback(err)
        }

        // Forbidden client or invalid request error
        if (tokenResponse.error) {
          return callback(new CallbackError(tokenResponse.body))
        }

        // Successful token response
        else {
          IDToken.verify(tokenResponse.body.id_token, {

            iss: provider.uri,
            aud: client.id,
            key: provider.key

          }, function (err, token) {

            // token error
            if (err) {
              return callback(err);
            }

            // success response
            callback(null, {
              tokens: tokenResponse.body,
              identity: token.payload
            });

          });
        }
      });
  },


  /**
   * UserInfo
   *
   *    anvil.userInfo(accesstoken, function (err, profile) {
   *      // ...
   *    });
   */

  userInfo: function (accessToken, callback) {
    var anvil    = this
      , provider = anvil.provider
      ;

    request
      .get(anvil.provider.uri + '/userinfo')
      .set('Authorization', 'Bearer ' + accessToken)
      .set('Accept',        'application/json')
      .end(function (err, response) {
        // superagent error
        if (err) {
          return callback(err);
        }

        // error response from authorization server
        if (response.error) {
          return callback(new UnauthorizedError(response.body));
        }

        // success
        callback(null, response.body);
      });
  },


  /**
   * Verify credentials at API endpoints
   *
   * Use as route specific middleware:
   *
   *    server.post('/protected',
   *      anvil.verify({ scope: 'research' }),
   *      function (req, res, next) {
   *        // handle the request
   *      });
   *
   * Or protect the entire server:
   *
   *    server.use(anvil.verify({ scope: 'research' }));
   *
   */

  verify: function (options) {
    var anvil     = this
      , provider  = anvil.provider
      , client    = anvil.client
      , options   = options || {}
      , scope     = options.scope
      , key       = provider.key
      ;

    return function (req, res, next) {
      var header = req.headers.authorization;

      // missing header
      if (!header || header.indexOf('Bearer') === -1) {
        return next(new UnauthorizedError({
          realm:              'user',
          error:              'invalid_request',
          error_description:  'An access token is required',
          statusCode:          400
        }));
      }

      // header found
      else {
        AccessToken.verify(header.replace('Bearer ', ''), {

          // token validation requirements
          jwt:    client.token,
          key:    provider.key,
          iss:    provider.uri,
          aud:    client.id,
          scope:  scope

        }, function (err, token) {
          // validation error
          if (err) {
            return next(err);
          }

          // make the token metadata available downstream
          req.token = token;
          next();
        });
      }
    }
  },


  /**
   * The End
   */

};

