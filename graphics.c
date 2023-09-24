
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
