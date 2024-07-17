//LIC

#include "palette_data.h"

using namespace _palette_data_ns;

//HEA

_palette_data::_palette_data(const _palette_data &Palette_data1):
Name(Palette_data1.Name),Data_type(Palette_data1.Data_type),Color_type(Palette_data1.Color_type),Num_steps(Palette_data1.Num_steps),Color(Palette_data1.Color),Color_map(Palette_data1.Color_map)
{
}

//HEA

_palette_data &_palette_data::operator=(const _palette_data &Palette_data1)
{
  Name=Palette_data1.Name;
  Data_type=Palette_data1.Data_type;
  Color_type=Palette_data1.Color_type;
  Num_steps=Palette_data1.Num_steps;
  Color=Palette_data1.Color;
  Color_map=Palette_data1.Color_map;

  return *this;
}


//HEA

_palette_data::_palette_data(string Name1, _data_type Data_type1, _color_type Color_type1, int Num_steps1, _qcolor Color1):
Name(Name1),Data_type(Data_type1),Color_type(Color_type1),Num_steps(Num_steps1),Color(Color1)
{
  Color_map.compute_regular_values(Num_steps);

  update();
}

//HEA

//void _palette_data::update_values()
//{
//  Color_map.compute_regular_values(Num_steps);

//  update();
//}

//HEA

void _palette_data::update()
{
  if (Data_type==_palette_data_ns::_data_type::DATA_TYPE_DISCRETE){
    if (Color_type==_palette_data_ns::_color_type::COLOR_TYPE_TONE){
      Color_map.compute_tones_sections(Color);
    }
    else{
      Color_map.compute_colors_sections(Color);
    }
  }
  else{
    if (Color_type==_palette_data_ns::_color_type::COLOR_TYPE_TONE){
      Color_map.compute_tones_interpolations(Color);
    }
    else{
      Color_map.compute_colors_interpolations(Color);
    }
  }
}


//HEA

void _palette_data::color_type(_palette_data_ns::_color_type Color_type1)
{
  Color_type=Color_type1;

  update();
}

//HEA

void _palette_data::data_type(_palette_data_ns::_data_type Data_type1)
{
  Data_type=Data_type1;
  update();
}

//HEA

void _palette_data::num_steps(int Num_steps1)
{
  Num_steps=Num_steps1;
  Color_map.compute_regular_values(Num_steps);
  update();
}

//HEA

void _palette_data::color(_qcolor Color1)
{
  Color=Color1;
  update();
}
