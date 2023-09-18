# 3gw - Raylib

3gw is a game programming environment that supplies several essentials in one place while emphasizing leanness and procedural generation.

<img src="https://github.com/SamyBencherif/3gw/assets/10871454/4d2799df-9867-4baf-88cd-fefbe871b36b" width=300 />

Screenshot from [82e8c22](https://github.com/SamyBencherif/3gw/commit/82e8c22d2261f6648b66564825de7ef3d2df2e10) using Three.JS rendering and Cannon.js physics.

## Basic requirements

- 3D rendering (provided by Raylib or Three.JS)
- 3D physics (provided by Bullet, Cannon.js, or ODE)
- First person controller
- Multiplatform, with manageable build stack

## Extended requirements

- Common game mechanics (E to interact/pick up, trigger zones, 3D audio)
- Common technical features (pause menu, saves, graphics settings, cheat console)

## Starting again in Raylib

2023 Jun 4th. I am happy with progress of 3gw using THREE.js and cannon.js, but I recently got a foldable keyboard for my Pinephone turning it into the portable development device of my dreams. It would be really neat to work on my debut game from this device, but it seems like the Pinephone (sxmo + PostMarket OS) is not capable of WebGL in Firefox-ESR or Chromium. It simply crashes when I try to run my game. I've run Raylib-based applications on pinephone before (Mobian), so I suspect it will work on sxmo and with 3D rendering. To catch up with the main implementation I may try the following:

1. Build on Ubuntu laptop ✅ (switch to MacOS on Macbook)
1. Render 3D ✅
1. Basic FP Controller ✅
1. Build on Pinephone ❌
1. Test multi-key input ✅
1. Integrate Bullet/ODE physics ❌ (I did my own physics, but that's not uploaded yet)
1. Refine FPC as needed (jump) ✅
1. Implement 3gw (prisms, textures, triggers) ❌ (electing not to maintain a spec, just implementing game contents and peripherals)

## Preboot reboot

Now on 2023 Sep 17th, I'm not using the Pinephone anymore. But I've continued with Raylib a fair bit, adding my own physics and player controller.

This branch will be updated to contain a mostly empty world with a first person controller.

![image](https://github.com/SamyBencherif/3gw/assets/10871454/26137425-0b73-4118-a81e-96be45b0fb49)
