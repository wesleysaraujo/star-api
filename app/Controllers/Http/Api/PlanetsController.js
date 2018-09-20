'use strict'

const BaseController = use('App/Controllers/Http/Api/BaseController')
const Planet = use('App/Models/Planet')
const Swapi = use('swapi-node')
/**
 * Resourceful controller for interacting with planets
 */

class PlanetsController extends BaseController {
  /**
   * Show a list of all planets.
   * GET planets
   */
  async index ({ request, response, decodeQuery }) {
    const page = 1
    const planets = await Planet.query().paginate(page)

    return response.apiCollection(planets)
  }

  /**
   * Create/save a new planet.
   * POST planets
   */
  async store ({ request, response }) {
    let planet = request.only(['name', 'climate', 'terrain'])

    planet.name = planet.name.toLowerCase()
    planet.name = planet.name.charAt(0).toUpperCase() + planet.name.slice(1)
    planet.films = []

    await Swapi.get(`http://swapi.co/api/planets/?search=${planet.name}`).then(result => {
      if (result.results.length) {
        planet.films = result.results[0].films
      }
    })

    await Planet.create(planet)

    return response.apiCreated(planet)
  }

  /**
   * Display a single planet.
   * GET planets/:id
   */
  async show ({ request, response, instance }) {
    let planet = instance

    if (planet.films.length) {
      let films = []
      
      await planet.films.map(
        async (film) => {
          await Swapi.get(film).then((result) => {
            console.log(result.title)
            films.push(result)
          }).catch((error) => {
            console.log(error)
          })
        }
      )

      console.log(films)
    }
    
    return response.apiSuccess(planet)
  }

  /**
   * Update planet details.
   * PUT or PATCH planets/:id
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a planet with id.
   * DELETE planets/:id
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = PlanetsController
