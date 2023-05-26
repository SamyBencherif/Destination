

// create solid, textured ground surface
var ground = prism(
  -10, -10, -10, 
  10, 0, 10, 
  checkerboard([200, 200, 200, 255], [0, 0, 0, 255], 128) 
)

// create solid floating cubes
prism(5, 2, 5, 6, 3, 6, stripes([200, 0, 200, 255], [40, 0, 200, 255], 256))
prism(3, 2, 5, 4, 3, 6, solidcolor([0, 255, 0, 100]))

interactive(0,5,-3, solidcolor([200, 40, 40, 255]))

// set player spawn point
// optionally specify look direction, defaults to 0, 0, -1
player(0, 1.3, 0, 0, 0, -1)

var retexGround = (entity)=>{
  ground.texture = checkerboard([255, 0, 0, 255], [0, 0, 255, 255], 5)
}
// create transient invisible trigger zone
trigger( -10, .1, -10, -3, 6, 10, retexGround)