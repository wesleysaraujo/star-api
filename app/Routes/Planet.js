'use strict'

/*
|--------------------------------------------------------------------------
| Planet Routers
|--------------------------------------------------------------------------
|
*/

const Route = use('Route')

Route.group('planet', () => {
  /**
   * @swagger
   * /planets:
   *   get:
   *     tags:
   *       - Planet
   *     summary: Get Planets
   *     parameters:
   *       - $ref: '#/parameters/ListQuery'
   *       - name: searchByName
   *         in: query
   *         required: false
   *         explode: true
   *         description: Search planet by name
   *         schema:
   *           type: string
   *           example: 'Alderan'
   *     responses:
   *       200:
   *         description: Planets
   *         schema:
   *           type: array
   *           items:
   *               $ref: '#/definitions/Planet'
   */
    Route.get('/', 'Api/PlanetsController.index')
  
    /**
   * @swagger
   * /planets:
   *   post:
   *     tags:
   *       - Planet
   *     summary: Create Planet
   *     parameters:
   *       - name: body
   *         description: JSON of Planet
   *         in:  body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/NewPlanet'
   *     responses:
   *       200:
   *         description: Planet
   *         schema:
   *           $ref: '#/definitions/Planet'
   */
  Route.post('/', 'Api/PlanetsController.store')
    .middleware(['auth'])
    .validator('StorePlanet')
  
    /**
   * @swagger
   * /planets/{id}:
   *   put:
   *     tags:
   *       - Planet
   *     summary: Update Planet
   *     parameters:
   *       - name: body
   *         description: JSON of Planet
   *         in:  body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/NewPlanet'
   *     responses:
   *       200:
   *         description: Planet
   *         schema:
   *           $ref: '#/definitions/Planet'
   */
  Route.put('/:id', 'Api/PlanetsController.update')
    .middleware(['auth'])
    .instance('App/Models/Planet')

  /**
   * @swagger
   * /planets/{id}:
   *   delete:
   *     tags:
   *       - Planet
   *     summary: Returns Planet
   *     parameters:
   *       - $ref: '#/parameters/Id'
   *     responses:
   *       200:
   *         description: Planet
   *         schema:
   *           $ref: '#/definitions/Planet'
   *       404:
   *         $ref: '#/responses/NotFound'
   */
  Route.delete('/:id', 'Api/PlanetsController.destroy')
    .middleware(['auth:jwt'])
    .instance('App/Models/Planet')

    /**
   * @swagger
   * /planets/{id}:
   *   get:
   *     tags:
   *       - Planet
   *     summary: Returns Planet
   *     parameters:
   *       - $ref: '#/parameters/Id'
   *       - $ref: '#/parameters/SingleQuery'
   *     responses:
   *       200:
   *         description: Planet
   *         schema:
   *           $ref: '#/definitions/Planet'
   *       404:
   *         $ref: '#/responses/NotFound'
   */
  Route.get('/:id', 'Api/PlanetsController.show')
  .instance('App/Models/Planet')
  
}).prefix('api/planets')