'use strict'

const BaseValidator = require('./BaseValidator')

class StorePlanet extends BaseValidator {
  get rules () {
    return {
      name: 'required|min:2|max:100',
      climate: 'required',
      terrain: 'required'
    }
  }
}

module.exports = StorePlanet
