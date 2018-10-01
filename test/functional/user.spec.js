'use strict'

const Mail = use('Mail')
const User = use('App/Models/User')
const Image = use('App/Models/Image')
const Factory = use('Factory')
let user = null

{
  const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Get user')

  trait('Test/ApiClient')

  beforeEach(async () => {
    user = await Factory.model('App/Models/User').create()
  })

  afterEach(async () => {
    await User.query().delete()
  })

  test('deve retornar 400 error se o formato userId for inválido', async ({ client, assert }) => {
    const response = await client
      .get(`api/users/foo`)
      .accept('json')
      .end()
    response.assertStatus(400)
  })

  test('deve retornar 404 error se usuário não existir', async ({ client, assert }) => {
    const response = await client
      .get(`api/users/507f1f77bcf86cd799439011`)
      .accept('json')
      .end()
    response.assertStatus(404)
  })

  test('deve obter detalhes do usuário', async ({ client, assert }) => {
    const response = await client
      .get(`api/users/${user._id}`)
      .accept('json')
      .end()
    response.assertStatus(200)
    assert.equal(response.body.data._id, user.toJSON()._id)
  })
}

{
  const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Update User')

  trait('Test/ApiClient')
  trait('Auth/Client')

  beforeEach(async () => {
    user = await Factory.model('App/Models/User').create()
  })

  afterEach(async () => {
    await User.query().delete()
  })

  test('deve retornar 403 se não tiver autorizado', async ({ client, assert }) => {
    const otherUser = await Factory.model('App/Models/User').create()
    const response = await client
      .put(`api/users/${user._id}`)
      .loginVia(otherUser, 'jwt')
      .send({ name: 'Enzo' })
      .accept('json')
      .end()
    response.assertStatus(403)
  })

  // test('deve retornar validationserror locale is invalid', async ({ client, assert }) => {
  //   const response = await client
  //     .put(`api/users/${user._id}`)
  //     .loginVia(user, 'jwt')
  //     .send({ locale: 'foo' })
  //     .accept('json')
  //     .end()
  //   response.assertStatus(422)
  // })

  test('deve atualizar usuário', async ({ client, assert }) => {
    const response = await client
      .put(`api/users/${user._id}`)
      .loginVia(user, 'jwt')
      .send({ name: 'John' })
      .accept('json')
      .end()
    response.assertStatus(202)
    assert.equal(response.body.data.email, user.email)
    assert.equal(response.body.data.name, 'John')
  })
}

{
  const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Delete user')

  trait('Test/ApiClient')
  trait('Auth/Client')

  beforeEach(async () => {
    user = await Factory.model('App/Models/User').create()
  })

  afterEach(async () => {
    await User.query().delete()
  })

  test('deve retornar 401 se não tiver login', async ({ client, assert }) => {
    const response = await client
      .delete(`api/users/${user._id}`)
      .accept('json')
      .end()
    response.assertStatus(401)
  })

  test('deve retornar 403 se não for autorizado', async ({ client, assert }) => {
    const otherUser = await Factory.model('App/Models/User').create()
    const response = await client
      .delete(`api/users/${user._id}`)
      .loginVia(otherUser, 'jwt')
      .accept('json')
      .end()
    response.assertStatus(403)
  })

  test('deve excluir usuário', async ({ client, assert }) => {
    const response = await client
      .delete(`api/users/${user._id}`)
      .loginVia(user, 'jwt')
      .accept('json')
      .end()
    response.assertStatus(202)
    const newUser = await User.find(user._id)
    assert.isNull(newUser)
  })
}

{
  const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Upload Image')

  trait('Test/ApiClient')
  trait('Auth/Client')

  beforeEach(async () => {
    user = await Factory.model('App/Models/User').create()
  })

  afterEach(async () => {
    await User.query().delete()
    await Image.query().delete()
  })

  test('deve atualizar usuário', async ({ client, assert }) => {
    const response = await client
      .post(`api/users/${user._id}/upload`)
      .loginVia(user, 'jwt')
      .field('isAvatar', 1)
      .attach('image', 'test/fixtures/demo.png')
      .accept('json')
      .end()
    response.assertStatus(202)
    const newUser = await User.find(user._id)
    const image = await newUser.images().first()
    assert.isNotNull(image)
    await image.delete()
  })
}
