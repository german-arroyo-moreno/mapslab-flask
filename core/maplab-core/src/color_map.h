//LIC

#ifndef COLOR_MAP
#define COLOR_MAP

#include <vector>
#include <string>
#include <random>

#include "qcolor.h"

namespace _color_map_ns {
// enum class _null_element_color:unsigned char{NULL_ELEMENT_COLOR_WHITE,NULL_ELEMENT_COLOR_BLACK};
// const _null_element_color NULL_ELEMENT_COLOR_DEFAULT=_null_element_color::NULL_ELEMENT_COLOR_BLACK;

 const std::vector<std::string> Vec_names_zero_value_color={"Black","White"};
 enum class _zero_value_color: unsigned char {ZERO_VALUE_COLOR_BLACK,ZERO_VALUE_COLOR_WHITE};

}


//HEA
// This class computes the colors depending on the values. The values must be between 0 and 1
// There is the possibility of assign black or white color to the 0 value
// It is possible to use tones (a single color) or colors
// It is more normal to use tones and section, and colors and interpolation

class _color_map
{
public:

  _color_map(){}

//  _color_map(_color_map &Color_map1);

//  _color_map &operator=(_color_map &Color_map1);
  void zero_value_color(_color_map_ns::_zero_value_color Zero_value_color1){Zero_value_color=Zero_value_color1;}

  void compute_regular_values(int Num_values1);
  void compute_tones_sections(_qcolor Color1);
  void compute_tones_interpolations(_qcolor Color1);
  void compute_colors_sections(_qcolor Color1);
  void compute_colors_interpolations(_qcolor Color1);

  void compute_tones_sections(int Num_values,std::vector<_qcolor> &Vec_colors1,_qcolor Color1);
  void compute_tones_interpolations(int Num_values,std::vector<_qcolor> &Vec_colors1,_qcolor Color1);
  void compute_colors_sections(int Num_values,std::vector<_qcolor> &Vec_colors1,_qcolor Color1);
  void compute_colors_interpolations(int Num_values,std::vector<_qcolor> &Vec_colors1,_qcolor Color1);

  std::vector<float> Vec_values;
  std::vector<_qcolor> Vec_colors;

private:
  _qcolor Color=_qcolor(0,0,0);
  int Num_values;
  _color_map_ns::_zero_value_color Zero_value_color;
};

#endif


