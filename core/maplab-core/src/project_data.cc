//LIC

#include "project_data.h"

using namespace std;
using namespace _project_data_ns;

_project_data::_project_data(const _project_data &Data1)
{
  Version=Data1.Version;
  File_format=Data1.File_format;
  Author=Data1.Author;
  Project_name=Data1.Project_name;
  Date=Data1.Date;
  Size_units=Data1.Size_units;
  Width=Data1.Width;
  Height=Data1.Width;
  Normalization=Data1.Normalization;
  CS_origin=Data1.CS_origin;
  Num_samples=Data1.Num_samples;
  Min_value=Data1.Min_value;
  Max_value=Data1.Max_value;
  Vec_coordinate_x=Data1.Vec_coordinate_x;
  Vec_coordinate_y=Data1.Vec_coordinate_y;
}

//HEA

void _project_data::normalize_positions()
{
  float Result;
  float Divisor;

  Vec_coordinate_x_normalized.resize(Vec_coordinate_x.size());
  Vec_coordinate_ynormalized.resize(Vec_coordinate_y.size());


  // data is not normalized -> normalize
  // Check what dimension is greater -> it corresponds to 1.0
  if (Width>=Height) Divisor=Width;
  else Divisor=Height;

  // X
  for (unsigned int i=0;i<Vec_coordinate_x.size();i++){
    Result=Vec_coordinate_x[i]/Divisor;
    Vec_coordinate_x_normalized[i]=Result;
  }

  // Y
  for (unsigned int i=0;i<Vec_coordinate_x.size();i++){
    if (CS_origin==_project_data_ns::_cs_origin::CS_ORIGIN_TOP_LEFT){
      Result=1.0f-Vec_coordinate_y[i]/Divisor;
      Vec_coordinate_ynormalized[i]=Result;
    }
    else{ // Bottom_left
      Result=Vec_coordinate_y[i]/Divisor;
      Vec_coordinate_x_normalized[i]=Result;
    }
  }
}
