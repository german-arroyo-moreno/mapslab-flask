//LIC

#include "layer_data.h"

//HEA

_layer_data::_layer_data(std::string Name1,unsigned int Pos_texture1)
{
  Button_visibility=nullptr;
  Button_writability=nullptr;
  Visibility=true;
  Writability=true;
  Transparence=0;
//  Palette=0;
  Name=Name1;
  Pos_texture=Pos_texture1;
}
