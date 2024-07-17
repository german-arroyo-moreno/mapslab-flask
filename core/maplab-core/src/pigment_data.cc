//LIC

#include "pigment_data.h"

using namespace std;
using namespace _pigment_data_ns;

//HEA

_pigment_data::_pigment_data(const _pigment_data &Data1)
{
  Data_type=Data1.Data_type;
  Name=Data1.Name;
  Min_value=Data1.Min_value;
  Max_value=Data1.Max_value;
  Max_value_adjusted=Data1.Max_value_adjusted;
  Atomic_number=Data1.Atomic_number;
  Vec_values=Data1.Vec_values;
}


//HEA
// adjust the sample data dividing by the atomic number
// compute the normalized values that are used for computing the distance

//HEA
// adjust the sample data dividing by the atomic number
// compute the normalized values that are used for computing the distance

//void _pigment_data::process()
//{
//  float Max_aux=-1;
//  for (unsigned int i=0;i<Vec_samples.size();i++){
//    if (Vec_samples[i].Value>=0 && Vec_samples[i].Value>Max_aux) Max_aux=Vec_samples[i].Value;
//  }

//  Max_value=Max_aux;
//  Max_value_adjusted=Max_value/Atomic_number;

//  Vec_samples_normalized.resize(Vec_samples.size());

//  for (unsigned int i=0;i<Vec_samples.size();i++){
//    Vec_samples_normalized[i].x=Vec_samples[i].x;
//    Vec_samples_normalized[i].y=Vec_samples[i].y;
//    if (Vec_samples[i].Value>=0) Vec_samples_normalized[i].Value=Vec_samples[i].Value/Max_value;
//    else Vec_samples_normalized[i].Value=-1;
//  }
//}

//HEA

//void _positions_data::normalize_positions()
//{
//  Vec_coordinate_x_normalized.resize(Vec_coordinate_x.size());
//  Vec_coordinate_ynormalized.resize(Vec_coordinate_y.size());

//  // data is not normalized -> normalize

//  // the aspect ratio must be taken into accounto to produce the normalization value
//  // the larger size has assigned the value 1
//  float Divisor;
//  if (Width>=Height) Divisor=Width;
//  else Divisor=Height;

//  for (unsigned int i=0;i<Vec_coordinate_x.size();i++){
//    Vec_coordinate_x_normalized[i]=Vec_coordinate_x[i]/(Divisor-1);
//  }

//  for (unsigned int i=0;i<Vec_coordinate_x.size();i++){
//    if (CS_origin==_pigment_data_ns::_cs_origin::CS_ORIGIN_TOP_LEFT){
//      Vec_coordinate_ynormalized[i]=(Height-Vec_coordinate_y[i]-1)/(Divisor-1);
//    }
//    else{ // Bottom_left
//      Vec_coordinate_ynormalized[i]=Vec_coordinate_y[i]/(Divisor-1);
//    }
//  }
//}

//HEA

void _positions_data::adjust_y_coordinates()
{
  for (unsigned int i=0;i<Vec_coordinate_y.size();i++){
    Vec_coordinate_y[i]=Height-1.0f-Vec_coordinate_y[i];
  }
}

//HEA

//_history_data::_history_data(std::string Name_layer1, std::string Name_element1, string View_name1, int Palette1, _layer_map_ns::_interpolation_type Interpolation_type1, int Probe1, std::vector<bool> Use_colors1, std::vector<bool> Use_positions1, _common_ns::_color_model Color_model1, bool Normalization1):
//Name_layer(Name_layer1),Name_element(Name_element1), View_name(View_name1), Palette(Palette1),
//Interpolation_type(Interpolation_type1), Probe(Probe1), Use_colors(Use_colors1), Use_positions(Use_positions1),  Color_model(Color_model1),Normalization(Normalization1)
//{

//}

////HEA

//_history_data::_history_data(const _history_data &Data1)
//{
//  Name_layer=Data1.Name_layer;
//  Name_element=Data1.Name_element;
//  View_name=Data1.View_name;
//  Palette=Data1.Palette;
//  Interpolation_type=Data1.Interpolation_type;
//  Probe=Data1.Probe;
//  Use_colors=Data1.Use_colors;
//  Use_positions=Data1.Use_positions;
//  Color_model=Data1.Color_model;
//}

