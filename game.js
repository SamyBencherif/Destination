

function color_sum(A, B)
{
  return [A[0]+B[0], A[1]+B[1], A[2]+B[2], A[3]]
}

function color_mul(A, s)
{
  return [A[0]*s, A[1]*s, A[2]*s, A[3]*s]
}

function color_random()
{
  return [Math.random(), Math.random(), Math.random(), 255]
}

// create solid, textured ground surfaces
prism(-10, -10, -60, 10, 0, 10, generateTexture(256, 256, (x,y)=>color_sum([20,140,30,255], color_mul(color_random(), 20))))
prism(-40, -10, -60, -10, 0, -40, checkerboard([200, 190, 180, 255], [60, 20, 0, 255], 128, 64))
prism(-100, -10, -60, -50, 0, -40, checkerboard([200, 190, 180, 255], [60, 20, 0, 255], 128, 64))
prism(-120, -10, -60, -100, 0, 10, checkerboard([200, 190, 180, 255], [60, 20, 0, 255], 128, 64))


// set player spawn point & look direction
player(0, 1.3, 0, 0, 0, -1)

// set sky color
renderer.setClearColor( 0x49caef, 1 );

// create arch
prism(-8, 0, -20, -5, 14, -17, checkerboard([200, 190, 40, 255], [60, 20, 100, 255], 128, 64))
prism(5, 0, -20, 8, 14, -17, checkerboard([200, 190, 40, 255], [60, 20, 100, 255], 128, 64))
prism(-5, 11, -20, 5, 14, -17, checkerboard([200, 190, 40, 255], [60, 20, 100, 255], 128, 64))

// balls
createBall(0, 10, -20)

// create solid floating cubes
//prism(5, 2, 5, 6, 3, 6, stripes([200, 0, 200, 255], [40, 0, 200, 255], 256))
//prism(3, 2, 5, 4, 3, 6, solidcolor([0, 255, 0, 100]))

//interactive(0,5,-3, solidcolor([200, 40, 40, 255]))

//var retexGround = (entity)=>{
//  ground.texture = checkerboard([255, 0, 0, 255], [0, 0, 255, 255], 5)
//}
// create transient invisible trigger zone
//trigger(-10, .1, -10, -3, 6, 10, retexGround)