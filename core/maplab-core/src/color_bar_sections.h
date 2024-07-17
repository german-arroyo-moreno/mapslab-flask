//LIC

#ifndef COLOR_BAR_SECTIONS_H
#define COLOR_BAR_SECTIONS_H

#include "color_bar_abstract.h"
 
class _window;

class _color_bar_sections : public _color_bar_abstract
{
public:
  _color_bar_sections(_palette_data_ns::_color_type Color_type1,int Num_steps1,std::vector<float> &Vec_values1, std::vector<_qcolor> &Vec_colors1,_window *Window1=nullptr);

private:
  void compute_tones();
};


#endif
