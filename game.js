

import {player, objects, textures} from './3gw/main.js'

// create solid, textured ground surface
var ground = objects.prism(
  -10, -10, -10, 
  10, -8, 10, 
  textures.checkerboard([34, 34, 34, 255], [0, 0, 0, 255], 128) 
)

// create solid floating cubes
objects.prism(5, 5, 5, 6, 6, 6, textures.stripes([200, 0, 200, 255], [40, 0, 200, 255], 256))
objects.prism(3, 5, 5, 4, 6, 6, textures.solidcolor([0, 255, 0, 100]))

var retexGround = (entity)=>{
  ground.texture = textures.checkerboard([255, 0, 0, 255], [0, 0, 255, 255], 5)
}

objects.interactive(3,3,3, textures.solidcolor([200, 40, 40, 255]))

// set player spawn point
// position specifies where the player is standing
// (ie just below bottom of controller)
// optionally specify look direction, defaults to 0, 0, 1
player(0, 0, 0, 0, 0, 1)

// create transient invisible trigger zone
//objects.trigger( -10, 6, -10, -3, 0, 10, false, retexGround)