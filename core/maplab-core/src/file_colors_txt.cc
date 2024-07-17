#include "file_colors_txt.h"

using namespace std;

//HEA

bool _file_colors_txt::read(std::vector<std::vector<int>> &Vec_data, std::string &Error, std::string &Line, int &Error_position)
{
  string Text;
  string Token;
  vector<string>Tokens;

//  istringstream Line_stream;
  setlocale(LC_ALL, "C");

  try{
    Error_position=0;
    while (get_new_line(File,Token)){
      get_tokens(Token,';',Tokens);
      // position
      vector<int> Result(Tokens.size()-1);
      for (unsigned int i=1;i<Tokens.size();i++) Result[i-1]=stoi(Tokens[i]);
      Vec_data.push_back(Result);
    }
  }
  catch(std::exception const& e){
    cout << "There was an error: " << e.what() << endl;
    return false;
  }
  return(true);
}


//HEA

