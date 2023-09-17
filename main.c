#include "raylib.h" /* 4.5.0 */
#include <rlgl.h>
#include <raymath.h>

#include <stdio.h>
#include <stdlib.h>

Camera camera = { 0 };
bool paused = false;
Vector2 look = {0., 0.};
bool mouse_ready = false;
#define JUMP_HEIGHT 6
#define JUMP_DURATION .5
float timer_jump = 0;
Vector3 forward = {0, 0, 0}; // player's forward direction

Vector3 world_pos;
Model world;
Texture2D world_tex;

void player_move(float x, float z)
{
  camera.position.x += x;
  camera.position.z += z;
}

void player_jump()
{
  if (IsKeyPressed(KEY_SPACE) && timer_jump == 0) timer_jump = JUMP_DURATION;
  if (timer_jump > 0) timer_jump -= GetFrameTime();
  else timer_jump = 0;

  // let's call this 'stylized jumping' instead of physically based
  camera.position.y = 5 + sin(timer_jump*PI/JUMP_DURATION) * JUMP_HEIGHT;
  camera.target.y = camera.position.y + forward.y;
}

void rlVertex3v3f(Vector3 lx, Vector3 ly, Vector3 lz, float x, float y, float z)
{
  // extension to RL/GL API, preforms rlVertex3f call with arbitrary change of basis

  // to apply the rotation:
  // rlVertex3f(xf,yf,zf):
  //   Vector Math: C = xf*lx + yf*ly + zf*lz
  //   rlVertex3f(C.x, C.y, C.z);

  // It's possible for some transformations to invert normals
  // make sure triangles are still drawn counter-clockwise from the outside

  Vector3 C = Vector3Scale(lx, x);
  C = Vector3Add(C, Vector3Scale(ly, y));
  C = Vector3Add(C, Vector3Scale(lz, z));
  rlVertex3f(C.x, C.y, C.z);
}

void DrawThickLine3D(Vector3 start, Vector3 end, float thickness, Color color)
{
  // adapted from DrawCylinder in Raylib > rmodels.c
  rlPushMatrix();
  rlTranslatef(start.x, start.y, start.z);
  rlBegin(RL_TRIANGLES);
  rlColor4ub(color.r, color.g, color.b, color.a);

  // line local coordinate bases
    // direction of line
    Vector3 ly = Vector3Normalize(Vector3Subtract(end, start));
    // 2d plane to draw end caps (arbitrary rotation)
    Vector3 lz = Vector3Perpendicular(ly);
    Vector3 lx = Vector3CrossProduct(ly, lz);

    float length = Vector3Length(Vector3Subtract(end, start));


  // Draw Body 
  for (int i = 0; i < 360; i += 120)
  {
    // Draw quad using triangles

    // Triangle 0: Bottom Left
    rlVertex3v3f(lx, ly, lz, sinf(DEG2RAD*i)*thickness, 0, cosf(DEG2RAD*i)*thickness);

    // Triangle 0: Bottom Right
    rlVertex3v3f(lx, ly, lz, sinf(DEG2RAD*(i + 120))*thickness, 0, cosf(DEG2RAD*(i + 120))*thickness);

    // Triangle 0: Top Right
    rlVertex3v3f(lx, ly, lz, sinf(DEG2RAD*(i + 120))*thickness, length, cosf(DEG2RAD*(i + 120))*thickness);

    // Triangle 1: Top Right
    rlVertex3v3f(lx, ly, lz, sinf(DEG2RAD*(i + 120))*thickness, length, cosf(DEG2RAD*(i + 120))*thickness);

    // Triangle 1: Top Left
    rlVertex3v3f(lx, ly, lz, sinf(DEG2RAD*i)*thickness, length, cosf(DEG2RAD*i)*thickness);

    // Triangle 1: Bottom Left
    rlVertex3v3f(lx, ly, lz, sinf(DEG2RAD*i)*thickness, 0, cosf(DEG2RAD*i)*thickness);
  }

  // Draw Bottom
  rlVertex3v3f(lx, ly, lz, sinf(DEG2RAD*0)*thickness, 0, cosf(DEG2RAD*0)*thickness);
  rlVertex3v3f(lx, ly, lz, sinf(DEG2RAD*120)*thickness, 0, cosf(DEG2RAD*120)*thickness);
  rlVertex3v3f(lx, ly, lz, sinf(DEG2RAD*240)*thickness, 0, cosf(DEG2RAD*240)*thickness);

  // Draw Top 
  rlVertex3v3f(lx, ly, lz, sinf(DEG2RAD*0)*thickness, length, cosf(DEG2RAD*0)*thickness);
  rlVertex3v3f(lx, ly, lz, sinf(DEG2RAD*120)*thickness, length, cosf(DEG2RAD*120)*thickness);
  rlVertex3v3f(lx, ly, lz, sinf(DEG2RAD*240)*thickness, length, cosf(DEG2RAD*240)*thickness);

  rlEnd();
  rlPopMatrix();
}

