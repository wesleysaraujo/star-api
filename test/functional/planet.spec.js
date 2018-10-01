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
    assert.equal(response.body.data.data, [planet.toJSON()])
  })
}
