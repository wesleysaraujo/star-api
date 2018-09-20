'use strict'

const Mail = use('Mail')
// const url = `http://${process.env.HOST}:${process.env.PORT}/`
const User = use('App/Models/User')
let user = null

{
  const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Account Register')

  trait('Test/ApiClient')

  afterEach(async () => {
    await User.query().delete()
  })

  test('deve retornar erro erro de validação quando nome de usuário não for informado', async ({ client, assert }) => {
    const response = await client
      .post('api/auth/register')
      .accept('json')
      .end()
    response.assertStatus(422)
    response.assertJSONSubset({
      status: 422,
      code: 'E_VALIDATE_FAILED'
    })
  })

  test('deve retornar erro erro de validação quando nome de usuário não for informado', async ({ client, assert }) => {
    const response = await client
      .post('api/auth/register')
      .send({ email: 'welsey@starapi.com', password: 'secret' })
      .accept('json')
      .end()

    response.assertStatus(422)
    response.assertJSONSubset({
      status: 422,
      code: 'E_VALIDATE_FAILED'
    })
  })

  test('deve retornar erro erro de validação quando e-mail for inválido', async ({ client, assert }) => {
    const response = await client
      .post('api/auth/register')
      .send({ email: 'foo' })
      .accept('json')
      .end()

    response.assertStatus(422)
    response.assertJSONSubset({
      status: 422,
      code: 'E_VALIDATE_FAILED'
    })
  })

  test('deve retornar erro erro de validação quando senha de usuário não for informado', async ({ client, assert }) => {
    const response = await client
      .post('api/auth/register')
      .send({ email: 'welsey@starapi.com' })
      .accept('json')
      .end()
    response.assertStatus(422)
    response.assertJSONSubset({
      status: 422,
      code: 'E_VALIDATE_FAILED'
    })
  })

  test('deve retornar erro erro de validação quando e-mail de usuário já existir', async ({ client, assert }) => {
    user = await use('Factory').model('App/Models/User').make()
    await user.save()
    const response = await client
      .post('api/auth/register')
      .send({ email: user.email, password: 'secret'})
      .accept('json')
      .end()

    response.assertStatus(422)
    response.assertJSONSubset({
      status: 422,
      code: 'E_VALIDATE_FAILED'
    })
  })

  test('deve registrar um usuário', async ({ client, assert }) => {
    Mail.fake()
    const response = await client
      .post('api/auth/register')
      .send({ name: 'test user', email: 'welsey@starapi.com', password: 'secret', age: 10 })
      .accept('json')
      .end()
    response.assertStatus(201)
    assert.equal(response.body.data.name, 'test user')
    assert.equal(response.body.data.email, 'welsey@starapi.com')
    assert.isUndefined(response.body.data.age)
    // assert.isUndefined(response.body.data.verificationToken)
    // assert.isUndefined(response.body.data.verified)

    // const recentEmail = Mail.pullRecent()
    // assert.equal(recentEmail.to.address, 'welsey@starapi.com')
    // assert.equal(recentEmail.to.name, 'test user')

    Mail.restore()
  })
}

{
  const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Account verification')

  trait('Test/ApiClient')
  beforeEach(async () => {
    user = await use('Factory').model('App/Models/User').make()
    user.verificationToken = 'hash-verification-token'
    await user.save()
  })

  afterEach(async () => {
    const User = use('App/Models/User')
    await User.query().delete()
  })

  test('deve retornar error se token for inválido', async ({ client, assert }) => {
    await client
      .get(`auth/verify?token=foo`)
      .end()
  })

  test('deve verificar usuário e redirecionar para home', async ({ client, assert }) => {
    await client
      .get(`auth/verify?token=hash-verification-token`)
      .end()
    const user = await User.first()
    assert.equal(user.verified, true)
  })
}

