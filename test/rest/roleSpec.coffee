# Test dependencies
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




roles = require path.join(cwd, 'rest', 'roles')




describe 'REST API Role Methods', ->

  describe 'list', ->

    describe 'with a missing access token', ->

      {promise,success,failure} = {}

      beforeEach (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .get('/v1/roles')
          .reply(200, [{_id: 'uuid'}])

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roles.list.bind(instance)()
          .then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide roles', ->
        success.should.not.have.been.called

      it 'should catch an error', ->
        failure.should.have.been.calledWith sinon.match.instanceOf Error


    describe 'with a successful response', ->

      {promise,success,failure} = {}

      before (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .get('/v1/roles')
          .reply(200, [{_id: 'uuid'}])

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roles.list.bind(instance)({ token: 'token' })
          .then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should provide the roles', ->
        success.should.have.been.calledWith sinon.match [{_id:'uuid'}]

      it 'should not catch an error', ->
        failure.should.not.have.been.called


    describe 'with a failure response', ->

      {promise,success,failure} = {}

      before (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .get('/v1/roles')
          .reply(404, 'Not found')

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roles.list.bind(instance)({ token: 'token' })
          .then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide the roles', ->
        success.should.not.have.been.called

      it 'should catch an error', ->
        failure.should.have.been.called


  describe 'get', ->

    describe 'with a missing access token', ->

      {promise,success,failure} = {}

      beforeEach (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .get('/v1/roles/uuid')
          .reply(200, [{_id: 'uuid'}])

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roles.get.bind(instance)('uuid')
          .then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide roles', ->
        success.should.not.have.been.called

      it 'should catch an error', ->
        failure.should.have.been.calledWith sinon.match.instanceOf Error


    describe 'with a successful response', ->

      {promise,success,failure} = {}

      before (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          tokens:
            access_token: 'random'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .get('/v1/roles/uuid')
          .reply(200, {_id: 'uuid'})

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roles.get.bind(instance)('uuid', { token: 'token' })
          .then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should provide the role', ->
        success.should.have.been.calledWith sinon.match {_id:'uuid'}

      it 'should not catch an error', ->
        failure.should.not.have.been.called


    describe 'with a failure response', ->

      {promise,success,failure} = {}

      before (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          tokens:
            access_token: 'random'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .get('/v1/roles/uuid')
          .reply(404, 'Not found')

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roles.get.bind(instance)('uuid', { token: 'token' })
          .then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide the role', ->
        success.should.not.have.been.called

      it 'should catch an error', ->
        failure.should.have.been.called




  describe 'create', ->

    describe 'with a missing access token', ->

      {promise,success,failure} = {}

      beforeEach (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .post('/v1/roles')
          .reply(200, [{_id: 'uuid'}])

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roles.create.bind(instance)({})
          .then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide role', ->
        success.should.not.have.been.called

      it 'should catch an error', ->
        failure.should.have.been.calledWith sinon.match.instanceOf Error


    describe 'with a successful response', ->

      {promise,success,failure} = {}

      before (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          tokens:
            access_token: 'random'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .post('/v1/roles', {
            redirect_uris: ['https://example.anvil.io']
          })
          .reply(201, {
            _id: 'uuid'
            redirect_uris: ['https://example.anvil.io']
          })

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roles.create.bind(instance)({
          redirect_uris: ['https://example.anvil.io']
        }, {
          token: 'token'
        }).then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should provide the role', ->
        success.should.have.been.calledWith sinon.match {_id:'uuid'}

      it 'should not catch an error', ->
        failure.should.not.have.been.called


    describe 'with a failure response', ->

      {promise,success,failure} = {}

      before (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          tokens:
            access_token: 'random'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .post('/v1/roles', {})
          .reply(400, 'Bad request')

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roles.create.bind(instance)({
          redirect_uris: ['https://example.anvil.io']
        }, {
          token: 'token'
        }).then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide the role', ->
        success.should.not.have.been.called

      it 'should catch an error', ->
        failure.should.have.been.called




  describe 'update', ->

    describe 'with a missing access token', ->

      {promise,success,failure} = {}

      beforeEach (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .patch('/v1/roles/uuid')
          .reply(200, {_id: 'uuid'})

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roles.update.bind(instance)('uuid', {})
          .then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide role', ->
        success.should.not.have.been.called

      it 'should catch an error', ->
        failure.should.have.been.calledWith sinon.match.instanceOf Error



    describe 'with a successful response', ->

      {promise,success,failure} = {}

      before (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          tokens:
            access_token: 'random'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .patch('/v1/roles/uuid', {
            redirect_uris: ['https://example.anvil.io']
          })
          .reply(200, {
            _id: 'uuid'
            redirect_uris: ['https://example.anvil.io']
          })

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roles.update.bind(instance)('uuid', {
          redirect_uris: ['https://example.anvil.io']
        }, {
          token: 'token'
        }).then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should provide the role', ->
        success.should.have.been.calledWith sinon.match({
          redirect_uris: ['https://example.anvil.io']
        })

      it 'should not catch an error', ->
        failure.should.not.have.been.called


    describe 'with a failure response', ->

      {promise,success,failure} = {}

      before (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          tokens:
            access_token: 'random'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .patch('/v1/roles/uuid', {})
          .reply(400, 'Bad request')

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roles.update.bind(instance)('uuid', {
          redirect_uris: ['https://example.anvil.io']
        }, {
          token: 'token'
        }).then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide the role', ->
        success.should.not.have.been.called

      it 'should catch an error', ->
        failure.should.have.been.called



  describe 'delete', ->

    describe 'with a missing access token', ->

      {promise,success,failure} = {}

      beforeEach (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .delete('/v1/roles/uuid')
          .reply(401, 'Unauthorized')

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roles.delete.bind(instance)('uuid')
          .then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide role', ->
        success.should.not.have.been.called

      it 'should catch an error', ->
        failure.should.have.been.calledWith sinon.match.instanceOf Error



    describe 'with a successful response', ->

      {promise,success,failure} = {}

      before (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          tokens:
            access_token: 'random'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .delete('/v1/roles/uuid')
          .reply(204)

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roles.delete.bind(instance)('uuid', { token: 'token' })
          .then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should provide the role', ->
        success.should.have.been.called

      it 'should not catch an error', ->
        failure.should.not.have.been.called


    describe 'with a failure response', ->

      {promise,success,failure} = {}

      before (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          tokens:
            access_token: 'random'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .delete('/v1/roles/uuid')
          .reply(404, 'Not found')

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roles.delete.bind(instance)('uuid', { token: 'token' })
          .then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide the role', ->
        success.should.not.have.been.called

      it 'should catch an error', ->
        failure.should.have.been.called


