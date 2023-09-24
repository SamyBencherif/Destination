bool paused = false;
int pause_selection = 0;

void pause_set()
{
  EnableCursor();
  int pause_selection = 0;
}

void pause_unset()
{
  DisableCursor();
}

void pause_toggle()
{
  if (paused) 
  {
    paused = false;
    pause_unset();
  }
  else 
  {
    paused = true;
    pause_set();
  }
}

void draw_pause_menu()
{
  Color transGray = BLACK; transGray.a = 150;
  Color HIGHLIGHT = WHITE; HIGHLIGHT.a = 100;

  DrawRectangle(0, 0, GetScreenWidth(), GetScreenHeight(), transGray);

  int y = GetScreenHeight()/2-120;
  DrawText("PAUSED", 100, 10+y, 60, WHITE); y += 120;

  int selection_root = 10+y;
  int selection_height = 60;

  // use mouse to update pause_selection if it moves
  if (GetMouseDelta().x || GetMouseDelta().y)
    pause_selection = (GetMouseY() - selection_root)/selection_height;
  else if (IsKeyPressed(KEY_DOWN))
    pause_selection++;
  else if (IsKeyPressed(KEY_UP))
    pause_selection--;

  if (pause_selection < 0) pause_selection = -1;
  if (pause_selection > 1) pause_selection = -1;

  if (pause_selection != -1)
    DrawRectangle(
      95, selection_root+selection_height*pause_selection, 
      600, selection_height, 
      HIGHLIGHT
    );

  bool trigger_selection = IsMouseButtonPressed(0) || IsKeyPressed(KEY_ENTER) || IsKeyPressed(KEY_SPACE);

  DrawText("RESUME", 100, 10+y, 60, WHITE); y += 60;
  if (trigger_selection && pause_selection == 0)
  {
    pause_toggle();
  }

  DrawText("EXIT",   100, 10+y, 60, WHITE); y += 60;
  if (trigger_selection && pause_selection == 1)
  {
    exit(EXIT_SUCCESS);
  }
}
