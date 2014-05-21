# Test dependencies
fs          = require 'fs'
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




# Code under test
privateKey  = fs.readFileSync(
                path.join(cwd, 'test/lib/keys/private.pem')
              ).toString('ascii')
publicKey   = fs.readFileSync(
                path.join(cwd, 'test/lib/keys/public.pem')
              ).toString('ascii')

# Used to verify errors when ID Token is not verifiable
anotherPrivateKey = fs.readFileSync(
                path.join(cwd, 'test/lib/keys/anotherPrivate.pem')
              ).toString('ascii')


anvil   = require '../index2'
CallbackError = require path.join(cwd, './errors/CallbackError')
UnauthorizedError = require path.join(cwd, './errors/UnauthorizedError')
IDToken = require path.join(cwd, './lib/IDToken')
AccessToken = require path.join(cwd, './lib/AccessToken')




describe 'Anvil Client SDK', ->


  {uri} = {}


  config =
    provider:
      uri: 'https://your.authorization.server'
      key: '/path/to/public.key.pem'
    client:
      id: 'uuid'
      token: 'jwt.access.token'
    params:
      redirectUri: 'https://your.client.tld/callback'




  describe 'configuration', ->

    before ->
      anvil.configure config

    it 'should initialize the provider uri', ->
      anvil.provider.uri.should.equal config.provider.uri

    it 'should initialize the provider public key', ->
      anvil.provider.key.should.equal config.provider.key

    it 'should initialize the client identifier', ->
      anvil.client.id.should.equal config.client.id

    it 'should initialize the client access token', ->
      anvil.client.token.should.equal config.client.token

    it 'should initialize the default response type', ->
      anvil.params.responseType.should.equal config.params.responseType

    it 'should initialize the default redirect uri', ->
      anvil.params.redirectUri.should.equal config.params.redirectUri

    it 'should initialize the default scope', ->
      anvil.params.scope.should.equal config.params.scope




  describe 'uri helper', ->

    before ->
      anvil.configure config

    it 'should use the provider uri', ->
      anvil.uri().should.contain config.provider.uri

    it 'should use the default endpoint', ->
      anvil.uri().should.contain '/authorize?'

    it 'should use an optional endpoint', ->
      anvil.uri({ endpoint: 'signin' }).should.contain '/signin?'

    it 'should use the default response type', ->
      anvil.uri().should.contain "response_type=#{config.params.responseType}"

    it 'should use an optional response type', ->
      anvil.uri({ responseType: 'token' }).should.contain 'response_type=token'

    it 'should use the default redirect uri', ->
      param = "redirect_uri=#{encodeURIComponent(config.params.redirectUri)}"
      anvil.uri().should.contain param

    it 'should use an optional redirect uri', ->
      param = "redirect_uri=#{encodeURIComponent('https://other/cb')}"
      anvil.uri({ redirectUri: 'https://other/cb' }).should.contain param

    it 'should use the configured client id', ->
      anvil.uri().should.contain "client_id=#{config.client.id}"

    it 'should use an optional client id', ->
      anvil.uri({ clientId: 'other' }).should.contain 'client_id=other'

    it 'should use the default scope', ->
      anvil.uri().should.contain 'scope=openid+profile'

    it 'should use an optional scope', ->
      anvil.uri({ scope: 'openid realm' }).should.contain 'scope=openid+realm'

    it 'should use a unique request state'
    it 'should use an optional response mode'
    it 'should use an optional nonce'
    it 'should use an optional display'
    it 'should use an optional prompt'
    it 'should use an optional max age'
    it 'should use an optional ui locales'
    it 'should use an optional id token hint'
    it 'should use an optional login hint'
    it 'should use an optional acr values'




  describe 'authorize', ->

    req  = {}
    res  = redirect: sinon.spy()
    next = sinon.spy()

    before ->
      anvil.configure config
      anvil.authorize()(req,res,next)

    it 'should redirect to the authorize endpoint', ->
      res.redirect.should.have.been.calledWith anvil.uri()




  describe 'signin', ->

    req  = {}
    res  = redirect: sinon.spy()
    next = sinon.spy()

    before ->
      anvil.configure config
      anvil.signin()(req,res,next)

    it 'should redirect to the signin endpoint', ->
      res.redirect.should.have.been.calledWith anvil.uri
        endpoint: 'signin'




  describe 'signup', ->

    req  = {}
    res  = redirect: sinon.spy()
    next = sinon.spy()

    before ->
      anvil.configure config
      anvil.signup()(req,res,next)

    it 'should redirect to the signup endpoint', ->
      res.redirect.should.have.been.calledWith anvil.uri
        endpoint: 'signup'




  describe 'connect', ->

    req  = {}
    res  = redirect: sinon.spy()
    next = sinon.spy()

    before ->
      anvil.configure config
      anvil.connect({ provider: 'google' })(req,res,next)

    it 'should redirect to the connect endpoint', ->
      res.redirect.should.have.been.calledWith anvil.uri
        endpoint: 'connect/google'




  describe 'callback', ->

    {err,auth} = {}

    describe 'with authorization error response', ->

      before (done) ->
        anvil.configure config
        anvil.callback '/cb?error=invalid_request', (error, authorization) ->
          err  = error
          auth = authorization
          done()

      it 'should provide an error', ->
        expect(err).to.be.instanceof CallbackError

      it 'should not provide authorization', ->
        expect(auth).to.be.undefined



    describe 'with authorization hybrid response', ->



    describe 'with token exchange error response', ->

      before (done) ->
        nock(anvil.provider.uri)
          .post('/token')
          .reply(400, { error: 'error' }, { 'Content-Type': 'application/json' })

        anvil.callback '/callback?code=R4ND0M', (error, authorization) ->
          err  = error
          auth = authorization
          done()


      it 'should provide an error', ->
        expect(err).to.be.instanceof CallbackError

      it 'should not provide authorization', ->
        expect(auth).to.be.undefined




    describe 'with successful token exchange response and valid id token', ->

      {idToken} = {}

      before (done) ->

        idToken = 'header.payload.signature'

        claims =
          iss: 'https://your.authorization.server'
          sub: 'uuid'
          aud: 'https://your.client.app'

        nock(anvil.provider.uri)
          .post('/token')
          .reply(200, { id_token: idToken }, { 'Content-Type': 'application/json' })

        sinon.stub(IDToken, 'verify').callsArgWith(2, null, { payload: claims })

        anvil.callback "/callback?id_token=#{idToken}", (error, authorization) ->
          err  = error
          auth = authorization
          done()

      after ->
        IDToken.verify.restore()

      it 'should provide a null error', ->
        expect(err).to.be.null

      it 'should provide the authorization response', ->
        auth.tokens.id_token.should.equal idToken

      it 'should provide the id token claims', ->
        auth.identity.sub.should.equal 'uuid'



    describe 'with successful token exchange response and invalid id token', ->

      {idToken} = {}

      before (done) ->

        idToken = 'header.payload.signature'

        claims =
          iss: 'https://your.authorization.server'
          sub: 'uuid'
          aud: 'https://your.client.app'

        nock(anvil.provider.uri)
          .post('/token')
          .reply(200, { id_token: idToken }, { 'Content-Type': 'application/json' })

        sinon.stub(IDToken, 'verify').callsArgWith(2, new Error())

        anvil.callback "/callback?id_token=#{idToken}", (error, authorization) ->
          err  = error
          auth = authorization
          done()

      after ->
        IDToken.verify.restore()

      it 'should provide an error', ->
        expect(err).to.be.instanceof Error

      it 'should not provide authorization details', ->
        expect(auth).to.be.undefined







  describe 'userInfo', ->

    {err,claims} = {}

    describe 'with invalid access token', ->

      before (done) ->

        nock(anvil.provider.uri).get('/userinfo').reply(401, 'Unauthorized')
        anvil.userInfo 'INVALID', (error, info) ->
          err    = error
          claims = info
          done()

      it 'should provide an error', ->
        expect(err).to.be.instanceof UnauthorizedError

      it 'should not provide claims', ->
        expect(claims).to.be.undefined





    describe 'with valid access token', ->

      before (done) ->

        nock(anvil.provider.uri).get('/userinfo').reply(200, { sub: 'uuid' }, { 'Content-Type': 'application/json'})
        anvil.userInfo 'VALID', (error, info) ->
          err    = error
          claims = info
          done()

      it 'should provide an error', ->
        expect(err).to.be.null

      it 'should not provide claims', ->
        claims.sub.should.equal 'uuid'





  describe 'verify', ->


    {req,res,next,err,token} = {}


    describe 'with missing bearer token', ->

      before (done) ->
        req = { headers: {} }
        res = {}
        next = sinon.spy (error) ->
          err = error
          done()

        anvil.verify({ scope: 'realm' })(req, res, next)

      it 'should provide an error', ->
        expect(err).to.be.instanceof UnauthorizedError




    describe 'with invalid access token', ->

      before (done) ->

        sinon.stub(AccessToken, 'verify').callsArgWith(2, new Error())

        req =
          headers:
            authorization: 'Bearer INVALID.TOKEN'
          connection:
            remoteAddr: ''
        res = {}
        next = sinon.spy (error) ->
          err = error
          done()

        anvil.verify({ scope: 'realm' })(req, res, next)

      after ->
        AccessToken.verify.restore()

      it 'should provide an error', ->
        expect(err).to.be.instanceof Error




    describe 'with valid access token', ->

      before (done) ->

        token = {}
        sinon.stub(AccessToken, 'verify').callsArgWith(2, null, token)

        req =
          headers:
            authorization: 'Bearer VALID.TOKEN'
          connection:
            remoteAddr: ''
        res = {}
        next = sinon.spy (error) ->
          err = error
          done()

        anvil.verify({ scope: 'realm' })(req, res, next)

      it 'should not provide an error', ->
        expect(err).to.be.undefined

      it 'should set the request token', ->
        req.token.should.equal token




