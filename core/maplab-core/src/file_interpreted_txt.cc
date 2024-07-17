#include "file_interpreted_txt.h"

using namespace std;

//HEA

int _file_interpreted_txt::open(const string &File_name,_mode Mode)
{

  if (Mode==_mode::MODE_READ) File.open(File_name.c_str(),ios::in);
  if (Mode==_mode::MODE_WRITE) File.open(File_name.c_str(),ios::out);

  if (File.good()) return 1;
  else return 0;
}

//HEA

void _file_interpreted_txt::close()
{
  File.close();
}

//HEA

void _file_interpreted_txt::get_token(istringstream &Line_stream1,string &Token1,char Separator)
{
//  cout << "str= " << Line_stream1.str() << " leng=" << Line_stream1.tellg() << endl;

  if (int(Line_stream1.tellg())<int(Line_stream1.str().length())){
    getline(Line_stream1,Token1,Separator);
    if (Token1[Token1.size()-1]=='\r') Token1.erase(Token1.size() - 1);
  }
  else{
    Token1="";
  }
}

//HEA

bool _file_interpreted_txt::get_new_line(fstream &File,istringstream &Line_stream)
{
  bool Line_empty=true;

  string Line;
  do{
    if (getline(File,Line)){
      // remove carriage return
      Line.erase(remove(Line.begin(),Line.end(),'\r'), Line.end());
      // remove black spaces at the beginning
      Line.erase(remove(Line.begin(),Line.end(),' '), Line.end());
			// remove tabs
//      Line.erase(remove(Line.begin(),Line.end(),'\t'), Line.end());
      if (Line.length()>0){
        Line_stream.str(Line);
        Line_stream.seekg(0);
        return true;
      }
    }
    else return false;
  } while (Line_empty==true);
  return false;
}

