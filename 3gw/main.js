
/************************************************
                  MAIN PROGRAM     

  file_name: main.js
     author: Samie B
description: This is the main program of the game.

This program is responsible for the following

- Importing the GLTF Scene
- Creating a THREE.js scene
- Sending scene data to physics thread
- Continuously receiving from physics thread the position of dynamic object: playerBody
- Continuously sending camera orientation to physics thread
- Taking input and sending to physics thread
- Handling mouse and window events
- Custom game logic
*************************************************/
/*
Significant changes from user-concept

- remove GLTF loader, in favor of imperative scene defintion
  - removes need for prefixed object names SOLID*, DETECTOR*, etc
  - better organization of Detector (trigger) functions
- removed overlay, which was poorly generated from GLTF scene

*/

import * as THREE from './ext/THREE/three.module.js';
import { PointerLockControls } from './ext/THREE/jsm/controls/PointerLockControls.js';
import Stats from './ext/THREE/jsm/libs/stats.module.js'

// todo :
// fine tune player controller
// + ground test for jump
// + ground test for influence

let container, stats;
let camera, controls, scene, renderer;

var player_height = 3;

const clock = new THREE.Clock();

/* Cannon Physics */

var moveRight, moveLeft, moveBackward, moveForward

// Maximum amount of physics objects
const N=40;
const pb_size = 11

const OBJ_TYPE_STATIC  = 0;
const OBJ_TYPE_DYNAMIC = 1;
const OBJ_TYPE_TRIGGER = 2;
const OBJ_TYPE_PLAYER  = 3;

// Shared memory between this and physics thread
// float1 - object type: static(0), dynamic(1), trigger(2), player(3)
// float3 - position
// float4 - quaternion
// float3 - scale
// adds pb_size entries per transform
var physicsBodies = new Float32Array(N*pb_size)

// Create worker
var worker = new Worker("./3gw/physics.js");
worker.postMessage = worker.webkitPostMessage || worker.postMessage;

// Time when we sent last message
var sendTime; 

var index=0;

// three.js objects corresponding to physicsBodies
var meshes = [];

const root=document.location.href.replace(/\/[^/]*$/,"/")

var playerBody;
var playerIndex;

// callback for messages from CANNON physics
worker.onmessage = function(e) {

  // Get data from the worker
  physicsBodies = e.data.physicsBodies

  // Update dynamic bodies and player
  for (var i=0; i<physicsBodies.length; i++)
  {
    if (physicsBodies[pb_size*i+0] == OBJ_TYPE_DYNAMIC || physicsBodies[pb_size*i+0] == OBJ_TYPE_PLAYER)
    {
       meshes[i].position.set( 
         physicsBodies[pb_size*i+1],
         physicsBodies[pb_size*i+2],
         physicsBodies[pb_size*i+3]
       );
       meshes[i].quaternion.set(
          physicsBodies[pb_size*i+4],
          physicsBodies[pb_size*i+5],
          physicsBodies[pb_size*i+6],
          physicsBodies[pb_size*i+7]
       );
       meshes[i].scale.set(
          physicsBodies[pb_size*i+8],
          physicsBodies[pb_size*i+9],
          physicsBodies[pb_size*i+10]
       );
    }
  }

  // If the worker was faster than the time step (dt seconds), we want to delay the next timestep (? why)
  var delay = clock.getDelta() * 1000 - (Date.now()-sendTime);
  if(delay < 0) delay = 0;
  setTimeout(()=>{

  // rotate playerBody

  // send rotation information to dynamic mesh
  if (playerBody)
  {
    // get position of dynamic mesh and set camera relative
    var phy = meshes[player_index].position;
    camera.position.set(phy.x, phy.y+player_height, phy.z);
    
    // using Euler is easier than Quaternions !!!
    var e = new THREE.Euler(0,0,0,'YXZ');
    e.setFromQuaternion( camera.quaternion );
    e.x = e.z = 0;

    // create the quaternion then load that into the data bus
    // ie take camera rotation from this thread and get ready to move it to physics thread
    meshes[player_index].quaternion.setFromEuler(e);
    playerBody[pb_size*player_index+4] = mesh[player_index].quaternion.x
    playerBody[pb_size*player_index+5] = mesh[player_index].quaternion.y
    playerBody[pb_size*player_index+6] = mesh[player_index].quaternion.z
    playerBody[pb_size*player_index+7] = mesh[player_index].quaternion.w
    
    // the three.js mesh seems unnecessary ...
  }

  sendDataToWorker();
  },delay);
}

