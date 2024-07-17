//LIC

#ifndef LAYER_MAP_DISTANCE_H
#define LAYER_MAP_DISTANCE_H

#include <GL/glew.h>
#include <opencv.hpp>
#include <string>

#include "layer.h"
#include "shaders.h"

#include "common.h"
#include "layer_map.h"

#define DEFINED_LAYER_MAP_DISTANCE

namespace _layer_map_distance_ns
{
  // parameter 1
  const std::string String_group_box_parameter1("Transparence");
  const std::string String_label_parameter1_min("0");
  const std::string String_label_parameter1_max("1");
  const std::string String_label_parameter1_tooltip("Display the value of the transparence");
  const int Parameter1_min_value=0;
  const int Parameter1_max_value=255;
  const int Parameter1_single_step=1;
  const int Parameter1_page_step=1;
  const int Parameter1_tick_interval=25;
  const bool Parameter1_set_tracking=false;
  const std::string String_parameter1_tooltip("Controls the value of the transparence");

  // parameter 2
  const std::string String_group_box_parameter2("Color mixing");

  const std::string String_label_parameter2_title("Min threshold");
  const std::string String_label_parameter2_min("0");
  const std::string String_label_parameter2_max("1");
  const std::string String_label_parameter2_tooltip("Display the value of the transparence");
  const int Parameter2_min_value=0;
  const int Parameter2_max_value=255;
  const int Parameter2_single_step=1;
  const int Parameter2_page_step=1;
  const int Parameter2_tick_interval=25;
  const bool Parameter2_set_tracking=false;
  const std::string String_parameter2_tooltip("Controls the value of the transparence");

  // parameter 3
  const std::string String_label_parameter3_title("Max threshold");
  const std::string String_label_parameter3_min("0");
  const std::string String_label_parameter3_max("1");
  const std::string String_label_parameter3_tooltip("Display the value of the transparence");
  const int Parameter3_min_value=0;
  const int Parameter3_max_value=255;
  const int Parameter3_single_step=1;
  const int Parameter3_page_step=1;
  const int Parameter3_tick_interval=25;
  const bool Parameter3_set_tracking=false;
  const std::string String_parameter3_tooltip("Controls the value of the transparence");

  // parameter 4
  const std::string String_group_box_parameter4("Data type print");

  const std::string BOX_TEXT="Basic parameters";

  const vector<std::string> COLOR_MAPS={"Red","Green","Blue","Autum","Bone","Jet","Winter","Rainbow","Ocean","Summer","Spring","cool","Hsv","Pink","Hot"};

  const vector<string> Vec_name_probe={"1x1","3x3","5x5","7x7","9x9","11x11","13x13","15x15","25x25","49x49"};
  const vector<int> Vec_value_probe={0,1,2,3,4,5,6,7,12,24}; //half the width (+1)

  const int PROBE_DEFAULT=1; // 3x3

  const std::vector<string> Vec_names_position_interpolation_type={"Homogeneous","Heterogeneous"};
  enum class _position_normalization_type:unsigned char {POSITION_NORMALIZATION_HOMOGENEOUS,POSITION_NORMALIZATION_HETEROGENEOUS};

  const _position_normalization_type NORMALIZATION_TYPE_DEFAULT=_position_normalization_type::POSITION_NORMALIZATION_HOMOGENEOUS;
}

class _window;
class _qtw_layer_map_distance;

//HEA

class _layer_map_distance: public _layer_map
{
public:
  _layer_map_distance();
  ~_layer_map_distance();

  void probe(int Probe1){Probe=Probe1;}
  void color_model(_common_ns::_color_model Color_model1){Color_model=Color_model1;}
  void use_colors(vector<bool> Use_colors1){Use_colors=Use_colors1;}
  void use_positions(vector<bool> Use_positions1){Use_positions=Use_positions1;}
  void normalization(bool Normalization1){Normalization=Normalization1;}
  void position_normalization_type(_layer_map_distance_ns::_position_normalization_type Position_normalization_type1){Position_normalization_type=Position_normalization_type1;}

  void create_buffers();
  void update_map();
  void update();

  float get_value(int Col,int Row);

//  void data_type_print(_palette_data_ns::_data_type_print Data_type_print1){Data_type_print=Data_type_print1;}
//  _palette_data_ns::_data_type_print data_type_print(){return Data_type_print;}

  void show(){};
  void hide(){};
  void *get_link(){};
  void enable(){};
  void disable(){};

protected:
  _common_ns::_color_model Color_model=_common_ns::COLOR_MODEL_DEFAULT;
  vector<bool> Use_colors={true,true,true};
  vector<bool> Use_positions={true,true};  
  bool Normalization=true;
  _layer_map_distance_ns::_position_normalization_type Position_normalization_type=_layer_map_distance_ns::NORMALIZATION_TYPE_DEFAULT;
  int Probe=0;
//  _palette_data_ns::_data_type_print Data_type_print;
};

#endif
