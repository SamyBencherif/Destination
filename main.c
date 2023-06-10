#include "raylib.h"

int main(void)
{
  const int screenWidth = 500;
  const int screenHeight = 500;

  InitWindow(screenWidth, screenHeight, "game");

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
