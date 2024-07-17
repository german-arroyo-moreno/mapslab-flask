//LIC

#include "layer.h"

using namespace std;

_layer::_layer()
{
  Image=nullptr;
  State[0]=true;
  State[1]=true;
  Transparence=0.0f;
  Inversion=false;
//  Icon=nullptr;
}

//HEA

std::shared_ptr<cv::Mat> _layer::input_image(int Pos)
{
  if (Pos>=0 && Pos<int(Vec_input_images.size())){
    return Vec_input_images[Pos];
  }
  else return nullptr;
}

//HEA

std::vector<int> _layer::vec_values_histogram()
{
  if (Histogram_computed==false){
    Histogram_computed=true;
    compute_histogram();
  }

  return Vec_values_histogram;
}

//HEA

void _layer::compute_histogram()
{
  Vec_values_histogram.resize(256,0);

  cv::Mat Image_aux;
  Image_aux=Result_floats_image->clone();
  Image_aux=Image_aux*255.0F;

  cv::Mat Result_gray_image;
  Image_aux.convertTo(Result_gray_image,CV_8U);

  for (int Row=0;Row<Result_gray_image.rows;Row++){
    for (int Col=0;Col<Result_gray_image.cols;Col++){
      Vec_values_histogram[Result_gray_image.at<unsigned char>(Row,Col)]++;
    }
  }
}


