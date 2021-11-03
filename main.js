
/************************************************
                  MAIN PROGRAM     

  file_name: main.js
     author: Samie B (change this)
description: This is the main program of the game.

This program is responsible for the following

- Importing the GLTF Scene
- Creating a THREE.js scene
- Sending scene data to physics thread
- Continuously receiving from physics thread the position of dynamic object: testerD
- Continuously sending camera orientation to physics thread
- Taking input and sending to physics thread
- Handling mouse and window events
- Custom game logic
- Custom overlay rendering
*************************************************/

// todo :
// fine tune player controller
// + ground test for jump
// + ground test for influence
// clean up code

var dt = 1/60; 

// Maximum amount of physics objects
var N=40;

var static_N = 0;
var dynamic_N = 0;
var detector_N = 0;
window.static_N = ()=>static_N;
window.dynamic_N = ()=>dynamic_N;
window.detector_N = ()=>detector_N;

// Data arrays. Contains all our kinematic data we need for rendering.
var positions = new Float32Array(N*3);
var quaternions = new Float32Array(N*4);
var sizes = new Float32Array(N*3);

// Create worker
var worker = new Worker("physics.js");
worker.postMessage = worker.webkitPostMessage || worker.postMessage;

// Time when we sent last message
var sendTime; 

var meshes = [];
var detectors = [];
window.meshes = meshes;
window.detectors = detectors;

// callback for messages from CANNON physics
worker.onmessage = function(e) {

  // Get fresh data from the worker
  positions = e.data.positions;
  quaternions = e.data.quaternions;
  sizes = e.data.sizes;

  // Update dynamic body
  {
    var i = static_N
    meshes[i].position.set( positions[3*i+0],
                positions[3*i+1],
                positions[3*i+2] );
    meshes[i].quaternion.set(quaternions[4*i+0],
                 quaternions[4*i+1],
                 quaternions[4*i+2],
                 quaternions[4*i+3]);
    meshes[i].scale.set(sizes[3*i+0],
                 sizes[3*i+1],
                 sizes[3*i+2]);
  }

  for (var d of e.data.detections)
  {
    if (meshes[d].name.toLowerCase().startsWith("detector"))
    {
      if (d == 24)
      {
        // set the background to dark
        scene.background.set(0);
      }
      else
      {
        // we can use console.log to figure the value of d
      }
    }
  }

  // If the worker was faster than the time step (dt seconds), we want to delay the next timestep
  var delay = dt * 1000 - (Date.now()-sendTime);
  if(delay < 0){
    delay = 0;
  }
  setTimeout(()=>{

  // rotate testerD

  // send rotation information to dynamic mesh
  if (testerD)
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
    dt : dt,
    cannonUrl : document.location.href.replace(/\/[^/]*$/,"/") + "../build/cannon.js",
    positions : positions,
    quaternions : quaternions,
    sizes: sizes,
    input: {moveRight,moveLeft,moveForward,moveBackward}
  },[positions.buffer, quaternions.buffer, sizes.buffer]);
}

const root=document.location.href.replace(/\/[^/]*$/,"/")

import * as THREE from './build/three.module.js';
window.THREE = THREE;

import Stats from './jsm/libs/stats.module.js';

import { FirstPersonControls } from './jsm/controls/FirstPersonControls.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { PointerLockControls } from './jsm/controls/PointerLockControls.js';
import { TransformControls } from './jsm/controls/TransformControls.js';

import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';

let container, stats;
let camera, controls, scene, renderer;
let mesh, texture;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();
const onDownPosition = new THREE.Vector2();

var transformControl;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let requestJump = false;

var player_height = 3;

let prevTime = performance.now();
const direction = new THREE.Vector3();

const clock = new THREE.Clock();

init();
animate();

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

var testerD;

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

// this is just a shorter form of the function above
function saveTransform(index)
{
  return saveTransformToBuffers(meshes[index], index);
}
window.saveTransform = saveTransform;

