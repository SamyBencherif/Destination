
void world()
{
  float t = game_time;
  // Draw cube
  for (int x=-10; x<11; x++)
    for (int z=-10; z<11; z++)
    {
      float displacement = (1+(abs(x))*(abs(z))/10);
      displacement *= (.5+.5*cos(x/10.+z/10.+6*t));
      Vector3 position = {10*x, displacement/2, 10*z};
      Color color = {200, 40+5*x, 40*z, 255};
      DrawCube(position, 3, 1+displacement, 3, color); 
    }
}
