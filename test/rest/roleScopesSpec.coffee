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




roleScopes = require path.join(cwd, 'rest', 'roleScopes')




describe 'REST API Role Scope Methods', ->

  describe 'listScopes', ->

    describe 'with a successful response', ->

      {promise,success,failure} = {}

      before (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .get('/v1/roles/authority/scopes')
          .reply(200, [{name: 'realm'}])

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roleScopes.listScopes.bind(instance)('authority', {
          token: 'token'
        }).then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should provide the scopes', ->
        success.should.have.been.calledWith sinon.match [{name:'realm'}]

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

        nock(instance.configuration.issuer)
          .get('/v1/roles/authority/scopes')
          .reply(404, 'Not found')

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roleScopes.listScopes.bind(instance)('authority')
          .then(success, failure)

      after ->
        nock.cleanAll()

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide the scopes', ->
        success.should.not.have.been.called

      it 'should catch an error', ->
        failure.should.have.been.called




  describe 'add', ->

    describe 'with a successful response', ->

      {promise,success,failure} = {}

      before (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .put('/v1/roles/authority/scopes/realm')
          .reply(201, {
            added: true
          })

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roleScopes.addScope.bind(instance)('authority', 'realm', {
          token: 'token'
        }).then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should provide the scope', ->
        success.should.have.been.calledWith sinon.match { added: true }

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
          .put('/v1/roles/invalid/scopes/addition')
          .reply(400, 'Bad request')

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roleScopes.addScope.bind(instance)('invalid', 'addition', {
          token: 'token'
        }).then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide the scope', ->
        success.should.not.have.been.called

      it 'should catch an error', ->
        failure.should.have.been.called




  describe 'delete', ->

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
          .delete('/v1/roles/authority/scopes/realm')
          .reply(204)

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roleScopes.deleteScope.bind(instance)('authority', 'realm', {
          token: 'token'
        }).then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should provide the scope', ->
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
          .delete('/v1/roles/invalid/scopes/deletion')
          .reply(404, 'Not found')

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = roleScopes.deleteScope.bind(instance)('invalid', 'deletion', {
          token: 'token'
        }).then(success, failure)

      after ->
        nock.cleanAll()

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide the scope', ->
        success.should.not.have.been.called

      it 'should catch an error', ->
        failure.should.have.been.called


