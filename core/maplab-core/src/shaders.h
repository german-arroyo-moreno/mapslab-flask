//LIC

#ifndef SHADERS_H
#define SHADERS_H

#include <string>
#include <GL/glew.h>
#include <iostream>
#include <string>
#include <vector>
#include <fstream>
#include <sstream>

using namespace std;

//HEA

class _shaders
{
public:


  GLuint load_shaders(string File_vertex_shader, string File_fragment_shader, string File_geometry_shader=string());
  GLuint load_shaders(const GLchar **Vertex_shader_source,const GLchar **Fragment_shader_source);

protected:
  bool read_file(string File_name,string &Code);
  void show_error(GLint Shader);
};

#endif // SHADERS_H
