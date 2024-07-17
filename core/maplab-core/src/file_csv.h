//LIC

#ifndef FILE_CSV
#define FILE_CSV

#include <fstream>
#include <sstream>
#include <iostream>
#include <string>
#include <algorithm>
#include <vector>
#include <utility>
#include <tuple>

#include <string>

#include <fstream>

#include "project_data.h"

class _window;

namespace _file_csv_ns {
 const std::vector<std::string> Vec_allowed_words={"PROJECT_NAME","AUTHOR","DATE","DEVICE","WIDTH","HEIGHT","NUM_SAMPLES","X","Y","XRF","XRD"};
 enum class _allowed_tokens:unsigned char{TOKEN_PROJECT_NAME,TOKEN_AUTHOR,TOKEN_DATE,TOKEN_DEVICE,TOKEN_WIDTH,TOKEN_HEIGHT,TOKEN_NUM_SAMPLES, TOKEN_X,TOKEN_Y, TOKEN_XRF,TOKEN_XRD};

  enum class _mode:unsigned char{MODE_READ,MODE_WRITE};
}

//HEA

class _file_csv
{
public:
  _file_csv(){}
  int open(const std::string &File_name,_file_csv_ns::_mode Mode);
  void close();

  bool read(_project_data_ns::_project_data &Project_data, std::vector<std::string> &Vec_element_names, std::string &Error, std::string &Line, int &Position);
  void write(_project_data_ns::_project_data &Project_data);

private:
  void get_token(std::istringstream &Line_stream1, std::string &Token1, char Separator);
  bool get_new_line(std::fstream &File, std::istringstream &Line_stream);

  bool get_new_line(std::fstream &File,std::string &Line);
  void get_token(std::string &Token,char Separator);
  void get_tokens(std::string &String,char Separator,std::vector<std::string> &Tokens);

  std::fstream File;

//  _window *Window=nullptr;
};

#endif
