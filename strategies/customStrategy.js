const constants = require('../hlt/Constants')
const Geometry = require('../hlt/Geometry')

const chosenPlanets = {}
const comittedShips = {}

/**
 * strategy is a function that accepts the current game map and return a list of next steps to take
 * @param {GameMap} gameMap
 * @returns {string[]} moves that needs to be taken. null values are ignored
 */
module.exports = (gameMap) => {

  const moves = gameMap.myShips
    .filter(s => s.isUndocked())
    .map(ship => {
      const plan = comittedShips[ship._params.id]
      if (plan) {
        // great lets dock if we can
        if (plan.planet && ship.canDock(plan.planet)) return ship.dock(plan.planet)

        // ok so if we can't dock and we're next to the planet lets switch up our plan
        // lets try attacking close ships
        if (plan.planet && !plan.planet.hasDockingSpot()) {
          // seek out closest docked enemyShips
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

        const speed = Geometry.distance(ship, plan.planet) > 10 ? constants.MAX_SPEED : constants.MAX_SPEED / 2
        return ship.navigate({
          target: plan.planet,
          keepDistanceToTarget: plan.planet.radius + 3,
          speed,
          avoidObstacles: true,
          ignoreShips: false
        })
      }

      // find the planets that are free or occupied by you
      let planetsOfInterest = gameMap
        .planets
        .filter(p => {
          const chosenPlanet = chosenPlanets[p._params.id]
          if (chosenPlanet && chosenPlanet.ships > p._params.dockingSpots) {
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
      const sortedPlants = [
        ...planetsOfInterest
      ].sort((a, b) => Geometry.distance(ship, a) - Geometry.distance(ship, b))
      const chosenPlanet = sortedPlants[0]

      if (chosenPlanets[chosenPlanet._params.id]) {
        chosenPlanets[chosenPlanet._params.id].ships++
      } else {
        chosenPlanets[chosenPlanet._params.id] = {
          planet: chosenPlanet,
          ships: 1
        }
      }

      comittedShips[ship._params.id] = {
        planet: chosenPlanet
      }

      if (ship.canDock(chosenPlanet)) {
        return ship.dock(chosenPlanet)
      }
      /*
       If we can't dock, we approach the planet with constant speed.
       Don't worry about pathfinding for now, as the command will do it for you.
       We run this navigate command each turn until we arrive to get the latest move.
       Here we move at half our maximum speed to better control the ships.
       Navigate command is an example and most likely you will have to design your own.
       */
      return ship.navigate({
        target: chosenPlanet,
        keepDistanceToTarget: chosenPlanet.radius + 3,
        speed: constants.MAX_SPEED,
        avoidObstacles: true,
        ignoreShips: false
      })
    })

  return moves // return moves assigned to our ships for the Halite engine to take
}
