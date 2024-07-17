//LIC

#ifndef COLOR_BAR_ABSTRACT_H
#define COLOR_BAR_ABSTRACT_H

#include <iostream>
#include <vector>
#include <random>

#include "palette_data.h"

class _window;

namespace _color_bar_abstract_ns {
  const int CELL_WIDTH=10;
  const int OFFSET=50;

  const int MIN_NUM_CELLS_WIDTH=6;
  const int FONT_SIZE=14;

  const int HORIZONTAL_SPACE=5;
  const int TEXT_SPACE=2;

  const bool CHANGEABLE_DEFAULT=true;

  const float INITIAL_HUE=112;
}

//HEA
 
class _color_bar_abstract
{
public:
  _color_bar_abstract(_palette_data_ns::_color_type Color_type1,int Num_steps1,std::vector<float> &Vec_values1, std::vector<_qcolor> &Vec_colors1,_window *Window1=nullptr);
  ~_color_bar_abstract() {}

  void set_data_values(float Start_value1,float End_value1){Start_value=Start_value1;End_value=End_value1;}

  void data_type_print(_palette_data_ns::_data_type_print Data_type_print1){Data_type_print=Data_type_print1;}
  _palette_data_ns::_data_type_print data_type_print(){return Data_type_print;}

  void changeable(bool Changeable1){Changeable=Changeable1;}
  bool changeable(){return Changeable;}

  std::vector<float> &vec_proportions(){return Vec_proportions;}
  std::vector<_qcolor> &vec_colors(){return Vec_colors;}

  std::vector<float> &values(){return Vec_original_values;}
  std::vector<_qcolor> &colors(){return Vec_original_colors;}

  int num_steps(){return  Num_steps;}

  void type(_palette_data_ns::_data_type Data_type1){Data_type=Data_type1;}
  _palette_data_ns::_data_type type(){return Data_type;}

  _palette_data_ns::_color_type color_type(){return Color_type;}

  void show_data(bool Show_data1){Show_data=Show_data1;}

  _qcolor compute_new_tone(float Value, _qcolor Color1);
  _qcolor compute_new_color();


//signals:
//  void colorChanged(std::vector<float> &,std::vector<_qcolor> &,int);


//protected:
//  void paintCell(QPainter *Painter, int Pos,const QRect& Rect);
//  void draw_text_int(QPainter &Painter);
//  void draw_text_float(QPainter &Painter);
//  void draw_text_scientific(QPainter &Painter);
//  void draw_text_percent(QPainter &Painter);

protected:
  _qcolor Start_color;
  _qcolor End_color;

  std::vector<float> Vec_original_values;
  std::vector<_qcolor> Vec_original_colors;

  std::vector<float> Vec_values;
  std::vector<_qcolor> Vec_colors;

  float Min_value=0;
  float Max_value=1;

  std::vector<float> Vec_data;

//  std::vector<QRect> Vec_rect;
  std::vector<int> Vec_translations;
  std::vector<float> Vec_proportions;

//  QRect Rect_bar;

  float Start_value=0;
  float End_value=0;

  int Pos_selected=0;
  bool Color_selected=false;
//  QRect Color_selected_rect;

  int Widget_height=0;
  int Widget_width=0;

  _palette_data_ns::_data_type_print Data_type_print;
  int VSpace=0;

  _palette_data_ns::_data_type Data_type;
  _palette_data_ns::_color_type Color_type;
  int Num_steps=0;

  bool Changeable;
  bool Show_data;


  int Cell_width=0;

  _window *Window=nullptr;

  int Font_size=0;
  int Font_pixels_width=0;
  int Font_pixels_height=0;
};


#endif
