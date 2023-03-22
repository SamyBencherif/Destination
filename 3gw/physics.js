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
  world.gravity.set(0, -10, 0);
  world.solver.tolerance = 0.001;

  var standardPhysicsMaterial = new CANNON.Material({
    friction: 0.14
  })

  var body_count = e.data.N;

  // physics body init
  for(var i=0; i<body_count; i++){

    // Create box (representing solid collider for each scene item)
    var shape, body;

    var isPlayer = e.data.physicsBodies[pb_size*i+0] == OBJ_TYPE_PLAYER;
    var isTrigger = e.data.physicsBodies[pb_size*i+0] == OBJ_TYPE_TRIGGER;
    var isStatic = e.data.physicsBodies[pb_size*i+0] == OBJ_TYPE_STATIC;
    var isDynamic = e.data.physicsBodies[pb_size*i+0] == OBJ_TYPE_DYNAMIC;

    if (isPlayer)
    {
      body = new CANNON.Body({ mass: 1, fixedRotation: true, });
      shape = new CANNON.Sphere(1); 
    }
    else
    {
      shape = new CANNON.Box(new CANNON.Vec3(
        Math.abs(e.data.physicsBodies[pb_size*i+8]/2),
        Math.abs(e.data.physicsBodies[pb_size*i+9]/2),
        Math.abs(e.data.physicsBodies[pb_size*i+10]/2)
      ));
    }
    
    body = new CANNON.Body({ mass: 1,
      type: (isTrigger || isStatic) ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC
    });
    
    if (isTrigger)
      body.collisionResponse = false;

    // if (e.data.physicsBodies[pb_size*i+0] == OBJ_TYPE_TRIGGER ||
    //     e.data.physicsBodies[pb_size*i+0] == OBJ_TYPE_STATIC)
    //   body.type = CANNON.Body.STATIC;
      
    body.addShape(shape);
    world.addBody(body);
  }
}

self.onmessage = function(e) {

  // *** Configure world on first message *** //
  if (e.data.cannonUrl && !world) {
    init(e)
    // pull main thread world updates
    for (var i=0; i<e.data.N; i++)
    {
      world.bodies[i].position.set(e.data.physicsBodies[pb_size*i+1], e.data.physicsBodies[pb_size*i+2], e.data.physicsBodies[pb_size*i+3]);
      world.bodies[i].quaternion.set(e.data.physicsBodies[pb_size*i+4], e.data.physicsBodies[pb_size*i+5], e.data.physicsBodies[pb_size*i+6], e.data.physicsBodies[pb_size*i+7]);
    }
  }
  
    
  for(var i=0; i<e.data.N; i++){
    if (e.data.physicsBodies[pb_size*i+0] == OBJ_TYPE_PLAYER)
    {
      world.bodies[i].quaternion.set(e.data.physicsBodies[pb_size*i+4], e.data.physicsBodies[pb_size*i+5], e.data.physicsBodies[pb_size*i+6], e.data.physicsBodies[pb_size*i+7]);
      /* PLAYER CUSTOM PHYSICS */

      if (e.data.input.moveLeft)
        world.bodies[i].applyLocalForce(new CANNON.Vec3(-walkStrength, 0, 0), new CANNON.Vec3(0, 1, 0));
      if (e.data.input.moveRight)
        world.bodies[i].applyLocalForce(new CANNON.Vec3(walkStrength, 0, 0), new CANNON.Vec3(0, 1, 0));
      if (e.data.input.moveForward)
        world.bodies[i].applyLocalForce(new CANNON.Vec3(0, 0, -walkStrength), new CANNON.Vec3(0, 1, 0));
      if (e.data.input.moveBackward)
        world.bodies[i].applyLocalForce(new CANNON.Vec3(0, 0, walkStrength), new CANNON.Vec3(0, 1, 0));
      if (e.data.input.moveUp)
        world.bodies[i].applyLocalForce(new CANNON.Vec3(0, walkStrength, 0), new CANNON.Vec3(0, 1, 0));
      if (e.data.input.moveDown)
        world.bodies[i].applyLocalForce(new CANNON.Vec3(0, -walkStrength, 0), new CANNON.Vec3(0, 1, 0));
        
      // player anti-gravity
      // world.bodies[i].applyLocalForce(new CANNON.Vec3(0, 10, 0), new CANNON.Vec3(0, 1, 0));

      // if player fell off edge of world
      if (world.bodies[i].position.y < -100) 
      {
        world.bodies[i].position.set(0, 2, 0);
        world.bodies[i].velocity.set(0, 0, 0);
      }
    }
  }

  // Step the world
  world.step(e.data.dt);

  // write positions, quaternions to buffers
  for (var i=0; i<e.data.N; i++) 
  {
    var b = world.bodies[i],
    p = b.position,
    q = b.quaternion;
    
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
    detections.push([contact.bj.id, contact.bi.id]);
  }

  // Send data back to the main thread
  self.postMessage({
    physicsBodies: e.data.physicsBodies,
    detections: detections
  }, [e.data.physicsBodies.buffer]);
};
