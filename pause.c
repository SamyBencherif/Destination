bool paused = false;

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

void pause_update()
{
  if (IsKeyPressed(KEY_ESCAPE)) { 
    paused = !paused;
    if (paused) 
      EnableCursor();
    else 
      DisableCursor();
  }
}
