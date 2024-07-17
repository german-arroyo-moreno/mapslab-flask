//LIC

#include "color_bar_abstract.h"
//#include "window.h"

using namespace _color_bar_abstract_ns;
using namespace std;

//HEA

_color_bar_abstract::_color_bar_abstract(_palette_data_ns::_color_type Color_type1, int Num_steps1, std::vector<float> &Vec_values1, vector<_qcolor> &Vec_colors1, _window *Window1):
Window(Window1)
{

  if (Num_steps1>=2){
//    Cell_width=CELL_WIDTH*Window->screen_height()/1080;
//    if (Cell_width%2!=0) Cell_width++;

    Num_steps=Num_steps1;
    Color_type=Color_type1;

    Vec_original_values=Vec_values1;
    Vec_original_colors=Vec_colors1;

    Vec_values=Vec_values1;
    Vec_colors=Vec_colors1;

    Changeable=CHANGEABLE_DEFAULT;
  }
  else{
    cout << "Error: the number of steps must greater or equal to 2" << endl;
    exit(-1);
  }
}
