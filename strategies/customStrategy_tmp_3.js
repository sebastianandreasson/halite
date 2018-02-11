const constants = require('../hlt/Constants')
const Geometry = require('../hlt/Geometry')

const chosenPlanets = {}
const comittedShips = {}
const lastPositions = {}

const attackStrategy = (gameMap, ship) => {
  const enemyShips = gameMap
    .enemyShips
    .filter(s => s.isDocked())
    .sort((a, b) => Geometry.distance(ship, a) - Geometry.distance(ship, b))

  if (!enemyShips.length) return null

  const enemyShip = enemyShips[0]
  return ship.navigate({
    target: enemyShip,
    keepDistanceToTarget: 2,
    speed: constants.MAX_SPEED,
    avoidObstacles: true,
    ignoreShips: false
  })
}

const checkNearbyEnemies = (gameMap, ship) => {
  const enemyShips = gameMap
    .enemyShips
    .filter(s => Geometry.distance(ship, s) <= 10)
    .sort((a, b) => Geometry.distance(ship, a) - Geometry.distance(ship, b))

  if (!enemyShips.length) {
    return null
  }

  const enemyShip = enemyShips[0]
  return ship.navigate({
    target: enemyShip,
    keepDistanceToTarget: 2,
    speed: constants.MAX_SPEED,
    avoidObstacles: true,
    ignoreShips: false
  })
}

/**
 * strategy is a function that accepts the current game map and return a list of next steps to take
 * @param {GameMap} gameMap
 * @returns {string[]} moves that needs to be taken. null values are ignored
 */
module.exports = (gameMap) => {

  const moves = gameMap.myShips
    .filter(s => s.isUndocked())
    .map(ship => {
      if (lastPositions[ship._params.id] && lastPositions[ship._params.id].turns > 8 && Geometry.distance(ship, lastPositions[ship._params.id]) === 0) {
        // we are not docked and we haven't moved, lets switch up
        return attackStrategy(gameMap, ship)
      }

      if (!lastPositions[ship._params.id]) {
        lastPositions[ship._params.id] = {
          ship,
          turns: 1
        }
      } else {
        lastPositions[ship._params.id].ship = ship
        lastPositions[ship._params.id].turns++
      }

      const plan = comittedShips[ship._params.id]
      if (plan) {
        // great lets dock if we can
        if (plan.planet && ship.canDock(plan.planet)) return ship.dock(plan.planet)

        // ok so if we can't dock and we're next to the planet lets switch up our plan
        // lets try attacking close ships
        if (plan.attack || plan.planet && !plan.planet.hasDockingSpot()) {
          // seek out closest docked enemyShips
          return attackStrategy(gameMap, ship)
        }

        const speed = Geometry.distance(ship, plan.planet) > 10 ? constants.MAX_SPEED : constants.MAX_SPEED / 2
        const angularStep = Geometry.distance(ship, plan.planet) > 25 ? 5 : 1
        return ship.navigate({
          target: plan.planet,
          keepDistanceToTarget: plan.planet.radius + 3,
          speed,
          angularStep,
          avoidObstacles: true,
          ignoreShips: false
        })
      }
      // if we don't have a plan we're either at the start or ship has just been created

      // before trying to find a free mining spot we should check if an enemy is really close and go attack
      const attackStrat = checkNearbyEnemies(gameMap, ship)
      if (attackStrat) return attackStrat

      // find the planets that are free or occupied by you
      let planetsOfInterest = gameMap
        .planets
        .filter(p => {
          const chosenPlanet = chosenPlanets[p._params.id]
          if (chosenPlanet && chosenPlanet.ships >= p._params.dockingSpots) {
            return false
          }
          return true
        })
        .filter(p => p.isFree() || (p.isOwnedByMe() && p.hasDockingSpot() ))

      if (planetsOfInterest.length === 0) {
        planetsOfInterest = gameMap
          .planets
          .filter(p => !p.isOwnedByMe())
      }

      // sorting planets based on the distance to the ship
      const sortedPlants = planetsOfInterest.sort((a, b) => Geometry.distance(ship, a) - Geometry.distance(ship, b))
      const chosenPlanet = sortedPlants[0]

      if (!chosenPlanet) {
        return attackStrategy(gameMap, ship)
      }

      if (chosenPlanets[chosenPlanet._params.id]) {
        chosenPlanets[chosenPlanet._params.id].ships++
      } else {
        chosenPlanets[chosenPlanet._params.id] = {
          planet: chosenPlanet,
          ships: 1
        }
      }

      comittedShips[ship._params.id] = { planet: chosenPlanet }

      if (ship.canDock(chosenPlanet)) return ship.dock(chosenPlanet)

      return ship.navigate({
        target: chosenPlanet,
        keepDistanceToTarget: chosenPlanet.radius + 3,
        speed: constants.MAX_SPEED,
        avoidObstacles: true,
        ignoreShips: false,
        angularStep: 1
      })
    })

  return moves // return moves assigned to our ships for the Halite engine to take
}
