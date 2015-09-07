# Test dependencies
#fs          = require 'fs'
cwd         = process.cwd()
path        = require 'path'
chai        = require 'chai'
sinon       = require 'sinon'
sinonChai   = require 'sinon-chai'
expect      = chai.expect
nock        = require 'nock'




# Assertions
chai.use sinonChai
chai.should()




AnvilConnect = require path.join(cwd, 'index')
AccessToken = require path.join(cwd, 'lib', 'AccessToken')




describe 'Anvil Connect Client', ->


  {anvil,promise,success,failure} = {}


  config =
    issuer: 'https://connect.anvil.io'
    client_id: 'uuid'
    client_secret: 'secret'
    redirect_uri: 'https://app.example.com/callback'

  openid = {
    "issuer": "https://connect.anvil.io",
    "authorization_endpoint": "https://connect.anvil.io/authorize",
    "token_endpoint": "https://connect.anvil.io/token",
    "userinfo_endpoint": "https://connect.anvil.io/userinfo",
    "jwks_uri": "https://connect.anvil.io/jwks",
    "registration_endpoint": "https://connect.anvil.io/register",
    "scopes_supported": [
      "realm",
      "client",
      "profile",
      "openid"
    ],
    "response_types_supported": [
      "code",
      "token id_token"
    ],
    "response_modes_supported": [],
    "grant_types_supported": [
      "authorization_code",
      "refresh_token"
    ],
    "acr_values_supported": [],
    "subject_types_supported": ["public"],
    "id_token_signing_alg_values_supported": ["RS256"],
    "id_token_encryption_alg_values_supported": [],
    "id_token_encryption_enc_values_supported": [],
    "userinfo_signing_alg_values_supported": ["none"],
    "userinfo_encryption_alg_values_supported": [],
    "userinfo_encryption_enc_values_supported": [],
    "request_object_signing_alg_values_supported": [],
    "request_object_encryption_alg_values_supported": [],
    "request_object_encryption_enc_values_supported": [],
    "token_endpoint_auth_methods_supported": [
      "client_secret_basic",
      "client_secret_post"
    ],
    "token_endpoint_auth_signing_alg_values_supported": [],
    "display_values_supported": [],
    "claim_types_supported": ["normal"],
    "claims_supported": [
      "iss",
      "sub",
      "aud",
      "acr",
      "name",
      "given_name",
      "family_name",
      "middle_name",
      "nickname",
      "preferred_username",
      "profile",
      "picture",
      "website",
      "email",
      "email_verified",
      "zoneinfo",
      "locale",
      "joined_at",
      "updated_at"
    ],
    "service_documentation": "https://anvil.io/docs/connect/",
    "claims_locales_supported": [],
    "ui_locales_supported": [],
    "check_session_iframe": "https://connect.anvil.io/session",
    "end_session_endpoint": "https://connect.anvil.io/signout"
  }

  jwks =
    "keys": [
      {
        "kty": "RSA",
        "use": "sig",
        "alg": "RS256",
        "n": "zRchTwN0Ok6suWzaWYsbfZ81qdGVZM_LCqR6dhtlHaYAPpyVKefY3U5ByhbvDgbCm3BQ9OLu1E4OEJFkJVYvapxsyosrnSyY7qjLxHGKC-16AQNhX8qssTZVQCzdnKk67RUyKraM87zPkWNU6Qlw539-O9-g54YICKZV7ESfvA4nVvHQTJr8mem6S0GrRHxma8gEecogAvQCw5c2Hb500lW8eGqQ8qFjiBPQVScf4PZul4UO01KFB-cKiK575bFpxLSgfFBIGvqbjRgxLGkJnYq6IhtRfPQ0LAcM8rjYIINcFtLv9P647JcjrwNrxjP-yG_C84UddJl9L5kdA4_8JHom1sfaR7izF2B2mBFrGNODYDj8LctmWi4FaXBAIKa8XNW9lGv6Olc6G9AHpjzcQOY_lwAYWmULsotRRWfuV7wr49CyMSnthcd2smoA7ABed7qfd4FDCIft4SpONu7Mfba-pf8-0yYbXUcCdQzgaFr4P7MzMre4tcMhmWa89tMDP-XklptjgBmmK7RNdqk_g_Ol2KSXb233bIVd3tL8VgO1_vxwrvSZr_k9169GlsB3Ud50ulG_b6MOQxbpKZb1WEP_ajaZ8RnQOAFvfBKxBBxxT6y0maNtRGtpunYWmkxBPs-eJKZrYpVGLSX0ZwPOoPpQDInOuPcAuCp2Y3sEXK8",
        "e": "AQAB"
      },
      {
        "kty": "RSA",
        "use": "enc",
        "alg": "RS256",
        "n":"xoAIJ40-f5lr07WswyF6XryOtEJSpNYY_RFmMdKWMLoZnZ4dTl9LlBFyXYNunbkKQHXmhTTr_C6FWjUA6JZwCkymtgD5Be8Mz8N8K0RB6nokLzXzUilYrY8m_0G1yLAGAeAv0evGXMJN5GLuHzInB9zPzySr7xsCUB0L5DuEv6WJ4abNw5ylnLKLW9nvGfZDXwJ4YVJOaVre3S8CjvXu1fuTmzBW3VSD9Zttd_NB6uiS0QsvFBifHx-S1PZ_LZNGC52Z3-rs9kMzzneBiBJrhULFsyGF5OQBGBDQD5Ghl_O86DyCXKOGrIDso2l7ZY5vlicL9QD7jeBJnIF9sDnZDugoVneT2yHMBqiDKlFHKjGSE_mKhnD1K-QMolOwbADNytMeu5BDgFYdAkx9hyo1L2f8f4eB7_8XUSCnnQoIR9tb5ie9bSpd4Uel881N97WLVe9hyUVY0YSU3MKHaoNrPYVbGYjRsQrK14-NaZ3bC4Grrwd8eGGFaQeT_a4dIFfBfHtl_wH-DGZIqlTLX9fxfeNu93I4zPky1TlQaTwFiRo-9FXF6I6r2s2WaZKLnFWKdS2c0VrHJQebrkAN0VQNhp9-7jBRQqJmTiNVSg7J5wd7mgCMXIOfktOBHoNiulMRd9rYN21qRxt0xOwFujNZ8mlx2M96gBdhDVq020zJdB0",
        "e": "AQAB"
      }
    ]

  registration =
    client_name: "TEST CLIENT"
    redirect_uris: [ "http://app.example.com/callback" ]

  registrationResponse = {
    client_id: "a011bbd4-6171-4d84-ba1a-7db73fd64056",
    client_secret: "cd38a23c7a53045cbb64",
    client_name: registration.client_name
    token_endpoint_auth_method: "client_secret_basic",
    application_type: "web",
    redirect_uris: registration.redirect_uris
    client_id_issued_at: 1441564333989
  }

  userinfo =
    given_name: 'FAKE'
    family_name: 'USER'


  describe 'constructor', ->

    before ->
      anvil = new AnvilConnect config

    it 'should set the issuer', ->
      anvil.issuer.should.equal config.issuer

    it 'should set the client id', ->
      anvil.client_id.should.equal config.client_id

    it 'should set the client secret', ->
      anvil.client_secret.should.equal config.client_secret

    it 'should set the redirect uri', ->
      anvil.redirect_uri = config.redirect_uri

    it 'should set default scope', ->
      anvil.scope.should.equal 'openid profile'

    it 'should set scope from an array', ->
      anvil = new AnvilConnect scope: ['realm']
      anvil.scope.should.contain 'realm'

    it 'should set scope from a string', ->
      anvil = new AnvilConnect scope: 'realm extra'
      anvil.scope.should.contain 'realm'
      anvil.scope.should.contain 'extra'




  describe 'discover', ->

    describe 'with a successful response', ->

      beforeEach (done) ->
        anvil = new AnvilConnect config

        nock(anvil.issuer)
          .get('/.well-known/openid-configuration')
          .reply(200, openid)

        success = sinon.spy ->
          done()
        failure = sinon.spy ->
          done()
        promise = anvil.discover()
          .then(success)
          .catch(failure)

      after ->
        nock.cleanAll()

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should provide the openid configuration', ->
        success.should.have.been.calledWith sinon.match issuer: anvil.issuer

      it 'should set configuration', ->
        anvil.configuration.should.eql openid

      it 'should not catch an error', ->
        failure.should.not.have.been.called


    describe 'with a failure response', ->

      beforeEach (done) ->
        data = issuer: anvil.issuer
        anvil = new AnvilConnect config

        nock(anvil.issuer)
          .get('/.well-known/openid-configuration')
          .reply(404, 'Not found')

        success = sinon.spy ->
          done()
        failure = sinon.spy ->
          done()
        promise = anvil.discover()
          .then(success)
          .catch(failure)

      after ->
        nock.cleanAll()

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide the openid configuration', ->
        success.should.not.have.been.called

      it 'should not set configuration', ->
        expect(anvil.configuration).to.be.undefined

      it 'should not catch an error', ->
        failure.should.have.been.called




  describe 'jwks', ->

    describe 'with a successful response', ->

      beforeEach (done) ->
        anvil = new AnvilConnect config
        anvil.configuration = openid

        nock(anvil.issuer)
          .get('/jwks')
          .reply(200, jwks)

        success = sinon.spy ->
          done()
        failure = sinon.spy (err) ->
          done()
        promise = anvil.getJWKs()
          .then(success)
          .catch(failure)

      after ->
        nock.cleanAll()

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should provide the JWK set', ->
        success.should.have.been.calledWith sinon.match jwks

      it 'should set jwks', ->
        anvil.jwks.keys.should.eql jwks.keys

      it 'should set signature jwk', ->
        anvil.jwks.sig.should.eql jwks.keys[0]

      it 'should not catch an error', ->
        failure.should.not.have.been.called


    describe 'with a failure response', ->

      beforeEach (done) ->
        anvil = new AnvilConnect config
        anvil.configuration = openid

        nock(anvil.issuer)
          .get('/jwks')
          .reply(404, 'Not found')

        success = sinon.spy ->
          done()
        failure = sinon.spy ->
          done()
        promise = anvil.getJWKs()
          .then(success)
          .catch(failure)

      after ->
        nock.cleanAll()

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide the JWK set', ->
        success.should.not.have.been.called

      it 'should not set jwks', ->
        expect(anvil.jwks).to.be.undefined

      it 'should catch an error', ->
        failure.should.have.been.called




  describe 'register', ->

    describe 'with a successful response', ->

      beforeEach (done) ->
        anvil = new AnvilConnect config
        anvil.configuration = openid

        nock(anvil.issuer)
          .post('/register', registration)
          .reply(201, registrationResponse)

        success = sinon.spy ->
          done()
        failure = sinon.spy (err) ->
          done()
        promise = anvil.register(registration)
          .then(success)
          .catch(failure)

      after ->
        nock.cleanAll()

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should provide the registration response', ->
        success.should.have.been.calledWith sinon.match registrationResponse

      it 'should not catch an error', ->
        failure.should.not.have.been.called




    describe 'with a failure response', ->

      beforeEach (done) ->
        anvil = new AnvilConnect config
        anvil.configuration = openid

        nock(anvil.issuer)
          .post('/register', registration)
          .reply(400, { error: 'whatever' })

        success = sinon.spy ->
          done()
        failure = sinon.spy (err) ->
          done()
        promise = anvil.register(registration)
          .then(success)
          .catch(failure)

      after ->
        nock.cleanAll()

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide the registration response', ->
        success.should.have.not.been.called

      it 'should catch an error', ->
        failure.should.have.been.called




  describe 'authorizationUri', ->


    beforeEach ->
      anvil = new AnvilConnect config
      anvil.configuration = openid


    describe 'with no endpoint in the argument', ->

      it 'should use the "authorize" endpoint', ->
        anvil.authorizationUri().should.contain '/authorize?'


    describe 'with a string argument', ->

      it 'should use the argument as the endpoint', ->
        anvil.authorizationUri('signin').should.contain '/signin?'


    describe 'with an options argument', ->

      it 'should set the optional endpoint', ->
        uri = anvil.authorizationUri({
          endpoint: 'connect/google'
        })
        uri.should.contain '/connect/google?'

      it 'should set default authorization params', ->
        uri = anvil.authorizationUri({
          endpoint: 'connect/google'
        })
        uri.should.contain 'response_type=code'
        uri.should.contain "client_id=#{config.client_id}"
        uri.should.contain "redirect_uri=#{encodeURIComponent(config.redirect_uri)}"
        uri.should.contain "scope=#{encodeURIComponent(anvil.scope)}"

      it 'should set optional authorization params', ->
        uri = anvil.authorizationUri({
          endpoint: 'signin'
          provider: 'password'
          max_age: 2600
        })

        uri.should.contain 'provider=password'
        uri.should.contain 'max_age=2600'




  describe 'authorizationParams', ->

    beforeEach ->
      anvil = new AnvilConnect config
      anvil.configuration = openid

    it 'should set default response type', ->
      anvil.authorizationParams().response_type.should.equal 'code'

    it 'should set optional response type', ->
      anvil.authorizationParams({
        response_type: 'id_token token'
      }).response_type.should.equal 'id_token token'

    it 'should set client id', ->
      anvil.authorizationParams().client_id.should.equal config.client_id

    it 'should set configured redirect uri', ->
      anvil.authorizationParams().redirect_uri.should.equal config.redirect_uri

    it 'should set optional redirect uri', ->
      uri = 'https://app.example.com/other'
      anvil.authorizationParams({
        redirect_uri: uri
      }).redirect_uri.should.equal uri

    it 'should set configured scope', ->
      anvil.authorizationParams().scope.should.equal anvil.scope

    it 'should set optional scope', ->
      anvil.authorizationParams({
        scope: 'foo bar'
      }).scope.should.equal 'foo bar'

    it 'should set optional parameters', ->
      anvil.authorizationParams({
        prompt: 'none'
      }).prompt.should.equal 'none'

    it 'should ignore unknown parameters', ->
      params = anvil.authorizationParams({
        unknown: 'forgetme'
      })
      expect(params.unknown).to.be.undefined



  describe 'token', ->

    describe 'with missing authorization code', ->
    describe 'with error response', ->
    describe 'with unverifiable id token', ->
    describe 'with unverifiable access token', ->
    describe 'with valid token response', ->
    describe 'with response uri', ->




  describe 'userInfo', ->

    describe 'with a successful response', ->

      beforeEach (done) ->
        anvil = new AnvilConnect config
        anvil.configuration = openid
        anvil.tokens =
          access_token: 'jwt1'
          id_token: 'jwt2'

        nock(anvil.issuer)
          .get('/userinfo')
          .reply(200, userinfo)

        success = sinon.spy ->
          done()
        failure = sinon.spy ->
          done()
        promise = anvil.userInfo()
          .then(success)
          .catch(failure)

      afterEach ->
        nock.cleanAll()

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should provide the userinfo', ->
        success.should.have.been.calledWith sinon.match userinfo

      it 'should not catch an error', ->
        failure.should.not.have.been.called


    describe 'with a failure response', ->

      beforeEach (done) ->
        anvil = new AnvilConnect config
        anvil.configuration = openid
        anvil.tokens =
          access_token: 'jwt1'
          id_token: 'jwt2'

        nock(anvil.issuer)
          .get('/userinfo')
          .reply(404, 'Not found')

        success = sinon.spy ->
          done()
        failure = sinon.spy ->
          done()
        promise = anvil.userInfo()
          .then(success)
          .catch(failure)

      after ->
        nock.cleanAll()

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide the userinfo', ->
        success.should.not.have.been.called

      it 'should catch an error', ->
        failure.should.have.been.called




  describe 'verify', ->

    {claims,options} = {}

    describe 'with defaults and invalid token', ->

      before (done) ->
        anvil = new AnvilConnect config
        anvil.configuration = openid
        anvil.jwks = jwks
        anvil.jwks.sig = jwks.keys[0]

        sinon.stub(AccessToken, 'verify').callsArgWith(2, new Error)

        success = sinon.spy ->
          done()
        failure = sinon.spy ->
          done()
        promise = anvil.verify('invalid.access.token')
          .then(success)
          .catch(failure)

      after ->
        AccessToken.verify.restore()

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide the claims', ->
        success.should.have.not.been.called

      it 'should catch an error', ->
        failure.should.have.been.called


    describe 'with defaults and valid token', ->

      before (done) ->
        anvil = new AnvilConnect config
        anvil.configuration = openid
        anvil.jwks = jwks
        anvil.jwks.sig = jwks.keys[0]

        claims = sub: 'uuid'
        sinon.stub(AccessToken, 'verify').callsArgWith(2, null, claims)

        success = sinon.spy ->
          done()
        failure = sinon.spy ->
          done()
        promise = anvil.verify('valid.access.token')
          .then(success)
          .catch(failure)

      after ->
        AccessToken.verify.restore()

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should provide the claims', ->
        success.should.have.been.calledWith sinon.match claims

      it 'should not catch an error', ->
        failure.should.not.have.been.called


    describe 'with options and invalid token', ->

      before (done) ->
        anvil = new AnvilConnect config
        anvil.configuration = openid
        anvil.jwks = jwks
        anvil.jwks.sig = jwks.keys[0]

        sinon.stub(AccessToken, 'verify').callsArgWith(2, new Error)

        options =
          scope: 'realm'

        success = sinon.spy ->
          done()
        failure = sinon.spy ->
          done()
        promise = anvil.verify('invalid.access.token', options)
          .then(success)
          .catch(failure)

      after ->
        AccessToken.verify.restore()

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should pass the options to verify', ->
        AccessToken.verify.should.have.been.calledWith(
          sinon.match.string, sinon.match(options)
        )

      it 'should not provide the claims', ->
        success.should.have.not.been.called

      it 'should catch an error', ->
        failure.should.have.been.called


    describe 'with options and valid token', ->

      before (done) ->
        anvil = new AnvilConnect config
        anvil.configuration = openid
        anvil.jwks = jwks
        anvil.jwks.sig = jwks.keys[0]

        claims = sub: 'uuid'
        sinon.stub(AccessToken, 'verify').callsArgWith(2, null, claims)

        options =
          scope: 'realm'

        success = sinon.spy ->
          done()
        failure = sinon.spy ->
          done()
        promise = anvil.verify('valid.access.token', options)
          .then(success)
          .catch(failure)

      after ->
        AccessToken.verify.restore()

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should pass the options to verify', ->
        AccessToken.verify.should.have.been.calledWith(
          sinon.match.string, sinon.match(options)
        )

      it 'should provide the claims', ->
        success.should.have.been.calledWith sinon.match claims

      it 'should not catch an error', ->
        failure.should.not.have.been.called


