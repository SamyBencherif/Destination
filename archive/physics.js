/************************************************
               PHYSICS THREAD
*************************************************/    

var world;

const walkStrength = 50;

self.onmessage = function(e) {

  // *** First message only *** //
  if (e.data.cannonUrl && !world) {
    // Load cannon.js
    importScripts(e.data.cannonUrl);

    // Init physics solver
    world = new CANNON.World();
    world.broadphase = new CANNON.NaiveBroadphase();
    world.gravity.set(0,-10,0);
    world.solver.tolerance = 0.001;

    var standardPhysicsMaterial = new CANNON.Material({
      friction: 0.14
    })

    var body_count = e.data.static_N+e.data.dynamic_N+e.data.detector_N;
    // physics body init
    for(var i=0; i<body_count; i++){
    
      // Create box (representing solid collider for each scene item)
      var shape, body;          
    
      // the first object after statics is dynamic/player
      if (i == e.data.static_N) 
      {
        body = new CANNON.Body({ mass: 1, fixedRotation: true, material: standardPhysicsMaterial });

        // player body is oversized to prevent clipping
        // normally there would be a factor of 1/2 here
        shape = new CANNON.Sphere(e.data.sizes[3*i]); 
      }
      // static bodies
      else 
      {
        body = new CANNON.Body({ mass: 0 , material: standardPhysicsMaterial });
        shape = new CANNON.Box(new CANNON.Vec3(
          Math.abs(e.data.sizes[3*i]/2),
          Math.abs(e.data.sizes[3*i+1]/2),
          Math.abs(e.data.sizes[3*i+2]/2)
        ));
      }
      
      if (i >= e.data.static_N+e.data.dynamic_N) // dynamics & detectors
      {
        // turn off collisions
        shape.collisionResponse = false;
      }
        
      body.addShape(shape);
      body.position.set(e.data.positions[3*i],e.data.positions[3*i+1],e.data.positions[3*i+2]);
      body.quaternion.set(e.data.quaternions[4*i],e.data.quaternions[4*i+1],e.data.quaternions[4*i+2],e.data.quaternions[4*i+3]);
      world.addBody(body);
    }
  }
  // *** End first message only *** //

  // pull main thread updates on player object
  var i = e.data.static_N;
  world.bodies[i].position.set(
    e.data.positions[3*i],
    e.data.positions[3*i+1],
    e.data.positions[3*i+2]
  )  
  world.bodies[i].quaternion.set(
    e.data.quaternions[4*i],
    e.data.quaternions[4*i+1],
    e.data.quaternions[4*i+2],
    e.data.quaternions[4*i+3]
  )

  // Step the world
  world.step(e.data.dt);

  // Copy over the data to the buffers
  var positions = e.data.positions;
  var quaternions = e.data.quaternions;
  var sizes = e.data.sizes;
  for(var i=0; i!==world.bodies.length; i++){
     /*
     i == static_N corresponds to the first dynamic mesh

     Here is a visual of how the meshes/bodies are organized:
     let static_N = 3, dynamic_N = 2, detector_N = 1
     [static][static][static][dynamic][dynamic][detector]
      i = 0   i = 1   i = 2    i = 3    i = 4    i = 5
                             ^^^^^^^^^
                             The first dynamic object is 
                             use for the player.

    Notice how the player has an index of 3 in this example,
    which matches static_N. Whenever we see an if statement
    with `i == e.data.static_N` it means we are doing something
    related to the player object.
    */
    if (i == e.data.static_N)  
    {
      /* PLAYER CUSTOM PHYSICS */

      if (e.data.input.moveLeft)
        world.bodies[i].applyLocalForce(new CANNON.Vec3(-walkStrength,0,0), new CANNON.Vec3(0,1,0));
      if (e.data.input.moveRight)
        world.bodies[i].applyLocalForce(new CANNON.Vec3(walkStrength,0,0), new CANNON.Vec3(0,1,0));
      if (e.data.input.moveForward)
        world.bodies[i].applyLocalForce(new CANNON.Vec3(0,0,-walkStrength), new CANNON.Vec3(0,1,0));
      if (e.data.input.moveBackward)
        world.bodies[i].applyLocalForce(new CANNON.Vec3(0,0,walkStrength), new CANNON.Vec3(0,1,0));

      // if player fell off edge of world
      if (world.bodies[i].position.y < -100) 
      {
        // TODO: make it more obvious that the player died and reset
        world.bodies[i].position.set(0,2,0);
        world.bodies[i].velocity.setZero();
      }
    }    
  
    // b contains data from Cannon
    var b = world.bodies[i],
      p = b.position,
      q = b.quaternion;
    
    // positions, quaternions are the names of our buffers
    positions[3*i + 0] = p.x;
    positions[3*i + 1] = p.y;
    positions[3*i + 2] = p.z;
    quaternions[4*i + 0] = q.x;
    quaternions[4*i + 1] = q.y;
    quaternions[4*i + 2] = q.z;
    quaternions[4*i + 3] = q.w;
    
    // the sizes buffer is untouched because we do not expect this data
    // to change during a physics step. The sizes buffer is only used once
    // to send size information about the scene to Cannon.
    //
    // Theoretically, it could be sent every time the THREE.js programmer
    // makes a change to an object's scale, but that would also require
    // calling Cannon constructors every-time, which seems impractical.
  }

  var detections = [];
  for (var contact of world.contacts)
  {
    var player_index = e.data.static_N

    if (contact.bi.id == player_index)
      detections.push(contact.bj.id);
    else if (contact.bj.id == player_index)
      detections.push(contact.bi.id);
  }

  // Send data back to the main thread
  self.postMessage({
    positions:positions,
    quaternions:quaternions,
    sizes: sizes,
    detections: detections
  }, [positions.buffer,
    quaternions.buffer,
    sizes.buffer]);
};
