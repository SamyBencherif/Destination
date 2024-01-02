
var sphereShape, playerBody, world, physicsMaterial;
var balls=[], ballMeshes=[], boxes=[], boxMeshes=[];

var camera, scene, renderer;
var geometry, material, mesh;
var controls, time = Date.now();

var ballShape = new CANNON.Sphere(1);
var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);

var play_first_click = true;

function unpause(event) 
{
    if (play_first_click)
    {
        // load default scene
        scene3_load(); 
        
        document.querySelector(".menu").style.background = "rgba(0,0,0,.5)";
        play_first_click =  false
    }

    document.querySelectorAll('.menu').forEach((el)=>el.style.display = 'none');
    document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
    document.body.requestPointerLock({unadjustedMovement: true});

    controls.enabled = true;

    if (event)
        event.stopPropagation();
}

function loadscene_menu(event) 
{   
    // show scene selection menu
    document.querySelector("#mainmenu").style.display = "none";
    document.querySelector("#sceneselect").style.display = "initial";
}

function loadscene_back(event)
{
    document.querySelector("#sceneselect").style.display = "none";
    document.querySelector("#mainmenu").style.display = "initial";
}

// called before loading a scene, prepares rendering and physics
// called only once at instantiation of runtime
// to load other scenes, use reset, then load
function init()
{
    initCannon();
    initTHREE();
    animate();
}
init()

function reset()
{
    // clear both world (physics) and scene (rendering) to prepare for a new world
    // TODO: rename variables world and scene to better show their role in the system

    // clear all Three.js objects from renderer
    scene.children = [];
    // clear our memory model of them as well
    boxMeshes = [];
    ballMeshes = [];

    // the collection of Cannon objects is not accessible through the API
    // so we remove physics objects one by one
    for (var box of boxes)
        world.removeBody(box)
    for (var ball of balls)
        world.removeBody(ball)
    // clear memory model
    boxes = [];
    balls = [];

    // note that the player body is never removed
    // we need to re-add it to the rendering scene 
    scene.add( controls.getObject() );
}

function initCannon()
{
    // Setup our world
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    var solver = new CANNON.GSSolver();

    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRelaxation = 4;

    solver.iterations = 7;
    solver.tolerance = 0.1;
    var split = true;
    if(split)
        world.solver = new CANNON.SplitSolver(solver);
    else
        world.solver = solver;

    world.gravity.set(0,-60,0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // Create a slippery material (friction coefficient = 0.0)
    physicsMaterial = new CANNON.Material("slipperyMaterial");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
                                                            physicsMaterial,
                                                            0.0, // friction coefficient
                                                            0.3  // restitution
                                                            );
    // We must add the contact materials to the world
    world.addContactMaterial(physicsContactMaterial);

    // Create the player's physics body (a sphere)
    var mass = 5, radius = 1.3;
    sphereShape = new CANNON.Sphere(radius);
    playerBody = new CANNON.Body({ mass: mass });
    playerBody.addShape(sphereShape);
    playerBody.position.set(0, 1.3, 0);
    playerBody.linearDamping = 0.9;
    world.addBody(playerBody);
}

function initTHREE() 
{
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x000000, 0, 500 );

    controls = new PointerLockControls(camera , playerBody);
    scene.add( controls.getObject() );

    renderer = new THREE.WebGLRenderer();
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( scene.fog.color, 1 );

    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function player_reset()
{
  player(spawn_x, spawn_y, spawn_z, spawn_lookX, spawn_lookY, spawn_lookZ);
}

var dt = 1/60;
function animate() 
{
    requestAnimationFrame( animate );
    if(controls.enabled){
        world.step(dt);

        // Copy ball positions from physics to renderer
        for(var i=0; i<balls.length; i++){
            ballMeshes[i].position.copy(balls[i].position);
            ballMeshes[i].quaternion.copy(balls[i].quaternion);
        }

        // Copy box positions from physics to renderer
        for(var i=0; i<boxes.length; i++){
            boxMeshes[i].position.copy(boxes[i].position);
            boxMeshes[i].quaternion.copy(boxes[i].quaternion);
        }

        // reset player if they fall off the world
        if (playerBody.position.y < -100)
        {
          player_reset()
        }

        // use THREE to raycast interactive boxes

        // var lookDirection = new THREE.Vector3();
        // controls.getDirection(lookDirection); // output is saved to lookDirection
        // const raycaster = new THREE.Raycaster(camera.position, lookDirection);
        // const intersects = raycaster.intersectObjects( scene.children );
        // for ( let i = 0; i < intersects.length; i ++ ) {
        //     // highlight object in front of camera
        //     intersects[ i ].object.material = getStandardMaterial(generateTexture(1, 1, (x,y)=>[255,255,255,255]))
        // }
    }

    controls.update(Date.now() - time);
    renderer.render(scene, camera);
    time = Date.now();

}

function createBall(x, y, z)
{
  var ballBody = new CANNON.Body({ mass: 1 });
  var ballMesh = new THREE.Mesh( ballGeometry, material );

  ballBody.addShape(ballShape);

  world.addBody(ballBody);
  scene.add(ballMesh);
  
  ballMesh.castShadow = true;
  ballMesh.receiveShadow = true;
  
  balls.push(ballBody);
  ballMeshes.push(ballMesh);

  ballBody.velocity.set(0,0,0);
  ballBody.position.set(x,y,z);
  ballMesh.position.set(x,y,z);
}

