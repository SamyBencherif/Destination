
debug = true

if (debug)
  TRIGGER = solidcolor('#0f05')
else
  TRIGGER = solidcolor('#0000')

// set player spawn point
// position specifies where the player is standing
// (ie just below bottom of controller)
player(0,0,0,'Z+')

// create solid, textured ground surface
ground = prism(
  -10, 0, -10,
  10, 0, 10,
  true,
  checkerboard('#fff', '#000', 20) 
)

retexGround = ()=>{
  ground.texture = checkerboard('#f00', '#00f', 5)
}

// create transient invisible trigger zone
prism( -10, 6, -10, -3, 0, 10, false, TRIGGER, retexGround)
