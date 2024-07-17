//LIC

#ifndef LAYER_H
#define LAYER_H

#include <opencv.hpp>
#include <string>
#include <memory>

namespace _layer_ns
{
   enum class _layer_type: unsigned char {LAYER_TYPE_BASIC,LAYER_TYPE_CANNY,LAYER_TYPE_DOG,LAYER_TYPE_KANG,LAYER_TYPE_MAP_DISTANCE,LAYER_TYPE_MAP_TRIANGULATION,LAYER_TYPE_KMEANS};

  enum class _logic_operation: unsigned char {LOGIC_OPERATION_A_AND_B,LOGIC_OPERATION_A_OR_B,LOGIC_OPERATION_A_AND_NOT_B,LOGIC_OPERATION_A_OR_NOT_B,LOGIC_OPERATION_NOT_A};
  enum class _arithmetic_operation: unsigned char {ARITHMETC_OPERATION_ADDITION,ARITHMETC_OPERATION_PRODUCT};

  const std::vector<std::string> Vec_names_logic_operations={"A AND B","A OR  B","A AND NOT B","A OR  NOT B","NOT A"};
  const std::vector<std::string> Vec_names_arithmetic_operations={"Quantities (+)","Proportions (*)"};

}

class _gl_widget;

class _layer
{
public:

  _layer();

  std::string name(){return Name;}

  void image(std::shared_ptr<cv::Mat> Image1){Image=Image1;}
  std::shared_ptr<cv::Mat> image(){return Image;}

  std::shared_ptr<cv::Mat> result_floats_image(){return Result_floats_image;}

  void add_input_image(std::shared_ptr<cv::Mat> Image1){Vec_input_images.push_back(Image1);}
  std::shared_ptr<cv::Mat> input_image(int Pos);

//  void add_image_alpha_channel(std::shared_ptr<cv::Mat> Image_alpha_channel1){Image_alpha_channel=Image_alpha_channel1;}
//  std::shared_ptr<cv::Mat> image_alpha_channel(){return Image_alpha_channel;}

  void state(int Pos,bool State1){State[Pos]=State1;}
  bool state(int Pos){return State[Pos];}

  void transparence(float Transparence1){Transparence=Transparence1;}
  float transparence(){return Transparence;}

  void inversion(bool Inversion1){Inversion=Inversion1;}
  bool inversion(){return Inversion;}

  void color_mixing_min(float Color_mixing1){Color_mixing_min=Color_mixing1;Color_mixing_changed=true;}
  float color_mixing_min(){return Color_mixing_min;}

  void color_mixing_max(float Color_mixing1){Color_mixing_max=Color_mixing1;Color_mixing_changed=true;}
  float color_mixing_max(){return Color_mixing_max;}

  _layer_ns::_layer_type layer_type(){return Layer_type;}

  std::vector<int> vec_values_histogram();

  virtual void update()=0;
  virtual void show()=0;
  virtual void hide()=0;
  virtual void *get_link()=0;
  virtual void enable()=0;
  virtual void disable()=0;
//  virtual void reset_data()=0;
//  virtual void read_parameters(std::map<std::string,std::string> &Parameters)=0;
//  virtual void write_parameters(std::map<std::string,std::string> &Parameters)=0;
//  virtual bool use_dots()=0;

//  void copy_input_to_output();

  int width(){return Image->cols;}
  int height(){return Image->rows;}

protected:

  void compute_histogram();

  std::vector<std::shared_ptr<cv::Mat>> Vec_input_images;

  std::shared_ptr<cv::Mat> Image=nullptr;

//  std::shared_ptr<cv::Mat> Image_alpha_channel=nullptr;

  std::shared_ptr<cv::Mat> Result_floats_image=nullptr;

  std::string Name;

  bool State[2];
  float Transparence=0.0f;

  bool Color_mixing_changed=true;
  float Color_mixing_min=0.0;
  float Color_mixing_max=1.0;


  _layer_ns::_layer_type Layer_type;
  bool Inversion=false;

  int Num_channels;

  bool Histogram_computed=false;
  std::vector<int> Vec_values_histogram;
};

#endif
