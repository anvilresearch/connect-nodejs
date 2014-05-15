# Test dependencies
fs          = require 'fs'
cwd         = process.cwd()
path        = require 'path'
chai        = require 'chai'
sinon       = require 'sinon'
sinonChai   = require 'sinon-chai'
expect      = chai.expect




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

Anvil   = require '../index'
Client  = Anvil.Client
IDToken = require path.join(cwd, './lib/IDToken')
request = require('request')


describe 'Client', ->

  {config,client} = {}

  describe 'constructor', ->

    before ->
      config =
        providerUri:  'https://accounts.anvil.io'
        providerKey:   publicKey
        clientId:     'uuid'
        clientToken:  'jwt.access.token'
        redirectUri:  'https://localhost/callback'

      client = new Client config


    it 'should set provider uri', ->
      client.providerUri.should.equal config.providerUri

    it 'should set client_id', ->
      client.clientId.should.equal config.clientId

    it 'should set client_access_token', ->
      client.clientToken.should.equal config.clientToken

    it 'should set redirect_uri', ->
      client.redirectUri.should.equal config.redirectUri

    it 'should set public key', ->
      client.providerKey.should.equal config.providerKey


  describe 'authorizeUri', ->

    {uri,config} = {}

    before ->
      config =
        providerUri:  'https://accounts.anvil.io'
        providerKey:   publicKey
        clientId:     'uuid'
        clientToken:  'jwt.access.token'
        redirectUri:  'https://localhost/callback'

      client = new Client config
      uri = client.authorizeUri('code', 'openid profile')



    it 'should return an authorization link', ->
      uri.should.contain "#{config.providerUri}/authorize?"
      uri.should.contain 'response_type=code'
      uri.should.contain "client_id=#{config.clientId}"
      uri.should.contain "redirect_uri=#{encodeURIComponent(config.redirectUri)}"
      uri.should.contain 'scope=openid+profile'




  describe 'callback', ->


    {err,res,config,client,uri} = {}


    before ->
      config =
        providerUri:  'https://accounts.anvil.io'
        providerKey:   publicKey
        clientId:     'uuid'
        clientToken:  'jwt.access.token'
        redirectUri:  'https://localhost/callback'

      client = new Client config
      uri = 'http://client-app.example.com/callback?code=abcdef'




    describe 'with error response', ->

      before (done) ->
        uri = 'http://client-app.example.com/callback?error=invalid_request'
        client.callback uri, (error, result) ->
          err = error
          res = result
          done()

      it 'should provide an error', ->
        expect(err).to.be.instanceOf Error




    describe 'with authorization code response and unsuccessful token request', ->
      before (done) ->
        uri = 'http://client-app.example.com/callback?code=random'
        tokenResponse = error: 'invalid_request'
        sinon.stub(request, 'post').callsArgWith(1, null, {}, tokenResponse)
        client.callback uri, (error, result) ->
          err = error
          res = result
          done()

      after ->
        request.post.restore()

      it 'should provide an error', ->
        expect(err).to.be.instanceOf Error

      it 'should not provide authorization', ->
        expect(res).to.be.undefined



    describe 'with authorization code response and successful token request', ->

      describe 'and an ID token signature cannot be verified', ->
        {tokenResponse,idToken} = {}

        before (done) ->
          uri = 'http://client-app.example.com/callback?code=random'

          idToken = new IDToken
            iss:    'https://accounts.anvil.io'
            sub:    'uuid'
            aud:    'uuid'
            scope:  'openid profile'

          tokenResponse =
            access_token:  'accessTokenReturned'
            refresh_token: 'refreshToken'
            id_token:      idToken.encode(anotherPrivateKey)
            expires_in:    '3600'

          sinon.stub(request, 'post').callsArgWith(1, null, {}, tokenResponse)
          client.callback uri, (error, result) ->
            err = error
            res = result
            done()

        after ->
          request.post.restore()

        it 'should provide an error', ->
          expect(err).to.be.instanceOf Error
          err.message.should.equal 'Invalid ID Token'

        it 'should not provide an authorization', ->
          expect(res).to.be.undefined


      describe 'validating the ID Token issuer', ->
        {tokenResponse,idToken} = {}

        before (done) ->
          uri = 'http://client-app.example.com/callback?code=random'

          idToken = new IDToken
            iss:    'https://someother.issuer.io'
            sub:    'uuid'
            aud:    'uuid'
            scope:  'openid profile'

          tokenResponse =
            access_token:  'accessTokenReturned'
            refresh_token: 'refreshToken'
            id_token:      idToken.encode(privateKey)
            expires_in:    '3600'

          sinon.stub(request, 'post').callsArgWith(1, null, {}, tokenResponse)
          client.callback uri, (error, result) ->
            err = error
            res = result
            done()

        after ->
          request.post.restore()

        it 'should provide an error', ->
          expect(err).to.be.instanceOf Error
          err.message.should.equal 'Mismatching issuer'

        it 'should not provide an authorization', ->
          expect(res).to.be.undefined



      describe 'validating the ID Token audience', ->
        {tokenResponse,idToken} = {}

        before (done) ->
          uri = 'http://client-app.example.com/callback?code=random'

          idToken = new IDToken
            iss:    'https://accounts.anvil.io'
            sub:    'uuid'
            aud:    'invalidAudience'
            scope:  'openid profile'

          tokenResponse =
            access_token:  'accessTokenReturned'
            refresh_token: 'refreshToken'
            id_token:      idToken.encode(privateKey)
            expires_in:    '3600'

          sinon.stub(request, 'post').callsArgWith(1, null, {}, tokenResponse)
          client.callback uri, (error, result) ->
            err = error
            res = result
            done()

        after ->
          request.post.restore()

        it 'should provide an error', ->
          expect(err).to.be.instanceOf Error
          err.message.should.equal 'Mismatching audience'

        it 'should not provide an authorization', ->
          expect(res).to.be.undefined




      describe 'validating the ID Token algorithm header', ->
        {tokenResponse,idToken} = {}

        before (done) ->
          uri = 'http://client-app.example.com/callback?code=random'

          IDToken.registeredHeaders.alg.enum.push 'ES256'
          header = alg: 'ES256'

          payload =
            iss:    'https://accounts.anvil.io'
            sub:    'uuid'
            aud:    'uuid'
            scope:  'openid profile'

          idToken = new IDToken payload, header

          tokenResponse =
            access_token:  'accessTokenReturned'
            refresh_token: 'refreshToken'
            id_token:      idToken.encode(privateKey)
            expires_in:    '3600'

          sinon.stub(request, 'post').callsArgWith(1, null, {}, tokenResponse)
          client.callback uri, (error, result) ->
            err = error
            res = result
            done()

        after ->
          request.post.restore()

        it 'should provide an error', ->
          expect(err).to.be.instanceOf Error
          err.message.should.equal 'Mismatching algorithm'

        it 'should not provide an authorization', ->
          expect(res).to.be.undefined




      describe 'validating the ID Token is not expired', ->
        {tokenResponse,idToken} = {}

        before (done) ->
          uri = 'http://client-app.example.com/callback?code=random'

          idToken = new IDToken
            iss:    'https://accounts.anvil.io'
            sub:    'uuid'
            aud:    'uuid'
            scope:  'openid profile'
            exp:    Date.now() - 1

          tokenResponse =
            access_token:  'accessTokenReturned'
            refresh_token: 'refreshToken'
            id_token:      idToken.encode(privateKey)
            expires_in:    '3600'

          sinon.stub(request, 'post').callsArgWith(1, null, {}, tokenResponse)
          client.callback uri, (error, result) ->
            err = error
            res = result
            done()

        after ->
          request.post.restore()

        it 'should provide an error', ->
          expect(err).to.be.instanceOf Error
          err.message.should.equal 'Expired ID Token'

        it 'should not provide an authorization', ->
          expect(res).to.be.undefined




      describe 'and a valid ID token is included', ->

        {tokenResponse,idToken} = {}

        before (done) ->
          uri = 'http://client-app.example.com/callback?code=random'

          idToken = new IDToken
            iss:    'https://accounts.anvil.io'
            sub:    'uuid'
            aud:    'uuid'
            scope:  'openid profile'

          console.log idToken.header

          tokenResponse =
            access_token:  'accessTokenReturned'
            refresh_token: 'refreshToken'
            id_token:      idToken.encode(privateKey)
            expires_in:    '3600'

          sinon.stub(request, 'post').callsArgWith(1, null, {}, tokenResponse)
          client.callback uri, (error, result) ->
            err = error
            res = result
            done()

        after ->
          request.post.restore()

        it 'should provide a null error', ->
          expect(err).to.be.null

        it 'should provide the raw response', ->
          res.response.should.equal tokenResponse

        it 'should provide the access token', ->
          res.accessToken.should.equal tokenResponse.access_token

        it 'should provide the decoded ID Token', ->
          res.idToken.payload.sub.should.equal idToken.payload.sub

    describe 'with other response', ->



  describe 'userinfo', ->
    {err, res, userInfoResponse} = {}

    describe 'with valid request', ->

      before (done) ->
        userInfoResponse = '{
          "sub":"864c393b-053f-4df6-b477-4879d3666a6e",
          "name":"John Smith",
          "given_name":"John",
          "family_name":"Smith",
          "profile":"https://plus.google.com/+JohnSmith",
          "picture":"https://lh5.googleusercontent.com/***/photo.jpg",
          "email":"john.smith@example.com",
          "email_verified":true,
          "gender":"male",
          "locale":"en",
          "joined_at":1398460767489,
          "updated_at":1398488442216
        }'

        sinon.stub(request, 'get').callsArgWith(1, null, {}, userInfoResponse)

        client.userInfo 'aToken', (error, response) ->
          res = response
          err = error
          done()

      after ->
        request.get.restore()

      it 'should provide a null error', ->
        expect(err).to.be.null

      it 'should provide user info', ->
        res.should.eql(JSON.parse(userInfoResponse))

    describe 'with invalid request', ->

      before (done) ->
        errorResponse = '{"error": "some error"}'

        sinon.stub(request, 'get').callsArgWith(1, null, {}, errorResponse)

        client.userInfo 'aToken', (error, response) ->
          res = response
          err = error
          done()

      after ->
        request.get.restore()

      it 'should provide a null error', ->
        expect(err).to.be.instanceOf(Error)

      it 'should not provide user info', ->
        expect(res).to.be.undefined



