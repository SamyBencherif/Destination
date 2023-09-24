#include <stdlib.h>
#include <math.h>

#include "raylib.h" /* 4.5.0 */
#include <rlgl.h>
#include <raymath.h>

#include "player.c"
#include "pause.c"

#include "graphics.c"
#include "world.c"

void update(void)
{
  pause_update();
  if (!paused) {
    first_person_controller();
  }

  BeginDrawing();
  ClearBackground(RAYWHITE);
  BeginMode3D(camera);

  world();

  EndMode3D();

  // draws pause menu, and possibly breaks out of program
  if (paused && draw_pause_menu()) exit(0);

  EndDrawing();
}

int main(void)
{
  srandom(0x0);
  SetTraceLogLevel(LOG_ERROR);

  int width = GetScreenWidth();
  int height = GetScreenHeight();

  InitWindow(width, height, "game");
  SetWindowState(FLAG_FULLSCREEN_MODE);

  // don't close on 'ESC'
  SetExitKey(0);

  // initialize audio
  InitAudioDevice();
  //printf("Waiting for audio device...\r\n");
  while (!IsAudioDeviceReady());
  SetMasterVolume(.25);

  camera.position = (Vector3){ 0.0, 5.0, 0.0f };
  camera.target = (Vector3){ 0.0, 5.0, -1.0f };
  camera.up = (Vector3){ 0.0, 1.0, 0.0f };
  camera.fovy = 80.0f;
  camera.projection = CAMERA_PERSPECTIVE;

  DisableCursor();

  SetTargetFPS(60);
  while (!(WindowShouldClose()))
  {
    update();
  }

  CloseWindow();
  CloseAudioDevice();

  return 0;
}
