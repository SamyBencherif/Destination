Camera camera = { 0 };
Vector2 look = {0., 0.};
bool mouse_ready = false;
#define JUMP_HEIGHT 6
#define JUMP_DURATION .5
float timer_jump = 0;
Vector3 forward = {0, 0, 0}; // player's forward direction

#define SHOW_FLOORPLAN true
#define FP_LINE_SIZE 256
int fp_line_count = 0;
typedef struct Line {
  int x1;
  int z1;
  int x2;
  int z2;
} Line;
Line fp_lines[FP_LINE_SIZE];

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

void player_look(float x, float y)
{
  look.x += x; 
  look.y += y; 

  float pitch_clamp = PI/2-.0001;
  if (look.y < -pitch_clamp) look.y = -pitch_clamp;
  if (look.y > pitch_clamp) look.y = pitch_clamp;
}

void fpc_init()
{
  int box_size = 50;

  fp_lines[fp_line_count].x1 = -box_size; 
  fp_lines[fp_line_count].z1 = -box_size; 
  fp_lines[fp_line_count].x2 = -box_size; 
  fp_lines[fp_line_count].z2 = box_size; 
  fp_line_count++;

  fp_lines[fp_line_count].x1 = -box_size; 
  fp_lines[fp_line_count].z1 = box_size; 
  fp_lines[fp_line_count].x2 = box_size; 
  fp_lines[fp_line_count].z2 = box_size; 
  fp_line_count++;

  fp_lines[fp_line_count].x1 = box_size; 
  fp_lines[fp_line_count].z1 = box_size; 
  fp_lines[fp_line_count].x2 = box_size; 
  fp_lines[fp_line_count].z2 = -box_size; 
  fp_line_count++;

  fp_lines[fp_line_count].x1 = box_size; 
  fp_lines[fp_line_count].z1 = -box_size; 
  fp_lines[fp_line_count].x2 = -box_size; 
  fp_lines[fp_line_count].z2 = -box_size; 
  fp_line_count++;
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
