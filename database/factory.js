'use strict'

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

const Factory = use('Factory')

Factory.blueprint('App/Models/User', (faker) => {
  return {
    name: faker.name(),
    email: faker.email(),
    password: faker.password()
  }
})

Factory.blueprint('App/Models/Planet', (faker) => {
  return {
    name: faker.street(),
    climate: faker.name(),
    terrain: faker.name(),
    quantity_films: faker.natural({min: 1, max:20})
  }
})
