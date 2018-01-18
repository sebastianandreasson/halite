const GameMap = require('../hlt/GameMap')
const GameMapParser = require('../hlt/GameMapParser')

const { defaultStrategy } = require('./strategies')

// this is an example of how you can test your strategy given predefined map situation.
// testing is optional but gives you faster feedback/debug cycle
describe('strategies', () => {
  describe('myStrategy', () => {
    it('should move ships to the closest planet', () => {
      const gameMap = new GameMap({ myPlayerId: 1, width: 120, height: 120 })
      gameMap.addPlayerShips(1, [
        {id: 2, x: 10, y: 10},
        {id: 3, x: 30, y: 30}
      ])
      gameMap.addPlanets([
        { id: 4, x: 80, y: 80, radius: 20 }
      ])

      console.log(defaultStrategy(gameMap))
    })

    it('reproduce situation', () => {
        const gameMap = createGameMap('2 0 16 2 112.7685 62.7152 255 0.0000 0.0000 2 2 0 0 7 116.6040 76.6040 255 0.0000 0.0000 2 2 0 0 9 113.8806 77.8461 255 0.0000 0.0000 2 2 0 0 11 117.8461 73.8806 255 0.0000 0.0000 0 0 0 0 13 109.9151 78.5462 255 0.0000 0.0000 0 0 0 0 15 118.5462 69.9151 255 0.0000 0.0000 0 0 0 0 17 105.9495 77.8461 255 0.0000 0.0000 0 0 0 0 19 117.8461 65.9495 255 0.0000 0.0000 0 0 0 0 21 103.2261 76.6040 255 0.0000 0.0000 0 0 0 0 23 116.6040 63.2261 255 0.0000 0.0000 0 0 0 0 25 101.9840 73.8806 255 0.0000 0.0000 0 0 0 0 27 101.2839 69.9151 255 0.0000 0.0000 0 0 0 0 29 109.9151 61.2839 255 0.0000 0.0000 0 0 0 0 31 101.9840 65.9495 255 0.0000 0.0000 0 0 0 0 33 105.9495 61.9840 255 0.0000 0.0000 0 0 0 0 35 103.2261 63.2261 255 0.0000 0.0000 0 0 0 0 1 16 4 127.2315 97.2848 255 0.0000 0.0000 2 0 0 0 6 123.3960 83.3960 255 0.0000 0.0000 2 0 0 0 8 122.1539 86.1194 255 0.0000 0.0000 2 0 0 0 10 126.1194 82.1539 255 0.0000 0.0000 0 0 0 0 12 121.4538 90.0849 255 0.0000 0.0000 0 0 0 0 14 130.0849 81.4538 255 0.0000 0.0000 0 0 0 0 16 122.1539 94.0505 255 0.0000 0.0000 0 0 0 0 18 134.0505 82.1539 255 0.0000 0.0000 0 0 0 0 20 123.3960 96.7739 255 0.0000 0.0000 0 0 0 0 22 136.7739 83.3960 255 0.0000 0.0000 0 0 0 0 24 138.0160 86.1194 255 0.0000 0.0000 0 0 0 0 26 130.0849 98.7161 255 0.0000 0.0000 0 0 0 0 28 138.7161 90.0849 255 0.0000 0.0000 0 0 0 0 30 134.0505 98.0160 255 0.0000 0.0000 0 0 0 0 32 138.0160 94.0505 255 0.0000 0.0000 0 0 0 0 34 136.7739 96.7739 255 0.0000 0.0000 0 0 0 0 12 0 130.0849 90.0849 1690 6.6311 3 3708 954 1 1 3 4 6 8 1 109.9151 90.0849 1690 6.6311 3 0 954 0 0 0 2 109.9151 69.9151 1690 6.6311 3 3708 954 1 0 3 2 7 9 3 130.0849 69.9151 1690 6.6311 3 0 954 0 0 0 4 39.9108 112.0990 1726 6.7690 3 0 974 0 0 0 5 50.5614 42.9776 1726 6.7690 3 0 974 0 0 0 6 200.0892 47.9010 1726 6.7690 3 0 974 0 0 0 7 189.4386 117.0224 1726 6.7690 3 0 974 0 0 0 8 159.8812 125.3182 1834 7.1926 3 0 1035 0 0 0 9 91.5309 143.4843 1834 7.1926 3 0 1035 0 0 0 10 80.1188 34.6818 1834 7.1926 3 0 1035 0 0 0 11 148.4691 16.5157 1834 7.1926 3 0 1035 0 0 0');

        gameMap.allShips.forEach(s => console.log(s.toString()))
        gameMap.planets.forEach(p => console.log(p.toString()))
        console.log(defaultStrategy(gameMap))
    })
  })

  function createGameMap(line) {
    return new GameMapParser({
        myPlayerId: 0,
        width: 240,
        height: 160
    }).parse(line)
  }
})
