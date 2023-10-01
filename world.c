
Model world_model;
Texture2D world_tex;

void world_init()
{
  world_model = LoadModel("resources/worlds/demo_w001_stairs.obj");
  world_tex = LoadTexture("resources/worlds/std_texture.001.png");

  // I use only a single material and texture
  SetMaterialTexture(world_model.materials, MATERIAL_MAP_DIFFUSE, world_tex);
}

void scene_discotech()
{
  float t = game_time;
  // Draw cube series
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

void scene_model()
{
  // Draw world model with baked lightmap
  float scale = 1;
  Color tint = WHITE;
  Vector3 world_pos = {0, 0, 0};

  if (IsModelReady(world_model) && IsTextureReady(world_tex))
    DrawModel(world_model, world_pos, scale, tint);
  else
    DrawCube(world_pos, 3, 3, 3, RED);
}

void world()
{
  //scene_discotech()
  scene_model();

  if (SHOW_FLOORPLAN && fp_line_count)
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

    // show line selection
    int nearest_index = 0;
    Vector3 nearest_vector = nearest(camera.target, fp_lines[0]);
    float nearest_t = nearest_vector.y;
    for (int i=1; i<fp_line_count; i++)
    {
  
      Vector3 n = nearest(camera.target, fp_lines[i]);
      float t = n.y;
      n.y = 0;

      if (
        Vector3Length(Vector3Subtract(camera.target, n))
        <
        Vector3Length(Vector3Subtract(camera.target, nearest_vector))
      )
      { 
        nearest_vector = n;
        nearest_index = i;
        nearest_t = t;
      }
    }
    if (0 <= nearest_t && nearest_t <= 1)
      DrawSphere(nearest_vector, .5, YELLOW); 

  }
}
