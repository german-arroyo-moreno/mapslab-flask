//LIC

#ifndef PALETTE_DATA_H
#define PALETTE_DATA_H

#include <string>
#include <vector>

#include "qcolor.h"
#include "color_map.h"

namespace _palette_data_ns {
  const std::vector<std::string> Vec_names_data_type_print={"Integer","Float","Scientific","Per cent"};
  enum class _data_type_print: unsigned char {DATA_TYPE_PRINT_INT,DATA_TYPE_PRINT_FLOAT,DATA_TYPE_PRINT_SCIENTIFIC,DATA_TYPE_PRINT_PERCENT};

  enum class _data_type: unsigned char {DATA_TYPE_DISCRETE,DATA_TYPE_CONTINUOUS};
  enum class _color_type: unsigned char {COLOR_TYPE_TONE,COLOR_TYPE_COLOR};

  struct _palette_data_aux{
    std::string Name;
    _data_type Data_type;
    _color_type Color_type;
    int Num_steps;
  };

  const std::vector<_palette_data_aux> Vec_palette_data_aux={
    {"Discrete_tone_2_interval",_data_type::DATA_TYPE_DISCRETE,_color_type::COLOR_TYPE_TONE,3},
    {"Discrete_tone_3_interval",_data_type::DATA_TYPE_DISCRETE,_color_type::COLOR_TYPE_TONE,4},
    {"Discrete_tone_4_interval",_data_type::DATA_TYPE_DISCRETE,_color_type::COLOR_TYPE_TONE,5},
    {"Discrete_tone_5_interval",_data_type::DATA_TYPE_DISCRETE,_color_type::COLOR_TYPE_TONE,6},
    {"Discrete_color_2_interval",_data_type::DATA_TYPE_DISCRETE,_color_type::COLOR_TYPE_COLOR,3},
    {"Discrete_color_3_interval",_data_type::DATA_TYPE_DISCRETE,_color_type::COLOR_TYPE_COLOR,4},
    {"Discrete_color_4_interval",_data_type::DATA_TYPE_DISCRETE,_color_type::COLOR_TYPE_COLOR,5},
    {"Discrete_color_5_interval",_data_type::DATA_TYPE_DISCRETE,_color_type::COLOR_TYPE_COLOR,6},
    {"Continuous_color_1_interval",_data_type::DATA_TYPE_CONTINUOUS,_color_type::COLOR_TYPE_COLOR,2},
    {"Continuous_color_2_interval",_data_type::DATA_TYPE_CONTINUOUS,_color_type::COLOR_TYPE_COLOR,3},
    {"Continuous_color_3_interval",_data_type::DATA_TYPE_CONTINUOUS,_color_type::COLOR_TYPE_COLOR,4},
    {"Continuous_color_4_interval",_data_type::DATA_TYPE_CONTINUOUS,_color_type::COLOR_TYPE_COLOR,5},
    {"Continuous_color_5_interval",_data_type::DATA_TYPE_CONTINUOUS,_color_type::COLOR_TYPE_COLOR,6},
    {"Continuous_tone_2_interval",_data_type::DATA_TYPE_CONTINUOUS,_color_type::COLOR_TYPE_TONE,3},
    {"Continuous_tone_3_interval",_data_type::DATA_TYPE_CONTINUOUS,_color_type::COLOR_TYPE_TONE,4},
    {"Continuous_tone_4_interval",_data_type::DATA_TYPE_CONTINUOUS,_color_type::COLOR_TYPE_TONE,5},
    {"Continuous_tone_5_interval",_data_type::DATA_TYPE_CONTINUOUS,_color_type::COLOR_TYPE_TONE,6},
  };
}

//HEA

class _palette_data
{
public:

  _palette_data(){};

  _palette_data(std::string Name1,_palette_data_ns::_data_type Data_type1,_palette_data_ns::_color_type Color_type1,int Num_steps1,_qcolor Color1);

  _palette_data(const _palette_data &Palette_data1);

  _palette_data &operator=(const _palette_data &Palette_data1);

  void update_values();

  void name(std::string Name1){Name=Name1;}
  std::string name(){return Name;}

  void color_type(_palette_data_ns::_color_type Color_type1);
  _palette_data_ns::_color_type color_type(){return Color_type;}

  void data_type(_palette_data_ns::_data_type Data_type1);
  _palette_data_ns::_data_type data_type(){return Data_type;};

  void num_steps(int Num_steps1);
  int num_steps(){return Num_steps;}

  void color(_qcolor Color1);
  _qcolor color(){return Color;}

  void update();

  std::vector<float> &vec_values(){return Color_map.Vec_values;}
  std::vector<_qcolor> &vec_colors(){return Color_map.Vec_colors;}

protected:
  std::string Name="";
  _palette_data_ns::_data_type Data_type;
  _palette_data_ns::_color_type Color_type; // tone or color  
  int Num_steps=0;
  _qcolor Color;
  _color_map Color_map;
};

#endif


