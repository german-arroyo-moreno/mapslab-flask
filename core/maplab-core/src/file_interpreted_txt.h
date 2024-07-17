//LIC

#ifndef FILE_INTERPRETED_TXT
#define FILE_INTERPRETED_TXT

#include <fstream>
#include <sstream>
#include <iostream>
#include <string>
#include <algorithm>
#include <vector>
#include <utility>
#include <tuple>
//#include "vertex.h"
//#include "pigment_data.h"

class _file_interpreted_txt
{
public:
  enum class _mode:unsigned char{MODE_READ,MODE_WRITE};

  _file_interpreted_txt(){}
  int open(const std::string &File_name,_mode Mode);
  void close();

//  bool read(vector<_pigment_data_ns::_pair_name_value> &Vec_data,string &Error,string &Line, int &Position);
//  void write(vector<float> &Vec_data);

private:
  void get_token(std::istringstream &Line_stream1, std::string &Token1, char Separator);
  bool get_new_line(std::fstream &File, std::istringstream &Line_stream);

  std::fstream File;
};

#endif
