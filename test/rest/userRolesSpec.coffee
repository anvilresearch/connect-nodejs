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




userRoles = require path.join(cwd, 'rest', 'userRoles')




describe 'REST API User Role Methods', ->

  describe 'listRoles', ->

    describe 'with a successful response', ->

      {promise,success,failure} = {}

      before (done) ->
        instance =
          configuration:
            issuer: 'https://connect.anvil.io'
          agentOptions: {}

        nock.cleanAll()
        nock(instance.configuration.issuer)
          .get('/v1/users/authority/roles')
          .reply(200, [{name: 'realm'}])

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = userRoles.listRoles.bind(instance)('authority', {
          token: 'token'
        }).then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should provide the roles', ->
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
          .get('/v1/users/authority/roles')
          .reply(404, 'Not found')

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = userRoles.listRoles.bind(instance)('authority')
          .then(success, failure)

      after ->
        nock.cleanAll()

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide the roles', ->
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
          .put('/v1/users/authority/roles/realm')
          .reply(201, {
            added: true
          })

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = userRoles.addRole.bind(instance)('authority', 'realm', {
          token: 'token'
        }).then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should provide the role', ->
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
          .put('/v1/users/invalid/roles/addition')
          .reply(400, 'Bad request')

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = userRoles.addRole.bind(instance)('invalid', 'addition', {
          token: 'token'
        }).then(success, failure)

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide the role', ->
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
          .delete('/v1/users/authority/roles/realm')
          .reply(204)

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = userRoles.deleteRole.bind(instance)('authority', 'realm', {
          token: 'token'
        }).then(success, failure)

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
          .delete('/v1/users/invalid/roles/deletion')
          .reply(404, 'Not found')

        success = sinon.spy -> done()
        failure = sinon.spy -> done()

        promise = userRoles.deleteRole.bind(instance)('invalid', 'deletion', {
          token: 'token'
        }).then(success, failure)

      after ->
        nock.cleanAll()

      it 'should return a promise', ->
        promise.should.be.instanceof Promise

      it 'should not provide the role', ->
        success.should.not.have.been.called

      it 'should catch an error', ->
        failure.should.have.been.called


