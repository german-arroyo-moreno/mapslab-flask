//LIC

#ifndef PROJECT_DATA
#define PROJECT_DATA

#include <string>
#include <vector>
#include <iostream>

#include <opencv.hpp>

//HEA

namespace _project_data_ns
{	
	struct _interpreted_data {
		std::string Name;
    float Max_value=-1;
    float Max_value_adjusted=-1;
    std::vector<float> Vec_value;
	};
	
  struct _project_data {
    std::string Author;
    std::string Project_name;
    std::string Date;
    std::string Device;
    float Width=-1;
    float Height=-1;
    int Num_samples=0;
    std::vector<float> Vec_coordinate_x;
    std::vector<float> Vec_coordinate_y;
    std::vector<_interpreted_data> Vec_interpreted_data_xrf;
//    std::vector<_interpreted_data> Vec_interpreted_data_xrd;
  };
};

#endif


