

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

function platform(x, y, z, color)
{
  // purple stairs
  for (var i=-14; i<6; i++)
  {
    prism(
      /* x0 */ x-30, 
      /* y0 */ y-14+2*i, 
      /* z0 */ z-15+5*i, 
      /* x1 */ x-15,  
      /* y1 */ y-14+2*i+2, 
      /* z1 */ z-15+5*i+5, 
      /* color */ generateTexture(256, 256, (x,y)=>color_sum([140,10,80,255], color_mul(color_random(), 20))))
  }

  // creates a fenced platform with the center top point at the given coordinate
  prism(
    /* x0 */ x-15, 
    /* y0 */ -4, 
    /* z0 */ z-15, 
    /* x1 */ x+15,  
    /* y1 */ y, 
    /* z1 */ z+15, 
    /* color */ generateTexture(256, 256, (x,y)=>color_sum([140,110,80,255], color_mul(color_random(), 20))))

  // colored unit on top of platform
  prism(
    /* x0 */ x-4, 
    /* y0 */ y, 
    /* z0 */ z-4, 
    /* x1 */ x+4,  
    /* y1 */ y+.2, 
    /* z1 */ z+4, 
    /* color */ generateTexture(256, 256, (x,y)=>color_sum(color, color_mul(color_random(), 20))))

  // plant fence posts
  for (var i=0; i<3; i++)
  {
    for (var j=0; j<3; j++)
    {
      if (i==1 && j==1) continue;

      var fence_post_size = 1;
      var fence_post_height = 5;
      prism(
        /* x0 */ x-15+(15-fence_post_size/2)*i, 
        /* y0 */ y, // bottom of post
        /* z0 */ z-15+(15-fence_post_size/2)*j, 
        /* x1 */ x-15+(15-fence_post_size/2)*i+fence_post_size,  
        /* y1 */ y+fence_post_height,  // top of post
        /* z1 */ z-15+(15-fence_post_size/2)*j+fence_post_size,
        /* color */ generateTexture(256, 256, (x,y)=>color_sum([70,30,10,255], color_mul(color_random(), 20))))

      // x-axis aligned top bar between fence posts
      if (i != 2 && j != 1)
      prism(
        /* x0 */ x-15+(15-fence_post_size/2)*i+fence_post_size, 
        /* y0 */ y+fence_post_height*2/3-.3, // bottom of bar
        /* z0 */ z-15+(15-fence_post_size/2)*j, 
        /* x1 */ x-15+(15-fence_post_size/2)*(i+1),  
        /* y1 */ y+fence_post_height*2/3+.7,  // top of bar
        /* z1 */ z-15+(15-fence_post_size/2)*j+fence_post_size,
        /* color */ generateTexture(256, 256, (x,y)=>color_sum([70,30,10,255], color_mul(color_random(), 20))))

      // x-axis aligned bottom bar between fence posts
      if (i != 2 && j != 1)
      prism(
        /* x0 */ x-15+(15-fence_post_size/2)*i+fence_post_size, 
        /* y0 */ y+fence_post_height*1/3-.7-.3, // bottom of bar
        /* z0 */ z-15+(15-fence_post_size/2)*j, 
        /* x1 */ x-15+(15-fence_post_size/2)*(i+1),  
        /* y1 */ y+fence_post_height*1/3-.7+.7,  // top of bar
        /* z1 */ z-15+(15-fence_post_size/2)*j+fence_post_size,
        /* color */ generateTexture(256, 256, (x,y)=>color_sum([70,30,10,255], color_mul(color_random(), 20))))

      // y-axis aligned top bar between fence posts
      if (j != 2 && i != 1 && /* gap for entrance */ !(i == 0 && j == 1))
      prism(
        /* x0 */ x-15+(15-fence_post_size/2)*i, 
        /* y0 */ y+fence_post_height*2/3-.3, // bottom of bar
        /* z0 */ z-15+(15-fence_post_size/2)*j+fence_post_size, 
        /* x1 */ x-15+(15-fence_post_size/2)*i+fence_post_size,  
        /* y1 */ y+fence_post_height*2/3+.7,  // top of bar
        /* z1 */ z-15+(15-fence_post_size/2)*(j+1),
        /* color */ generateTexture(256, 256, (x,y)=>color_sum([70,30,10,255], color_mul(color_random(), 20))))

      // y-axis aligned bottom bar between fence posts
      if (j != 2 && i != 1 && /* gap for entrance */ !(i == 0 && j == 1))
      prism(
        /* x0 */ x-15+(15-fence_post_size/2)*i, 
        /* y0 */ y+fence_post_height*1/3-.7-.3, // bottom of bar
        /* z0 */ z-15+(15-fence_post_size/2)*j+fence_post_size, 
        /* x1 */ x-15+(15-fence_post_size/2)*i+fence_post_size,  
        /* y1 */ y+fence_post_height*1/3-.7+.7,  // top of bar
        /* z1 */ z-15+(15-fence_post_size/2)*(j+1),
        /* color */ generateTexture(256, 256, (x,y)=>color_sum([70,30,10,255], color_mul(color_random(), 20))))

    }
  }
}

function scene3_load()
{
    // main grass plane
    var ground_size = 200;
    prism(-ground_size, -10, -ground_size, 
           ground_size,  -2, ground_size, generateTexture(2*256, 2*256, (x,y)=>color_sum([20,140,30,255], color_mul(color_random(), 20))))

    // cyan platform
    ground_size = 30;
    prism(-ground_size, -10, -ground_size-10, 
          ground_size-.01,  -1, ground_size-10, generateTexture(256, 256, (x,y)=>color_sum([20,100,140,255], color_mul(color_random(), 3))))

    // yellow platform
    ground_size = 15;
    prism(-ground_size-0.01, -10, -ground_size-15, 
          ground_size,  0.01, ground_size-15, generateTexture(256, 256, (x,y)=>color_sum([200,150,20,255], color_mul(color_random(), 3))))


    // place interactive cube
    interactive_cube(-10, 0, -20, 3, generateTexture(128, 128, (x,y)=>[200, 50, 30, 255]))
      
    // set player spawn point & look direction
    player(0, 1.3, -15, 0, 0, 1)

    // beige platform 1
    platform(15, 14, 15, [255, 255, 255, 255])

    // beige platform 2
    platform(-60, 40, 50, [255, 255, 255, 255])

    // beige platform 3
    platform(60, 40, 50, [255, 255, 255, 255])

    // beige platform 4
    platform(0, 40, -90, [255, 255, 255, 255])

    // set sky color
    renderer.setClearColor( 0x99caef, 1 );

    //interactive(0,5,-3, solidcolor([200, 40, 40, 255]))

    //var retexGround = (entity)=>{
    //  ground.texture = checkerboard([255, 0, 0, 255], [0, 0, 255, 255], 5)
    //}
    // create transient invisible trigger zone
    //trigger(-10, .1, -10, -3, 6, 10, retexGround)
}
