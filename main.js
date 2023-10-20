
var sphereShape, playerBody, world, physicsMaterial, walls=[], balls=[], ballMeshes=[], boxes=[], boxMeshes=[];

var camera, scene, renderer;
var geometry, material, mesh;
var controls, time = Date.now();

function unpause(event) {
    document.querySelector('#mainmenu').style.display = 'none';

  document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
  document.body.requestPointerLock({
    unadjustedMovement: true
  });

  controls.enabled = true;

  event.stopPropagation();
}

initCannon();
init();
animate();

function initCannon(){
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

    world.gravity.set(0,-30,0);
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

    // Create a sphere
    var mass = 5, radius = 1.3;
    sphereShape = new CANNON.Sphere(radius);
    playerBody = new CANNON.Body({ mass: mass });
    playerBody.addShape(sphereShape);
    playerBody.position.set(0, 1.3, 0);
    playerBody.linearDamping = 0.9;
    world.addBody(playerBody);
}

function init() {

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

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

var dt = 1/60;
function animate() {
    requestAnimationFrame( animate );
    if(controls.enabled){
        world.step(dt);

        // Update ball positions
        for(var i=0; i<balls.length; i++){
            ballMeshes[i].position.copy(balls[i].position);
            ballMeshes[i].quaternion.copy(balls[i].quaternion);
        }

        // Update box positions
        for(var i=0; i<boxes.length; i++){
            boxMeshes[i].position.copy(boxes[i].position);
            boxMeshes[i].quaternion.copy(boxes[i].quaternion);
        }
    }

    controls.update(Date.now() - time);
    renderer.render(scene, camera);
    time = Date.now();

}

var ballShape = new CANNON.Sphere(0.2);
var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
var shootDirection = new THREE.Vector3();
var shootVelo = 15;
var projector = new THREE.Projector();
function getShootDir(targetVec){
    var vector = targetVec;
    targetVec.set(0,0,1);
    projector.unprojectVector(vector, camera);
    var ray = new THREE.Ray(playerBody.position, vector.sub(playerBody.position).normalize());
    targetVec.copy(ray.direction);
}

window.addEventListener("click",function(e){
    if(controls.enabled==true){
        var x = playerBody.position.x;
        var y = playerBody.position.y;
        var z = playerBody.position.z;
        var ballBody = new CANNON.Body({ mass: 1 });
        ballBody.addShape(ballShape);
        var ballMesh = new THREE.Mesh( ballGeometry, material );
        world.addBody(ballBody);
        scene.add(ballMesh);
        ballMesh.castShadow = true;
        ballMesh.receiveShadow = true;
        balls.push(ballBody);
        ballMeshes.push(ballMesh);
        getShootDir(shootDirection);
        ballBody.velocity.set(  shootDirection.x * shootVelo,
                                shootDirection.y * shootVelo,
                                shootDirection.z * shootVelo);

        // Move the ball outside the player sphere
        x += shootDirection.x * (sphereShape.radius*1.02 + ballShape.radius);
        y += shootDirection.y * (sphereShape.radius*1.02 + ballShape.radius);
        z += shootDirection.z * (sphereShape.radius*1.02 + ballShape.radius);
        ballBody.position.set(x,y,z);
        ballMesh.position.set(x,y,z);
    }
});

function generateTexture(w, h, pixfunc) {
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

function interactive(x, y, z, texture)
{
    const material = getStandardMaterial(texture);

    var halfExtents = new CANNON.Vec3(.5, .5, .5);
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

function player(x,y,z,lookX,lookY,lookZ)
{
    lookX = lookX || 0
    lookY = lookY || 0
    lookZ = lookZ || -1
    playerBody.position.set(x,y,z)
    controls.setDirection(lookX, lookY, lookZ)
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
