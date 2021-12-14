# GameWorldsWorkshop-HackNC2021

Note to self: Consider this alternative for physics! https://chandlerprall.github.io/Physijs/

Preliminary notes for continued development.

1. Eventually I am going to move to the wiki to write about development
2. I want to add Jumping capability to the player
3. I want to have other dynamic objects in the scene, such as a friendly cube
4. Player should be able to pick things up, and throw them perhaps
5. For now a simple way to distinguish between solid objects, detector objects, and decorative objects will be with naming convention.

For example objects titled "SOLID*", signifiying any string that starts with the word solid, will have collisions with the player. These objects are static.
"DYNAMIC*" has collisions with player and solid items. They are dynamic.
"DETECTOR*" does not create any forces, but it measures when the player or other objects enter their geometry

Any other object that does not match the naming conventions above are consider to be decorative objects, for example high detail models, or lighting.

## Tandem Game

This project is beginning to resemble a Game Engine, so in order to keep me from getting distracted by the needs of a full game engine (high abstraction, resource management, scene composition tools, etc) I will try to focus my effort by developing a game in tandom with this template. My hope is that the template will be useable for the creation of many different games that are First-Person physics-y / walking sims while taking out redudant tasks such as perfecting the player controller.

All that being said, now it's time to think about the game I want to develop in tandem ! I had a dream this morning about an official Portal 3 game that did not suck that much. At first I was skeptical of it, but then I found that it did capture fairly well what the modding community had been after. In the dream they introduced some new mechanics involving mobile robots. I might inspire the tandem game off of my dreamlike remix of Portal--or I may go back in the direction of walking sim type games such as Beginner's Guide or Stanely Parable. 

In order to maximize throughput, I'll think of this in terms of features. Lets aim to include high quality models and textures that are essential for walking sim games like Stanely Parable; and lets also aim to include "in-engine" game logic and physics interactions that are essential in games like Portal 2 and Half Life. (Here I'm referring to buttons and doors, and the gravity gun for instance; I've no interest in implementing portals right now)

The rest of my development plans will appear in the wiki (with screenshots) !