function sendDataToWorker(){
  sendTime = Date.now();
  worker.postMessage({
    N : N,
    static_N, dynamic_N, detector_N,
    dt : clock.getDelta(),
    cannonUrl : document.location.href.replace(/\/[^/]*$/,"/") + "./3gw/ext/cannon.js",
    physicsBodies,
    input: {moveRight, moveLeft, moveForward, moveBackward}
  },[positions.buffer, quaternions.buffer, sizes.buffer]);
}

function saveTransformToBuffer(mesh, objectType)
{
  var i=index;
  
  if (i >= N) {
    console.warn("Exceeded maximum number of physics bodies.")
    return;
  }
  
  if (objectType == OBJ_TYPE_PLAYER) playerIndex = i;
  
  physicsBodies[pb_size*i+0] = objectType;
  
  physicsBodies[pb_size*i+1] = mesh.position.x;
  physicsBodies[pb_size*i+2] = mesh.position.y;
  physicsBodies[pb_size*i+3] = mesh.position.z;
          
  physicsBodies[pb_size*i+4] = mesh.quaternion.x;
  physicsBodies[pb_size*i+5] = mesh.quaternion.y;
  physicsBodies[pb_size*i+6] = mesh.quaternion.z;
  physicsBodies[pb_size*i+7] = mesh.quaternion.w;
  
  physicsBodies[pb_size*i+8] = mesh.scale.x;
  physicsBodies[pb_size*i+9] = mesh.scale.y;
  physicsBodies[pb_size*i+10] = mesh.scale.z;
  index++;
  
}

/* End Cannon Physics */

/* THREE Scene Setup */

// Pointer-Lock controls (hopefully feels like conventional First Person controls)
function PLConfig()
{
  controls = new PointerLockControls( camera, renderer.domElement );
  document.body.addEventListener( 'click' , ()=>{controls.lock()});
  const onKeyDown = function ( event ) {
    switch ( event.code ) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        moveRight = true;
        break;
      case 'Space':
        requestJump = false;
        break;
    }
  };

  const onKeyUp = function ( event ) {
    switch ( event.code ) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        moveRight = false;
        break;
    }
  };

  document.addEventListener( 'keydown', onKeyDown );
  document.addEventListener( 'keyup', onKeyUp );
}

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

function init() {

  container = document.querySelector( 'body' );

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
  scene = new THREE.Scene();

  // make this name available from the console
  window.scene = scene;
  
  // background color
  // navyblue - 0x070434
  scene.background = new THREE.Color( 0xE4AEA1 );

  // spawn point
  camera.position.set( 0, player_height, 0 );

  // look direction
  camera.lookAt( 0, player_height, 1 );

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  // (optional) FPS Monitor
  stats = new Stats();
  container.appendChild( stats.dom );

  // Controller Configuration
  PLConfig();

  var pointLight = new THREE.PointLight( 0xffffff, 1 );
  scene.add( pointLight );

  window.addEventListener( 'resize', onWindowResize );
  
  playerBody = new THREE.Mesh( new THREE.SphereGeometry( 1 ), new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
  playerBody.name = "Player"
  playerBody.position.set(camera.position.x, camera.position.y, camera.position.z);
  saveTransformToBuffer(playerBody, OBJ_TYPE_PLAYER)

  sendDataToWorker()
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  if (controls.handleResize)
    controls.handleResize();

}

function render() {
  requestAnimationFrame(render);
  if (controls.update)
    controls.update( clock.getDelta() );
  renderer.render( scene, camera );
  stats.update();
}

/* END THREE SCENE SETUP */

/* MODULE */

function prism(x0, y0, z0, x1, y1, z1, texture)
{
  const geometry = new THREE.BoxGeometry(x1-x0, y1-y0, z1-z0);
  const mat = new THREE.MeshBasicMaterial( { map: texture } );
  const mesh = new THREE.Mesh( geometry, mat );

  mesh.position.x = (x0+x1)/2;
  mesh.position.y = (y0+y1)/2;
  mesh.position.z = (z0+z1)/2;

  saveTransformToBuffer(mesh, OBJ_TYPE_STATIC);

  scene.add( mesh );
  return mesh
}

function trigger()
{

}

function interactive()
{

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

function checkerboard(color0, color1, size)
{
  return generateTexture(1024, 1024, (x,y)=>[color0, color1][(~~(x/size)+~~(y/size))%2])
}

function player()
{
  
}

init();
render();

var objects = {prism, trigger, interactive}
var textures = {solidcolor, stripes, checkerboard}

export {objects, textures, player}

/* END MODULE */
