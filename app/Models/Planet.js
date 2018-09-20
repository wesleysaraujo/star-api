'use strict'

const Model = use('Model')

/**
 * @swagger
 * definitions:
 *   NewPlanet:
 *     type: object
 *     required:
 *       - name
 *       - climate
 *       - terrain
 *     properties:
 *       name:
 *         type: string
 *       climate:
 *         type: string
 *       terrain:
 *         type: string
 *   UpdatePlanet:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *       climate:
 *         type: string
 *       terrain:
 *         type: string
 *   Planet:
 *     allOf:
 *       - $ref: '#/definitions/NewPlanet'
 *       - type: object
 *         properties:
 *           _id:
 *             type: string
 */
class Planet extends Model {
  // timestamp
  static get createTimestamp () { return 'createdAt' }
  static get updateTimestamp () { return 'updatedAt' }
  static get deleteTimestamp () { return 'deletedAt' }

  static boot () {
    super.boot()
  }
}

module.exports = Planet
