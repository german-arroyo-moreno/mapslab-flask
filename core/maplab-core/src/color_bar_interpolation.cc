//LIC

#include "color_bar_interpolation.h"

using namespace _color_bar_abstract_ns;
using namespace std;

//HEA

_color_bar_interpolation::_color_bar_interpolation(_palette_data_ns::_color_type Color_type1, int Num_steps1, std::vector<float> &Vec_values1, vector<_qcolor> &Vec_colors1, _window *Window1):
_color_bar_abstract(Color_type1,Num_steps1, Vec_values1,Vec_colors1,Window1)
{ 
  Data_type=_palette_data_ns::_data_type::DATA_TYPE_CONTINUOUS;

//  Vec_rect.resize(Num_steps);
  Vec_translations.resize(Num_steps);
  Vec_proportions.resize(Num_steps);

  End_color=Vec_colors1[Vec_colors1.size()-1];

  // compute the proportions
  for (int i=0;i<Num_steps; ++i) {
    Vec_proportions[i]=Vec_values1[i];
  }

}

//HEA

void _color_bar_interpolation::compute_tones()
{
  if (End_color!=_qcolor(0,0,0)){
    float t;
    _qcolor Color=End_color;
    Color.toHsv();
    float Hue=Color.hue();

    Vec_colors.resize(Vec_values.size());

    for (unsigned int i=0;i<Vec_colors.size();i++) {
      t=float(i)/float(Vec_colors.size()-1);
      Color.setHsv(Hue,int(t*255.0),255);
      Vec_colors[i]=Color.toRgb();
    }
  }
  else{
    // Black color
    _qcolor Color;
    float t;
    Vec_colors.resize(Vec_values.size());

    for (unsigned int i=0;i<Vec_colors.size();i++) {
      t=float(i)/float(Vec_colors.size()-1);
      Color.setHsv(0,0,(1.0f-t)*255);
      Vec_colors[i]=Color.toRgb();
    }
  }
}

