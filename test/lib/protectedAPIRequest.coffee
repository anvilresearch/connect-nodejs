# Test dependencies
cwd         = process.cwd()
path        = require 'path'
chai        = require 'chai'
sinon       = require 'sinon'
sinonChai   = require 'sinon-chai'
expect      = chai.expect




# Assertions
chai.use sinonChai
chai.should()




request = require path.join(cwd, 'lib', 'request')




describe 'Protected API Request', ->

  instance =
    configuration: { issuer: 'https://connect.example.com' }
    agentOptions: {}

  describe 'with missing access token', ->

    {promise,success,failure} = {}

    before (done) ->
      success = sinon.spy -> done()
      failure = sinon.spy -> done()
      promise = request.bind(instance)({
        url: '/'
      }).then(success, failure)

    it 'should return a promise', ->
      promise.should.be.instanceOf Promise

    it 'should not resolve', ->
      success.should.not.have.been.called

    it 'should reject', ->
      failure.should.have.been.calledWith sinon.match({
        message: 'Missing access token'
      })


  describe 'with missing request url', ->

    {promise,success,failure} = {}

    before (done) ->
      success = sinon.spy -> done()
      failure = sinon.spy -> done()
      promise = request.bind(instance)({}).then(success, failure)

    it 'should return a promise', ->
      promise.should.be.instanceOf Promise

    it 'should not resolve', ->
      success.should.not.have.been.called

    it 'should reject', ->
      failure.should.have.been.calledWith sinon.match({
        message: 'Missing request url'
      })