void load()
{
  world = LoadModel("world.obj");
  world_tex = LoadTexture("atlas.png");

  //printf("Loading...\r\n");
  while (!IsModelReady(world));
  while (!IsTextureReady(world_tex));
  //printf("Done Loading!\r\n");

  // I use only a single material and texture
  SetMaterialTexture(world.materials, MATERIAL_MAP_DIFFUSE, world_tex);
}

void player_look(float x, float y)
{
  look.x += x; 
  look.y += y; 

  float pitch_clamp = PI/2-.0001;
  if (look.y < -pitch_clamp) look.y = -pitch_clamp;
  if (look.y > pitch_clamp) look.y = pitch_clamp;
}

void first_person_controller()
{
  float speed = .5;

  // compute forward look direction
  float r = cos(look.y);
  forward.x = -r*cos(look.x-PI/2);
  forward.y = -sin(look.y);
  forward.z = -r*sin(look.x-PI/2);
  
  //forward = Vector3Normalize(forward);

  Vector3 right = {0, 0, 0};
  // compute orthogonal complement to forward
  right.x = cos(look.x);
  right.y = 0;
  right.z = sin(look.x);

  //right = Vector3Normalize(right);

  Vector2 walkForward = {forward.x, forward.z};
  walkForward = Vector2Normalize(walkForward);

  if (IsKeyDown(KEY_W))
    player_move(speed*walkForward.x, speed*walkForward.y);
  if (IsKeyDown(KEY_S))
    player_move(speed*-walkForward.x, speed*-walkForward.y);
  if (IsKeyDown(KEY_A))
    player_move(speed*right.x, speed*right.z);
  if (IsKeyDown(KEY_D))
    player_move(speed*-right.x, speed*-right.z);

  float look_speed = .001;

  Vector2 look_input = {0, 0};
  Vector2 md = GetMouseDelta();

  // support mouse look
  if (mouse_ready)
  { 
    look_input.x += md.x;
    look_input.y += md.y;
  }

  // support ijkl look
  float ijkl_look_speed = 25;
  look_input.x += ijkl_look_speed * (((int)IsKeyDown(KEY_L)) - ((int)IsKeyDown(KEY_J)));
  look_input.y += ijkl_look_speed * (((int)IsKeyDown(KEY_K)) - ((int)IsKeyDown(KEY_I)));

  player_look(look_speed*look_input.x, look_speed*look_input.y);

  camera.target.x = camera.position.x + forward.x;
  camera.target.y = camera.position.y + forward.y;
  camera.target.z = camera.position.z + forward.z;

  // mouse is ready on the frame after the first md != <0,0>
  if (md.x != 0 | md.y != 0)
    mouse_ready = true;

  player_jump();
}

bool draw_pause_menu()
{
  Color transGray = BLACK; transGray.a = 150;
  DrawRectangle(0, 0, GetScreenWidth(), GetScreenHeight(), transGray);

  int y = GetScreenHeight()/2-120;
  DrawText("PAUSED", 100, 10+y, 60, WHITE); y += 120;
  DrawText("ESC: RESUME", 100, 10+y, 60, WHITE); y += 60;
  DrawText("X: EXIT",   100, 10+y, 60, WHITE); y += 60;

  return IsKeyPressed(KEY_X);
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

  SetTargetFPS(60);
  DisableCursor();

  while (!WindowShouldClose())
  {
    if (IsKeyPressed(KEY_ESCAPE)) { 
      paused = !paused;
      if (paused) 
        EnableCursor();
      else 
        DisableCursor();
    }

    BeginDrawing();
    ClearBackground(RAYWHITE);
    BeginMode3D(camera);

    // Draw cube
    for (int x=-10; x<11; x++)
      for (int z=-10; z<11; z++)
      {
        Vector3 position = {10*x, 0, 10*z};
        Color color = {200, 40, 40, 255};
        DrawCube(position, 3, 1, 3, color); 
      }

    if (!paused) {
      first_person_controller();
    }

    EndMode3D();

    // draws pause menu, and possibly breaks out of program
    if (paused && draw_pause_menu()) break;

    EndDrawing();
  }

  CloseWindow();
  CloseAudioDevice();

  return 0;
}
