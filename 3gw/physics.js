/************************************************
               PHYSICS THREAD
*************************************************/    

var world;

const pb_size = 11;

const OBJ_TYPE_STATIC  = 0;
const OBJ_TYPE_DYNAMIC = 1;
const OBJ_TYPE_TRIGGER = 2;
const OBJ_TYPE_PLAYER  = 3;

const walkStrength = 50;

function init(e)
{
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

  var body_count = e.data.N;
  // physics body init
  for(var i=0; i<body_count; i++){

    // Create box (representing solid collider for each scene item)
    var shape, body;          

    // the first object after statics is dynamic/player
    if (e.data.physicsBodies[pb_size*i+0] == OBJ_TYPE_PLAYER)
    {
      body = new CANNON.Body({ mass: 1, fixedRotation: true, material: standardPhysicsMaterial });
      shape = new CANNON.Sphere(e.data.physicsBodies[pb_size*i+8]); 
    }
    
    // static bodies
    if (e.data.physicsBodies[pb_size*i+0] == OBJ_TYPE_STATIC)
    {
      body = new CANNON.Body({ mass: .3 , material: standardPhysicsMaterial });
      shape = new CANNON.Box(new CANNON.Vec3(
        Math.abs(e.data.sizes[3*i]/2),
        Math.abs(e.data.sizes[3*i+1]/2),
        Math.abs(e.data.sizes[3*i+2]/2)
      ));
    }
    
    // dynamic bodies
    if (e.data.physicsBodies[pb_size*i+0] == OBJ_TYPE_DYNAMIC)
    {
      body = new CANNON.Body({ mass: 0 , material: standardPhysicsMaterial });
      shape = new CANNON.Box(new CANNON.Vec3(
        Math.abs(e.data.sizes[3*i]/2),
        Math.abs(e.data.sizes[3*i+1]/2),
        Math.abs(e.data.sizes[3*i+2]/2)
      ));
    }
    
    if (e.data.physicsBodies[pb_size*i+0] == OBJ_TYPE_TRIGGER)
    {
      shape.collisionResponse = false;
    }
      
    body.addShape(shape);
    world.addBody(body);
  }
}

self.onmessage = function(e) {

  // *** Configure world on first message *** //
  if (e.data.cannonUrl && !world) {
    init(e)
  }

  // pull main thread updates on player object
  for (var i=0; i<e.data.N; i++)
  {
    world.bodies[i].position.set(e.data.physicsBodies[pb_size*i+1], e.data.physicsBodies[pb_size*i+2], e.data.physicsBodies[pb_size*i+3]);
    world.bodies[i].quaternion.set(e.data.physicsBodies[pb_size*i+4], e.data.physicsBodies[pb_size*i+5], e.data.physicsBodies[pb_size*i+6], e.data.physicsBodies[pb_size*i+7]);
  }
    
  // Step the world
  world.step(e.data.dt);
  
  // Copy over the data to the buffers
  for(var i=0; i<e.data.N; i++){
    if (e.data.physicsBodies[pb_size*i+0] == OBJ_TYPE_PLAYER)
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
        world.bodies[i].position.set(0,2,0);
        world.bodies[i].velocity.setZero();
      }
    }    
  
    // b contains data from Cannon
    var b = world.bodies[i],
      p = b.position,
      q = b.quaternion;
    
    // positions, quaternions are the names of our buffers
    e.data.physicsBodies[pb_size*i+1] = p.x;
    e.data.physicsBodies[pb_size*i+2] = p.y;
    e.data.physicsBodies[pb_size*i+3] = p.z;
    e.data.physicsBodies[pb_size*i+4] = q.x;
    e.data.physicsBodies[pb_size*i+5] = q.y;
    e.data.physicsBodies[pb_size*i+6] = q.z;
    e.data.physicsBodies[pb_size*i+7] = q.w;
  }

  var detections = [];
  for (var contact of world.contacts)
  {
    detections.push([contact.bj.id,contact.bi.id]);
  }

  // Send data back to the main thread
  self.postMessage({
    physicsBodies: e.data.physicsBodies,
    detections: detections
  }, [e.data.physicsBodies.buffer]);
};
