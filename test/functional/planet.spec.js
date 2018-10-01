'use strict'

const User = use('App/Models/User')
const Planet = use('App/Models/Planet')
const Factory = use('Factory')
let planet = null
let user = null

{
  const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Get planets informations')

  trait('Test/ApiClient')

  beforeEach(async () => {
    planet = await Factory.model('App/Models/Planet').create()
  })

  afterEach(async () => {
    // await Planet.query().delete()
  })

  test('deve retornar 400 error se o formato planetId for inválido', async ({ client, assert }) => {
    const response = await client
      .get(`api/planets/foo`)
      .accept('json')
      .end()
    response.assertStatus(400)
  })

  test('deve retornar 404 error se planeta não existir', async ({ client, assert }) => {
    const response = await client
      .get(`api/planets/507f1f77bcf86cd799439011`)
      .accept('json')
      .end()
    response.assertStatus(404)
  })

  test('deve obter detalhes do planeta', async ({ client, assert }) => {
    const response = await client
      .get(`api/planets/${planet._id}`)
      .accept('json')
      .end()
    response.assertStatus(200)
    assert.equal(response.body.data._id, planet.toJSON()._id)
  })

  test('deve obter uma lista filtrada por nome', async ({ client, assert }) => {
    const response = await client
      .get(`api/planets/?searchByName=${planet.name.substr(0,3)}`)
      .accept('json')
      .end()

    response.assertStatus(200)
    assert.isArray(response.body.data.data)
  })
}

{
  const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Create Planet')

  trait('Test/ApiClient')
  trait('Auth/Client')

  beforeEach(async () => {
    user = await Factory.model('App/Models/User').create()
  })

  afterEach(async () => {
    await User.query().delete()
    await Planet.query().delete()
  })

  test('deve retornar erro de validação quando nome (name) do planeta não for informado', async ({ client, assert }) => {
    const response = await client.post('api/planets')
      .loginVia(user, 'jwt')
      .send({ climate: 'Arid', terrain: 'Desert' })
      .accept('json')
      .end()

    response.assertStatus(422)
    response.assertJSONSubset({
      status: 422,
      code: 'E_VALIDATE_FAILED'
    })
  })

  test('deve retornar erro erro de validação quando clima (climate) do planeta não for informado', async ({ client, assert }) => {
    const response = await client.post('api/planets')
      .loginVia(user, 'jwt')
      .send({ name: 'foo' })
      .accept('json')
      .end()

    response.assertStatus(422)
    response.assertJSONSubset({
      status: 422,
      code: 'E_VALIDATE_FAILED'
    })
  })

  test('deve retornar erro erro de validação quando terreno (terrain)) do planeta não for informado', async ({ client, assert }) => {
    const response = await client
      .post('api/planets')
      .loginVia(user, 'jwt')
      .send({ name: 'foo', climate: 'Arid' })
      .accept('json')
      .end()
    response.assertStatus(422)
    response.assertJSONSubset({
      status: 422,
      code: 'E_VALIDATE_FAILED'
    })
  })

  test('deve registrar um novo planeta', async ({ client, assert }) => {
    const response = await client
      .post('api/planets')
      .loginVia(user, 'jwt')
      .send({ name: 'Tatooine', climate: 'Arid', terrain: 'Desert'})
      .accept('json')
      .end()
    response.assertStatus(201)
    assert.equal(response.body.data.name, 'Tatooine')
    assert.equal(response.body.data.climate, 'Arid')
    assert.equal(response.body.data.terrain, 'Desert')
    assert.equal(response.body.data.quantityFilms, 5)
  })
}

{
  const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Update Planet')

  trait('Test/ApiClient')
  trait('Auth/Client')

  beforeEach(async () => {
    planet = await Factory.model('App/Models/Planet').create()
    user = await Factory.model('App/Models/User').create()
  })

  afterEach(async () => {
    await Planet.query().delete()
    await User.query().delete()
  })

  test('deve retornar 401 se não tiver login', async ({ client, assert }) => {
    const response = await client
      .put(`api/planets/${planet._id}`)
      .accept('json')
      .end()
    response.assertStatus(401)
  })

  test('deve atualizar planeta', async ({ client, assert }) => {
    const response = await client
      .put(`api/planets/${planet._id}`)
      .loginVia(user, 'jwt')
      .send({ climate: 'Arid, tropical', terrain: 'Desert, mountains' })
      .accept('json')
      .end()
    response.assertStatus(202)
    assert.equal(response.body.data.name, planet.name)
    assert.equal(response.body.data.climate, 'Arid, tropical')
    assert.equal(response.body.data.terrain, 'Desert, mountains')
  })
}

{
  const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Delete Planet')

  trait('Test/ApiClient')
  trait('Auth/Client')

  beforeEach(async () => {
    user = await Factory.model('App/Models/User').create()
    planet = await Factory.model('App/Models/Planet').create()
  })

  afterEach(async () => {
    await User.query().delete()
    await Planet.query().delete()
  })

  test('deve retornar 401 se não tiver login', async ({ client, assert }) => {
    const response = await client
      .delete(`api/planets/${planet._id}`)
      .accept('json')
      .end()
    response.assertStatus(401)
  })

  test('deve excluir planeta', async ({ client, assert }) => {
    const response = await client
      .delete(`api/planets/${planet._id}`)
      .loginVia(user, 'jwt')
      .accept('json')
      .end()
    response.assertStatus(202)
    const newPlanet = await Planet.find(planet._id)
    assert.isNull(newPlanet)
  })
}