{
  const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Auth login')

  trait('Test/ApiClient')
  beforeEach(async () => { })

  afterEach(async () => {
    await User.query().delete()
  })

  test('deve retornar erro 401 quando e-mail não for registrado', async ({ client, assert }) => {
    const response = await client
      .post(`api/auth/login`)
      .send({ email: 'foo@email', password: 'test@password' })
      .accept('json')
      .end()
    response.assertStatus(401)
  })

  test('deve retornar erro 401 se a senha for inválida', async ({ client, assert }) => {
    user = await use('Factory').model('App/Models/User').make()
    user.verified = true
    await user.save()
    const response = await client
      .post(`api/auth/login`)
      .send({ email: user.email, password: 'foo@password' })
      .end()
    response.assertStatus(401)
  })

  test('deve retornar erro 401 quando e-mail não for verificado', async ({ client, assert }) => {
    user = await use('Factory').model('App/Models/User').make()
    user.verified = false
    await user.save()
    const response = await client
      .post(`api/auth/login`)
      .send({ email: user.email, password: user.password })
      .end()
    response.assertStatus(401)
  })

  test('deve gerar jwt token se a senha for válida', async ({ client, assert }) => {
    user = await use('Factory').model('App/Models/User').make()
    user.verified = true
    user.password = 'secret'
    await user.save()
    const response = await client
      .post(`api/auth/login`)
      .send({ email: user.email, password: 'secret' })
      .accept('json')
      .end()
    response.assertStatus(200)
    assert.isNotNull(response.body.data.token)
    assert.equal(response.body.data.user.email, user.email)
  })
}

{
  // const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Auth social login')

  // trait('Test/ApiClient')
  // beforeEach(async () => { })

  // afterEach(async () => {
  //   await User.query().delete()
  // })

  // test('deve retornar erro 422 se token não for informado', async ({ client, assert }) => {
  //   user = await use('Factory').model('App/Models/User').make()
  //   user.verified = true
  //   await user.save()
  //   const response = await client
  //     .post(`api/auth/login/facebook`)
  //     .accept('json')
  //     .end()
  //   response.assertStatus(422)
  // })

  // test('deve retornar erro 401 se facebook token for inválido', async ({ client, assert }) => {
  //   user = await use('Factory').model('App/Models/User').make()
  //   user.verified = true
  //   await user.save()
  //   const response = await client
  //     .post(`api/auth/login/facebook`)
  //     .send({ socialToken: 'bad token' })
  //     .end()
  //   response.assertStatus(401)
  // })

  // test('deve retornar erro 401 se google token for inválido', async ({ client, assert }) => {
  //   user = await use('Factory').model('App/Models/User').make()
  //   user.verified = true
  //   await user.save()
  //   const response = await client
  //     .post(`api/auth/login/google`)
  //     .send({ socialToken: 'bad token' })
  //     .end()
  //   response.assertStatus(401)
  // })
}

{
  const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Auth me')

  trait('Test/ApiClient')
  trait('Auth/Client')

  beforeEach(async () => {
    user = await use('Factory').model('App/Models/User').make()
    user.verified = false
    await user.save()
  })

  afterEach(async () => {
    const User = use('App/Models/User')
    await User.query().delete()
  })

  test('deve retornar erro 401 se jwt não for informado', async ({ client, assert }) => {
    const response = await client
      .get(`api/auth/me`)
      .end()
    response.assertStatus(401)
  })

  test('deve retornar user response se jwt for válido', async ({ client, assert }) => {
    const response = await client
      .get(`api/auth/me`)
      .loginVia(user, 'jwt')
      .accept('json')
      .end()
    response.assertStatus(200)
    assert.equal(response.body.data.email, user.email)
    assert.equal(response.body.data.name, user.name)
  })
}

