//LIC

#ifndef COLOR_BAR_INTEPOLATION_H
#define COLOR_BAR_INTEPOLATION_H

#include "color_bar_abstract.h"

class _window;
 
class _color_bar_interpolation : public _color_bar_abstract
{

public:
  _color_bar_interpolation(_palette_data_ns::_color_type Color_type1,int Num_steps1, std::vector<float> &Vec_values1, std::vector<_qcolor> &Vec_colors1,_window *Window1=nullptr);

  std::vector<_qcolor> create_random_colors();

private:
  void compute_tones();
};


#endif
