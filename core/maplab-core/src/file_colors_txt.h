//LIC

#ifndef FILE_COLORS_TXT
#define FILE_COLORS_TXT

#include <vector>
#include <string>
#include "file_io.h"


class _file_colors_txt: public _file_io
{
public:
  bool read(std::vector<std::vector<int>> &Vec_data, std::string &Error, std::string &Line, int &Error_position);
//  void write(std::vector<float> &Vec_data);
};

#endif
