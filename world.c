
void world()
{
  float t = game_time;
  // Draw cube series
  //for (int x=-10; x<11; x++)
  //  for (int z=-10; z<11; z++)
  //  {
  //    float displacement = (1+(abs(x))*(abs(z))/10);
  //    displacement *= (.5+.5*cos(x/10.+z/10.+6*t));
  //    Vector3 position = {10*x, displacement/2, 10*z};
  //    Color color = {200, 40+5*x, 40*z, 255};
  //    DrawCube(position, 3, 1+displacement, 3, color); 
  //  }

  if (SHOW_FLOORPLAN)
  {
    for (int i=0; i<fp_line_count; i++)
    {
      Vector3 start = {0, 0, 0};
      Vector3 end = {0, 0, 0};
      start.x = fp_lines[i].x1;
      start.z = fp_lines[i].z1;
      end.x = fp_lines[i].x2;
      end.z = fp_lines[i].z2;
      DrawThickLine3D(start, end, .3, BLACK);
    }
  }
}