function generateTexture(w, h, pixfunc) 
{
    const canvas = document.createElement( 'canvas' );
    canvas.width = w;
    canvas.height = h;

    const context = canvas.getContext( '2d' );
    const image = context.getImageData( 0, 0, w, h );

    for ( let i = 0, j = 0, l = image.data.length; i < l; i += 4, j ++ ) {
        var color = pixfunc(~~(i/4) % w, ~~((i/4) / w))
        image.data[ i ] = color[0];
        image.data[ i + 1 ] = color[1];
        image.data[ i + 2 ] = color[2];
        image.data[ i + 3 ] = color[3];
    }

    context.putImageData( image, 0, 0 );

    var tex = new THREE.Texture( canvas );
    tex.needsUpdate = true;
    return tex;
}

function getStandardMaterial(texture)
{
    var mat = new THREE.MeshBasicMaterial({ 
        map: texture,
    })

    return mat
}

function getTriggerMaterial()
{
    // TODO: make invisible for released games
    var opacity = 40
    var texture = checkerboard([0, 200, 0, opacity], [200, 200, 0, opacity], 50)
    var mat = new THREE.MeshBasicMaterial({ 
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
    })

    return mat
}

function prism(x0, y0, z0, x1, y1, z1, texture)
{
    const material = getStandardMaterial(texture);

    var halfExtents = new CANNON.Vec3((x1-x0)/2, (y1-y0)/2, (z1-z0)/2);
    var boxShape = new CANNON.Box(halfExtents);
    var boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    
    var boxBody = new CANNON.Body({ mass: 5, type: CANNON.Body.STATIC });
    boxBody.addShape(boxShape);
    var boxMesh = new THREE.Mesh(boxGeometry, material);
    world.addBody(boxBody);
    scene.add(boxMesh);
    
    var x = (x0+x1)/2;
    var y = (y0+y1)/2;
    var z = (z0+z1)/2;
    boxBody.position.set(x, y, z);
    boxMesh.position.set(x, y, z);

    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;

    boxes.push(boxBody);
    boxMeshes.push(boxMesh);

    return boxMesh
}

function trigger(x0, y0, z0, x1, y1, z1, callback)
{
    const material = getTriggerMaterial();

    var halfExtents = new CANNON.Vec3((x1-x0)/2, (y1-y0)/2, (z1-z0)/2);
    var boxShape = new CANNON.Box(halfExtents);
    var boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    
    var boxBody = new CANNON.Body({ mass: 5, type: CANNON.Body.STATIC });
    boxBody.addShape(boxShape);
    boxBody.collisionResponse = false;
    var boxMesh = new THREE.Mesh(boxGeometry, material);
    world.addBody(boxBody);
    scene.add(boxMesh);
    
    var x = (x0+x1)/2;
    var y = (y0+y1)/2;
    var z = (z0+z1)/2;
    boxBody.position.set(x, y, z);
    boxMesh.position.set(x, y, z);

    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;

    boxes.push(boxBody);
    boxMeshes.push(boxMesh);

    return boxMesh
}

function interactive_cube(x, y, z, size, texture)
{
    const material = getStandardMaterial(texture);

    var halfExtents = new CANNON.Vec3(.5 * size, .5 * size, .5 * size);
    var boxShape = new CANNON.Box(halfExtents);
    var boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    
    var boxBody = new CANNON.Body({ mass: 5 });
    boxBody.addShape(boxShape);
    var boxMesh = new THREE.Mesh(boxGeometry, material);
    world.addBody(boxBody);
    scene.add(boxMesh);
    
    boxBody.position.set(x, y, z);
    boxMesh.position.set(x, y, z);

    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;

    boxes.push(boxBody);
    boxMeshes.push(boxMesh);

    return boxMesh
}

function solidcolor(color)
{
  return generateTexture(4, 4, (x,y)=>color)
}

function stripes(color0, color1, size, traverseDir)
{
  if (!traverseDir) traverseDir = [1,1]
  return generateTexture(1024, 1024, (x,y)=>[color0, color1][~~((traverseDir[0]*x+traverseDir[1]*y)/size)%2])
}

function checkerboard(color0, color1, size_x, size_y)
{
  size_y = size_y || size_x;
  return generateTexture(1024, 1024, (x,y)=>[color0, color1][(~~(x/size_x)+~~(y/size_y))%2])
}

var spawn_x, spawn_y, spawn_z, spawn_lookX, spawn_lookY, spawn_lookZ;
function player(x, y, z, lookX, lookY, lookZ)
{
    lookX = lookX || 0
    lookY = lookY || 0
    lookZ = lookZ || -1
    playerBody.position.set(x,y,z)
    controls.setDirection(lookX, lookY, lookZ)

    spawn_x = x;
    spawn_y = y;
    spawn_z = z;
    
    spawn_lookX = lookX;
    spawn_lookY = lookY;
    spawn_lookZ = lookZ;

    playerBody.velocity.set(0,0,0);
}

function pause()
{
    if (!document.pointerLockElement)
    {
        controls.enabled = false;
        document.querySelector("#mainmenu").style.display = "block";
    }
}

document.addEventListener("pointerlockchange", pause);
document.addEventListener("keydown", (event)=>{
    if (event.key == "Escape")
    {
        // this happens when pointer lock is rejected and player presses escape
        pause();
    }
})
