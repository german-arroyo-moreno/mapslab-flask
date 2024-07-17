//LIC

#include "color_map.h"
//#include "window.h"

using namespace std;

//HEA

void _color_map::compute_regular_values(int Num_values1)
{
  Num_values=Num_values1;

  Vec_values.resize(Num_values);
  for (int i=0;i<Num_values;i++) {
    Vec_values[i]=float(i)/float(Num_values-1);
  }
}

//HEA

void _color_map::compute_tones_sections(_qcolor Color1)
{
  compute_tones_sections(Num_values,Vec_colors,Color1);
}

//HEA

void _color_map::compute_tones_interpolations(_qcolor Color1)
{
  compute_tones_interpolations(Num_values,Vec_colors,Color1);
}

//HEA

void _color_map::compute_colors_sections(_qcolor Color1)
{
  compute_colors_sections(Num_values,Vec_colors,Color1);
}

//HEA

void _color_map::compute_colors_interpolations(_qcolor Color1)
{
  compute_colors_interpolations(Num_values,Vec_colors,Color1);
}


//HEA
// use a single color that is applied to different sections
// for example, if there are 2 interval, 3 positions are computed
// 0 -> white or black
// 1 -> Red
// 2 -> Red

void _color_map::compute_tones_sections(int Num_values, std::vector<_qcolor> &Vec_colors1, _qcolor Color1)
{
  assert(Num_values>2);

  float t;
  _qcolor Color;
  float Hue=Color1.toHsv().hue();

  Vec_colors1.resize(Num_values);
  if (Hue>=0){
    for (unsigned int i=0;i<Vec_colors1.size()-1;i++) {
      t=float(i)/float(Vec_colors1.size()-2);
      if  (Zero_value_color==_color_map_ns::_zero_value_color::ZERO_VALUE_COLOR_WHITE){
        Color.setHsv(Hue,int(t*255.0),255);
      }
      else{
        Color.setHsv(Hue,255,int(t*255.0));
      }
      Vec_colors1[i]=Color.toRgb();
    }
  }
  else{ //black
    for (unsigned int i=0;i<Vec_colors1.size()-1;i++) {
      t=float(i)/float(Vec_colors1.size()-2);
      Color.setHsv(0,0,int((1-t)*255.0f));
      Vec_colors1[i]=Color.toRgb();
    }
  }
  // the last color is reapeated
  Vec_colors1[Vec_colors1.size()-1]=Color;
}

//HEA
// use a single color that is interpolated -> it is like a continous interpolation but the colors are tones of one single color
// for example, if there are 2 interval, 3 positions are computed
// 0 -> white or black
// 1 -> 1/2 Red
// 2 -> Red


void _color_map::compute_tones_interpolations(int Num_values, std::vector<_qcolor> &Vec_colors1, _qcolor Color1)
{
  assert(Num_values>1);

  float t;
  float Hue=Color1.toHsv().hue();
  _qcolor Color;

  Vec_colors1.resize(Num_values);
  if (Hue>=0){
    for (unsigned int i=0;i<Vec_colors1.size();i++) {
      t=float(i)/float(Vec_colors1.size()-1);
      if  (Zero_value_color==_color_map_ns::_zero_value_color::ZERO_VALUE_COLOR_WHITE){
        Color.setHsv(Hue,int(t*255.0),255);
      }
      else{
        Color.setHsv(Hue,255,int(t*255.0));
      }
      Vec_colors1[i]=Color.toRgb();
    }
  }
  else{//black
    for (unsigned int i=0;i<Vec_colors1.size();i++) {
      t=float(i)/float(Vec_colors1.size()-1);
      Color.setHsv(0,0,int((1-t)*255.0f));
      Vec_colors1[i]=Color.toRgb();
    }
  }
}

//HEA
// use a single different colors and use the color in each section
// for example, if there are 2 interval, 3 positions are computed
// 0 -> white or black
// 1 -> random
// 2 -> Color

void _color_map::compute_colors_sections(int Num_values, std::vector<_qcolor> &Vec_colors1, _qcolor Color1)
{
  assert(Num_values>2);

  random_device Random_device;   // non-deterministic generator
  mt19937 Generator(Random_device());  // to seed mersenne twister.
  uniform_int_distribution<> Random(0,359);
  float Hue;//=Color1.toHsv().hue();

//  if (Hue<0)
//  assert(Num_values>2);

//  float t;
  _qcolor Color;

  Vec_colors1.resize(Num_values);

  if  (Zero_value_color==_color_map_ns::_zero_value_color::ZERO_VALUE_COLOR_WHITE){
     Vec_colors1[0]=_qcolor(255,255,255);
  }
  else{
    Vec_colors1[0]=_qcolor(0,0,0);
  }

  for (unsigned int i=1;i<Vec_colors1.size()-2;i++) {
//    t=float(i)/float(Vec_colors1.size()-2);
    Hue=Random(Generator);
    Color.setHsv(Hue,255,255);
    Vec_colors1[i]=Color.toRgb();
  }

  // the last 2 colors are reapeated
  Vec_colors1[Vec_colors1.size()-2]=Color1;
  Vec_colors1[Vec_colors1.size()-1]=Color1;
}

//HEA
// use a single different colors and doing interpolation. The first and last colors are known
// for example, if there are 2 interval, 3 positions are computed
// 0 -> white or black
// 1 -> random
// 2 -> Color

void _color_map::compute_colors_interpolations(int Num_values, std::vector<_qcolor> &Vec_colors1, _qcolor Color1)
{
  assert(Num_values>1);

  random_device Random_device;   // non-deterministic generator
  mt19937 Generator(Random_device());  // to seed mersenne twister.
  uniform_int_distribution<> Random(0,359);
  float Hue;//=Color1.toHsv().hue();

  //if (Hue<0) Hue=Random(Generator);

  Vec_colors1.resize(Num_values);
  if (Zero_value_color==_color_map_ns::_zero_value_color::ZERO_VALUE_COLOR_WHITE){
    Vec_colors1[0]=_qcolor(255,255,255);
  }
  else{
    Vec_colors1[0]=_qcolor(0,0,0);
  }
  for (unsigned int i=1;i<Vec_colors1.size()-1;i++) {
    Hue=Random(Generator);
    Color.setHsv(Hue,255,255);
    Vec_colors1[i]=Color.toRgb();
  }
  Vec_colors1.back()=Color1;
}



