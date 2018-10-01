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
    const searchByName = request.input('searchByName')
    const page = 1

    let planets = Planet.query(decodeQuery())

    if (searchByName !== undefined) {
      planets.where({name: {$regex: new RegExp('^' + searchByName , 'i')}})
    } 

    planets = await planets.paginate(page)

    return response.apiCollection(planets)
  }

  /**
   * Create/save a new planet.
   * POST planets
   */
  async store ({ request, response }) {
    const planet = request.only(['name', 'climate', 'terrain'])

    planet.name = planet.name.toLowerCase()
    planet.name = planet.name.charAt(0).toUpperCase() + planet.name.slice(1)
    planet.quantity_films = 0

    await Swapi.get(`http://swapi.co/api/planets/?search=${planet.name}`).then(result => {
      if (result.results.length) {
        planet.quantity_films = result.results[0].films.length
      }
    })

    const newPlanet = await Planet.create(planet)

    return response.apiCreated(newPlanet)
  }

  /**
   * Display a single planet.
   * GET planets/:id
   */
  async show ({ request, response, instance }) {
    let planet = instance
    
    return response.apiSuccess(planet)
  }

  /**
   * Update planet details.
   * PUT or PATCH planets/:id
   */
  async update ({ params, request, response }) {
    const planet = instance

    planet.merge(request.only(['name', 'climate', 'terrain']))

    await planet.save()
    
    return response.apiUpdated(planet)
  }

  /**
   * Delete a planet with id.
   * DELETE planets/:id
   */
  async destroy ({ params, request, response }) {
    const planet = instance

    await planet.delete()
    
    return response.apiDeleted()
  }
}

module.exports = PlanetsController
