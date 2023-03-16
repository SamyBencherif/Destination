
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
- Custom overlay rendering
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
var N=40;

// Data array containing all our kinematic data we need for rendering.
// float1 - object type: static(0), dynamic(1), trigger(2)
// float3 - position
// float4 - quaternion
// float3 - scale
// adds up to 11 32bit entries per transform
var data = new Float32Array(N*11)

// Create worker
var worker = new Worker("./3gw/physics.js");
worker.postMessage = worker.webkitPostMessage || worker.postMessage;

// Time when we sent last message
var sendTime; 

var index=0;

var meshes = [];
var detectors = [];

// callback for messages from CANNON physics
worker.onmessage = function(e) {

  // Get fresh data from the worker
  positions = e.data.positions;
  quaternions = e.data.quaternions;
  sizes = e.data.sizes;

  // Update dynamic body
  // {
  //   var i = static_N
  //   meshes[i].position.set( positions[3*i+0],
  //               positions[3*i+1],
  //               positions[3*i+2] );
  //   meshes[i].quaternion.set(quaternions[4*i+0],
  //                quaternions[4*i+1],
  //                quaternions[4*i+2],
  //                quaternions[4*i+3]);
  //   meshes[i].scale.set(sizes[3*i+0],
  //                sizes[3*i+1],
  //                sizes[3*i+2]);
  // }

  // If the worker was faster than the time step (dt seconds), we want to delay the next timestep
  var delay = clock.getDelta() * 1000 - (Date.now()-sendTime);
  if(delay < 0){
    delay = 0;
  }
  setTimeout(()=>{

  // rotate playerBody

  // send rotation information to dynamic mesh
  if (playerBody)
  {
    // get position of dynamic mesh and set camera relative
    var phy = meshes[static_N].position;
    camera.position.set(phy.x, phy.y+player_height, phy.z);
    
    // using Euler is easier than Quaternions !!!
    var e = new THREE.Euler(0,0,0,'YXZ');
    e.setFromQuaternion( camera.quaternion );
    e.x = e.z = 0;

    // create the quaternion then load that into the data bus
    meshes[static_N].quaternion.setFromEuler(e);
    saveTransformToBuffers(meshes[static_N], static_N);
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
    positions : positions,
    quaternions : quaternions,
    sizes: sizes,
    input: {moveRight, moveLeft, moveForward, moveBackward}
  },[positions.buffer, quaternions.buffer, sizes.buffer]);
}

const root=document.location.href.replace(/\/[^/]*$/,"/")

var playerBody;

function saveTransformToBuffers(mesh, index)
{
  var i=index;
  positions[3*i+0] = mesh.position.x;
  positions[3*i+1] = mesh.position.y;
  positions[3*i+2] = mesh.position.z;
          
  quaternions[4*i+0] = mesh.quaternion.x;
  quaternions[4*i+1] = mesh.quaternion.y;
  quaternions[4*i+2] = mesh.quaternion.z;
  quaternions[4*i+3] = mesh.quaternion.w;
  
  sizes[3*i+0] = mesh.scale.x;
  sizes[3*i+1] = mesh.scale.y;
  sizes[3*i+2] = mesh.scale.z;
}

function initPhysics()
{
  // DYNAMIC OBJECT (1)
  // tester dynamic object
  playerBody = new THREE.Mesh( new THREE.SphereGeometry( 1 ), new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
  playerBody.name = "Player"
  // spawn point + <0,1,0>
  playerBody.position.set(camera.position.x, camera.position.y, camera.position.z);
  saveTransformToBuffers(playerBody)
  index++;

  // we have exactly one dynamic object: the player
  dynamic_N = 1;

  sendDataToWorker()
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
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  if (controls.handleResize)
    controls.handleResize();

}

function animate() {

  requestAnimationFrame( animate );

  render();
  stats.update();
}

function render() {

  if (controls.update)
    controls.update( clock.getDelta() );
  renderer.render( scene, camera );
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

  saveTransformToBuffers(mesh, index);
  index++;

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
animate();
initPhysics();

var objects = {prism, trigger, interactive}
var textures = {solidcolor, stripes, checkerboard}

export {objects, textures, player}

/* END MODULE */