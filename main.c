#include "raylib.h"

int main(void)
{
  const int width = GetScreenWidth();
  const int height = GetScreenHeight();

  InitWindow(width, height, "game");
  SetWindowState(FLAG_FULLSCREEN_MODE);

  SetTargetFPS(60);
  while (!WindowShouldClose())
  {
    BeginDrawing();
    ClearBackground(RAYWHITE);
    EndDrawing();
  }

  CloseWindow();

  return 0;
}
