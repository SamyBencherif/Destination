# Destination

Destination is a game programming environment that supplies several essentials in one place while emphasizing leanness and procedural generation.

It is a fork of [3gw](https://github.com/samybencherif/3gw).

<img src="https://github.com/SamyBencherif/3gw/assets/10871454/4d2799df-9867-4baf-88cd-fefbe871b36b" width=300 />

Screenshot from [82e8c22](https://github.com/SamyBencherif/3gw/commit/82e8c22d2261f6648b66564825de7ef3d2df2e10) using Three.JS rendering and Cannon.js physics.

## Demo Scenes

Currently the engine comes with a handful of demo scenes that I'm developing to test out features.

### Scene 1

![](screenshots/scene1.png)

Features a couple of interactive balls, an arch, and some walking space

### Scene 2

![](screenshots/scene2.png)

Features almost nothing. This scene was created to test the scene loader.

### Scene 3

![](screenshots/scene3.png)

Consists of some fenced pillars and stairs. This scene shows more involved use of the geometry spawning API.

## Basic requirements

- 3D rendering (provided by Three.JS)
- 3D physics (provided by Cannon.js)
- First person controller
- Multiplatform, with NO build stack

## Extended requirements

- Common game mechanics (E to interact/pick up, trigger zones, 3D audio)
- Common technical features (pause menu, saves, graphics settings, cheat console)
