//LIC

#ifndef LAYER_MAP_H
#define LAYER_MAP_H

#include <string>
#include <vector>

#include <GL/gl.h>

#include "layer.h"

#include "qcolor.h"



#define DEFINED_LAYER_MAP

namespace _layer_map_ns
{
  const std::vector<std::string> Vec_names_interpolation_type={"Minimal distance","Triangulation"};
  enum class _map_interpolation_type:unsigned char {MAP_INTERPOLATION_TYPE_MINIMUM_DISTANCE,MAP_INTERPOLATION_TYPE_TRIANGULATION};

  enum class _sampling_location:unsigned char {SAMPLING_LOCATION_CORNERS,SAMPLING_LOCATION_CENTERS};

  enum class _position_interpolation_type:unsigned char {POSITION_INTERPOLATION_TYPE_HOMOGENEOUS,POSITION_INTERPOLATION_TYPE_HETEROGENEOUS};

  const _sampling_location SAMPLING_LOCATION=_sampling_location::SAMPLING_LOCATION_CENTERS;

  const _map_interpolation_type MAP_INTERPOLATION_TYPE_DEFAULT=_map_interpolation_type::MAP_INTERPOLATION_TYPE_MINIMUM_DISTANCE;

  struct _data{
    float x;
    float y;
    float Value;
  };
}

class _window;

//HEA

class _layer_map: public _layer
{
public:
  _layer_map();
  ~_layer_map();

  void reset_data();

  void size(int Widht1,int Height1){Width=Widht1;Height=Height1;}

  void add_input_data(std::vector<float> &Vec_coordinate_x1,std::vector<float> &Vec_coordinate_y1,std::vector<float> &Vec_value1);

//  void data_type(_palette_data_ns::_data_type Data_type1){Data_type=Data_type1;}
//  _palette_data_ns::_data_type data_type(){return Data_type;}

  void set_colormap(std::vector<float> &Vec_proportions,std::vector<_qcolor> &Vec_colors1,int Type);

  void apply_colormap();

  void apply_color_mixing();

  float get_value(int Col,int Row);

  _qcolor end_color(){return End_color;}

protected:
  _window *Window=nullptr;

  int Width=0;
  int Height=0;

  int Width_data;
  int Height_data;

  _qcolor End_color;

  std::shared_ptr<cv::Mat> Input_color_image=nullptr;

  GLuint Program0;
  GLuint VAO1;

  GLuint Tex_input_image_normalized=-1;
  GLuint Tex_image_result=-1;
  GLuint Element_data=-1;
  GLuint Colors=-1;

  GLuint VBO_vertices=-1;
  GLuint VBO_vertices_colors=-1;

  bool Created_buffers=false;

  std::shared_ptr<cv::Mat> Color_table=nullptr;

  int Color_map=0;
  bool Computed=false;

  int Num_vertices=-1;

  std::vector<_layer_map_ns::_data> Vec_element_data;
  std::vector<cv::Vec4f> Vec_color;

//  _palette_data_ns::_data_type Data_type;

  bool Colormap_changed=true;
};

#endif
