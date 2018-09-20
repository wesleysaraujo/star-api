'use strict'

{
  const { test, trait } = use('Test/Suite')('Get swagger spec')

  trait('Test/ApiClient')

  test('deve retornar um response json do swagger spec', async ({ client }) => {
    const response = await client
      .get(`/api-specs`)
      .accept('json')
      .end()
    response.assertStatus(200)
    response.assertJSONSubset({
      info: {
        title: 'Star Wars Planets API',
        version: '1.0.0'
      }
    })
  })
}
