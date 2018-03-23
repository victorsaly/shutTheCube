import gameServices from '../src/services/gameServices'
describe('gameServices', () => {
  it('creates the number of tiles expected', () => {
    let tiles = gameServices.createTiles(9,9)
    expect(tiles.length).toBe(9)
    
  })
  it('tile combinations produced', () => {
    let tiles = gameServices.createTiles(9,9)
    let tilesCombinations = gameServices.getTilesCombinations(tiles, 4);
    console.log(tilesCombinations);
    expect(tilesCombinations.length).toBeGreaterThan(0)
    
  })
  
})