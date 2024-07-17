//LIC

#include "layer_map.h"
//#include "window.h"

using namespace _layer_map_ns;
using namespace std;

//HEA

_layer_map::_layer_map()
{
  Transparence=0;

  Num_channels=1;

  End_color=_qcolor(255,0,0);

  // color map
  Color_table=make_shared<cv::Mat>();
  Color_table->create(1,256,CV_8UC3);
}

//HEA

_layer_map::~_layer_map()
{
#ifdef DEBUG_PROGRAM
  cout << "terminando layer element" << endl;
#endif
}

//HEA

void _layer_map::add_input_data(std::vector<float> &Vec_coordinate_x1, std::vector<float> &Vec_coordinate_y1, std::vector<float> &Vec_value1)
{
  Vec_element_data.resize(Vec_coordinate_x1.size());
  for (unsigned int i=0;i<Vec_coordinate_x1.size();i++){
    Vec_element_data[i].x=Vec_coordinate_x1[i];
    Vec_element_data[i].y=Vec_coordinate_y1[i];
    Vec_element_data[i].Value=Vec_value1[i];
  }
}

//HEA

void _layer_map::reset_data()
{
  Transparence=0;
}

//HEA
// Creates the colormap (256 RGB tuples) that will be used by OpenCV

void _layer_map::set_colormap(std::vector<float> &Vec_proportions, std::vector<_qcolor> &Vec_colors1, int Type)
{
  vector<int> Vec_int_proportions;

  Vec_int_proportions.resize(Vec_proportions.size());
  for (unsigned int i=0;i<Vec_proportions.size();i++){
    Vec_int_proportions[i]=int(Vec_proportions[i]*255.0f);
  }

  int Start_value;
  int End_value;
  int Steps;
  float t;
  int Pos=0;

  if (Type==1){
    // interpolations
    for (unsigned int i=0;i<Vec_int_proportions.size()-1;i++){
      Start_value=Vec_int_proportions[i];
      End_value=Vec_int_proportions[i+1];
      Steps=End_value-Start_value;

      cv::Vec3f Start_color(Vec_colors1[i].red(),Vec_colors1[i].green(),Vec_colors1[i].blue());
      cv::Vec3f End_color(Vec_colors1[i+1].red(),Vec_colors1[i+1].green(),Vec_colors1[i+1].blue());
      cv::Vec3f Color;

      for (int j=0;j<Steps;j++){
        t=float(j)/float(Steps);
        Color=(End_color-Start_color)*t+Start_color;
        Color_table->at<cv::Vec3b>(Pos)[0]=static_cast<unsigned char>(Color[0]);
        Color_table->at<cv::Vec3b>(Pos)[1]=static_cast<unsigned char>(Color[1]);
        Color_table->at<cv::Vec3b>(Pos)[2]=static_cast<unsigned char>(Color[2]);
        Pos++;
      }
    }
    // last element
    Color_table->at<cv::Vec3b>(Pos)[0]=static_cast<unsigned char>(Vec_colors1[Vec_colors1.size()-1].red());
    Color_table->at<cv::Vec3b>(Pos)[1]=static_cast<unsigned char>(Vec_colors1[Vec_colors1.size()-1].green());
    Color_table->at<cv::Vec3b>(Pos)[2]=static_cast<unsigned char>(Vec_colors1[Vec_colors1.size()-1].blue());
  }
  else{
    // sections
    for (unsigned int i=0;i<Vec_int_proportions.size()-1;i++){
      Start_value=Vec_int_proportions[i];
      End_value=Vec_int_proportions[i+1];
      Steps=End_value-Start_value;

      cv::Vec3f Start_color(Vec_colors1[i].red(),Vec_colors1[i].green(),Vec_colors1[i].blue());
      for (int j=0;j<Steps;j++){
        Color_table->at<cv::Vec3b>(Pos)[0]=static_cast<unsigned char>(Start_color[0]);
        Color_table->at<cv::Vec3b>(Pos)[1]=static_cast<unsigned char>(Start_color[1]);
        Color_table->at<cv::Vec3b>(Pos)[2]=static_cast<unsigned char>(Start_color[2]);
        Pos++;
      }
    }
    cv::Vec3f Start_color(Vec_colors1[Vec_colors1.size()-2].red(),Vec_colors1[Vec_colors1.size()-2].green(),Vec_colors1[Vec_colors1.size()-2].blue());
    Color_table->at<cv::Vec3b>(Pos)[0]=static_cast<unsigned char>(Start_color[0]);
    Color_table->at<cv::Vec3b>(Pos)[1]=static_cast<unsigned char>(Start_color[1]);
    Color_table->at<cv::Vec3b>(Pos)[2]=static_cast<unsigned char>(Start_color[2]);
  }

  End_color=Vec_colors1[Vec_colors1.size()-1];

  Colormap_changed=true;
  //
  Color_mixing_changed=true;
}

//HEA
// Apply the color map using OpenCV.

void _layer_map::apply_colormap()
{
  cv::Mat Image_out_uc;
  cv::Mat Gray;

  // adjustment to 255 and unsigned char
  cv::Mat Image_aux;
  Image_aux=Result_floats_image->clone();
  Image_aux=Image_aux*255.0F;

  cv::Mat Result_gray_image;
  Image_aux.convertTo(Result_gray_image,CV_8U);

  // the input must be a RGB image that contains gray levels ???
  cvtColor(Result_gray_image,Gray,cv::COLOR_GRAY2RGB,3);

  LUT(Gray,*Color_table,Image_out_uc);

  cvtColor(Image_out_uc,*Image,cv::COLOR_RGB2BGRA,4);
}


//HEA
// Apply the color map using OpenCV.

void _layer_map::apply_color_mixing()
{
  bool Mode_normal;
  int Mixing_min_aux=int(Color_mixing_min*255.0f);
  int Mixing_max_aux=int(Color_mixing_max*255.0f);

  if (Mixing_min_aux<=Mixing_max_aux) Mode_normal=true;
  else Mode_normal=false;

  cv::Mat Image_aux;
  Image_aux=Result_floats_image->clone();
  Image_aux=Image_aux*255.0F;

  cv::Mat Result_gray_image;
  Image_aux.convertTo(Result_gray_image,CV_8U);

  cv::Vec4b Color;

  for (unsigned int i=0;i<Image->total();i++){
    if (Mode_normal){
      if (Result_gray_image.at<unsigned char>(i)<Mixing_min_aux) Image->at<cv::Vec4b>(i)[3]=0;
      else{
        if (Result_gray_image.at<unsigned char>(i)>Mixing_max_aux) Image->at<cv::Vec4b>(i)[3]=0;
        else Image->at<cv::Vec4b>(i)[3]=255;
      }
    }
    else{
      if (Result_gray_image.at<unsigned char>(i)>Mixing_min_aux) Image->at<cv::Vec4b>(i)[3]=255;
      else{
        if (Result_gray_image.at<unsigned char>(i)<Mixing_max_aux) Image->at<cv::Vec4b>(i)[3]=255;
        else Image->at<cv::Vec4b>(i)[3]=0;
      }
    }
  }
}

//HEA
// Returns the normalized value for a position. This is for the charts

float _layer_map::get_value(int Col,int Row)
{
//  return(float(Result_gray_image->at<unsigned char>(Row,Col))/255.0f);
  return(Result_floats_image->at<float>(Row,Col));
}