function initPhysics()
{
  // STATIC OBJECTS
  // attaching each object ensures its transform is not relative to a parent
  // our physics system does not understand relative transforms
  for (var obj of meshes)
  {
    scene.attach(obj);
    static_N++;
  }
  
  // DYNAMIC OBJECT (1)
  // tester dynamic object
  testerD = new THREE.Mesh( new THREE.SphereGeometry( 1 ), new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
  testerD.name = "Player"
  // spawn point + <0,1,0>
  testerD.position.set(0,1,0);
  window.testerD = testerD;
  meshes.push(testerD);
  // we have exactly one dynamic object: the player
  dynamic_N = 1;

  for (var d of detectors)
  {
    detector_N++;
    meshes.push(d);
  }
   
  // prepare all meshes for use by the physics thread
  for (var i=0; i<static_N; i++)
    saveTransform(i);
  for (var i=0; i<dynamic_N; i++)
    saveTransform(static_N+i);
  for (var i=0; i<detector_N; i++)
    saveTransform(static_N+dynamic_N+i);
  
  sendDataToWorker()
}

function init() {

  container = document.getElementById( 'container' );

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
  window.camera = camera;
  
  scene = new THREE.Scene();

  // make this name available from the console
  window.scene = scene;
  
  // background color
  // navyblue - 0x070434
  scene.background = new THREE.Color( 0xE4AEA1 );

  // spawn point
  camera.position.set( 0, player_height, 0 );

  // look direction
  camera.lookAt( 33.74, 3.782, 0.0 );

  // load scene from file
  const loader = new GLTFLoader();
  
  function processObj(obj)
  {

    if (obj.type == "Mesh")
    {
      if (obj.name.toLowerCase().startsWith("detector"))
      {
        // this would be a good time to apply a custom material to each detector:
        // ...
        obj.visible = false;

        // (for right now, detectors only show up in the minimap)
        detectors.push(obj);
      }
      else
        meshes.push(obj);
    }
    
    for (var child of obj.children)
      processObj(child);
      
    if (meshes.length > N)
    {
      console.error("Maximum meshes exceeded. Please increase the maximum amount.");
    }
  }
  
  loader.load('scene.gltf',
  function (gltf)
  {            
    // here gltf scene is loaded
    scene.add(gltf.scene)
    
    for (var child of scene.children)
    {
      processObj(child);
    }
    initPhysics();
    
  });
  ////

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  stats = new Stats();
  // (optional) FPS Monitor
  //container.appendChild( stats.dom );

  // Controller Configuration
  PLConfig();

  initOverlays();

  window.addEventListener( 'resize', onWindowResize );
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  if (controls.handleResize)
    controls.handleResize();

}

var ocanvas, octx, owidth, oheight;
function initOverlays()
{
  // we may not use the same canvas for THREE and overlays
  // so we will create one with transparency to go on top
  ocanvas = document.createElement("canvas");
  octx = ocanvas.getContext('2d');
  window.ocanvas = ocanvas;
  window.octx = octx;

  // place canvas on top of everything
  ocanvas.style.position = "absolute";
  ocanvas.style.width = owidth+"px";
  ocanvas.style.height = oheight+"px";
  ocanvas.style.top = "0px";
  ocanvas.style.left = "0px";

  // canvas size
  owidth = 250;
  oheight = 250;
  ocanvas.width = owidth;
  ocanvas.height = oheight;

  ocanvas.style.opacity = "40%";

  document.body.appendChild(ocanvas);
}

function drawOverlays(time,delta)
{
  octx.clearRect(0,0,owidth,oheight);

  octx.save();

  // make transform suitable for rendering area, keep player centered
  octx.translate(owidth/2, oheight/2);
  octx.scale(4,4);
  octx.translate(-camera.position.x, -camera.position.z);

  // draw map world
  octx.fillStyle = "#FFF";
  for (var i=0; i<meshes.length-1; i++)
  {
    octx.save();

    // this for-loop does not include the last mesh because that one is the
    // dynamic mesh used for the player's physics
    var mesh = meshes[i];

    // copy parts of mesh's 3D transformation into context's 2D transformation
    octx.translate(mesh.position.x, mesh.position.z);
    octx.rotate(mesh.rotation.y);
    octx.scale(mesh.scale.x, mesh.scale.z);

    // draw centered rectangle (using transformation defined above)
    octx.fillRect(-.5,-.5,1,1);

    // restore transformation
    octx.restore();
  }

  // repeat the same thing for detectors
  octx.fillStyle = "#00FF00FF";
  for (var i=0; i<detectors.length; i++)
  {
    // save context's 2D (identity) transformation
    octx.save();

    // this for-loop does not include the last mesh because that one is the
    // dynamic mesh used for the player's physics
    var mesh = detectors[i];

    // copy parts of mesh's 3D transformation into context's 2D transformation
    octx.translate(mesh.position.x, mesh.position.z);
    octx.rotate(mesh.rotation.y);
    octx.scale(mesh.scale.x, mesh.scale.z);

    // draw centered rectangle (using transformation defined above)
    octx.fillRect(-.5,-.5,1,1);

    // restore transformation
    octx.restore();
  }

  // draw player
  octx.fillStyle = "rgba(241, 187, 134, .8)";
  octx.fillRect(camera.position.x-1, camera.position.z-1, 2, 2);

  octx.restore();
}

var rotationAxis = new THREE.Vector3();

function findMesh(name)
{
  for (var i=0; i<meshes.length-1; i++)
  {
    if (meshes[i].name == name) return i;
  }
}
window.findMesh = findMesh;

function animate() {

  requestAnimationFrame( animate );

  const time = performance.now();
  const delta = ( time - prevTime ) / 1000;

  drawOverlays(time, delta)

  // animated transform
  /*
  This value is set soon before rendering so the physics step will not
  have a chance to overwrite with the default value.
  */
  if (findMesh("Torus"))
  {
    meshes[findMesh("Torus")].rotation.y = time/1000;
  }

  render();
  stats.update();
  prevTime = time;
}


function render() {

  if (controls.update)
    controls.update( clock.getDelta() );

  renderer.render( scene, camera );
  
}

function onPointerDown( event ) {

  onDownPosition.x = event.clientX;
  onDownPosition.y = event.clientY;

}

function onPointerUp() {

  onUpPosition.x = event.clientX;
  onUpPosition.y = event.clientY;

  if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) transformControl.detach();

}

function onPointerMove( event ) {

  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  // useful for clickable objects:
  //raycaster.setFromCamera( pointer, camera );
}