{
  const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Auth change password')

  trait('Test/ApiClient')
  trait('Auth/Client')

  beforeEach(async () => {
    user = await use('Factory').model('App/Models/User').make()
    user.verified = false
    await user.save()
  })

  afterEach(async () => {
    const User = use('App/Models/User')
    await User.query().delete()
  })

  test('deve retornar erro 401 se jwt não for informado', async ({ client, assert }) => {
    const response = await client
      .post(`api/auth/password`)
      .end()
    response.assertStatus(401)
  })

  test('deve retornar erro 422 se password não for informado', async ({ client, assert }) => {
    const response = await client
      .post(`api/auth/password`)
      .send({ newPassword: 'test-password' })
      .loginVia(user, 'jwt')
      .accept('json')
      .end()
    response.assertStatus(422)
  })

  test('deve retornar erro 422 error new password não for informado', async ({ client, assert }) => {
    const response = await client
      .post(`api/auth/password`)
      .send({ password: 'test-password' })
      .loginVia(user, 'jwt')
      .accept('json')
      .end()
    response.assertStatus(422)
  })

  test('deve retornar erro 422 se senha não conferir', async ({ client, assert }) => {
    const response = await client
      .post(`api/auth/password`)
      .send({ password: 'test-password', newPassword: 'new-password' })
      .loginVia(user, 'jwt')
      .accept('json')
      .end()
    response.assertStatus(422)
  })

  test('deve alterar a senha se a senha for válida', async ({ client, assert }) => {
    const user = await User.create({
      email: 'test@gmail.com',
      password: 'secret'
    })
    const oldUser = await User.find(user._id)
    const response = await client
      .post(`api/auth/password`)
      .send({ password: 'secret', newPassword: 'new-password' })
      .loginVia(user, 'jwt')
      .accept('json')
      .end()
    response.assertStatus(200)
    const newUser = await User.find(user._id)
    assert.notEqual(newUser.password, oldUser.password)
  })
}

{
  const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Auth forgot')

  trait('Test/ApiClient')
  beforeEach(async () => {
    user = await use('Factory').model('App/Models/User').make()
    user.verified = false
    await user.save()
  })

  afterEach(async () => {
    const User = use('App/Models/User')
    await User.query().delete()
  })

  test('deve retornar erro 422 se email não for informado', async ({ client, assert }) => {
    const response = await client
      .post(`api/auth/forgot`)
      .accept('json')
      .end()
    response.assertStatus(422)
  })

  test('deve retornar erro 404 se e-mail não for encontrado', async ({ client, assert }) => {
    const response = await client
      .post(`api/auth/forgot`)
      .send({ email: 'test@gmail.com' })
      .accept('json')
      .end()
    response.assertStatus(404)
  })

  test('deve enviar email e response 200 success se e-mail for registrado', async ({ client, assert }) => {
    Mail.fake()
    const response = await client
      .post(`api/auth/forgot`)
      .send({ email: user.email })
      .accept('json')
      .end()
    response.assertStatus(200)

    const recentEmail = Mail.pullRecent()
    assert.equal(recentEmail.envelope.to[0], user.email)
    assert.equal(recentEmail.message.subject, 'Reset your password')

    Mail.restore()
  })
}

{
  const { test, before, beforeEach, after, afterEach, trait } = use('Test/Suite')('Auth resend verification email')

  trait('Test/ApiClient')
  beforeEach(async () => {
    user = await use('Factory').model('App/Models/User').make()
    user.verified = false
    await user.save()
  })

  afterEach(async () => {
    const User = use('App/Models/User')
    await User.query().delete()
  })

  test('deve retornar erro 422 se email não for informado', async ({ client, assert }) => {
    const response = await client
      .post(`api/auth/sendVerification`)
      .accept('json')
      .end()
    response.assertStatus(422)
  })

  test('deve retornar erro 404 se email não for encontrado', async ({ client, assert }) => {
    const response = await client
      .post(`api/auth/sendVerification`)
      .send({ email: 'test@gmail.com' })
      .accept('json')
      .end()
    response.assertStatus(404)
  })

  test('should send email and response 200 success se e-mail for registrado', async ({ client, assert }) => {
    Mail.fake()
    const response = await client
      .post(`api/auth/sendVerification`)
      .send({ email: user.email })
      .accept('json')
      .end()
    response.assertStatus(200)

    const recentEmail = Mail.pullRecent()
    assert.equal(recentEmail.envelope.to[0], user.email)
    assert.equal(recentEmail.message.subject, 'Please Verify Your Email Address')

    Mail.restore()
  })
}
