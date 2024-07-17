#include "file_io.h"

using namespace std;

//HEA

int _file_io::open(const string &File_name,_mode Mode)
{

  if (Mode==_mode::MODE_READ) File.open(File_name.c_str(),ios::in);
  if (Mode==_mode::MODE_WRITE) File.open(File_name.c_str(),ios::out);

  if (File.good()) return 1;
  else return 0;
}

//HEA

void _file_io::close()
{
  File.close();
}

//HEA

void _file_io::get_token(istringstream &Line_stream1,string &Token1,char Separator)
{
//  cout << "str= " << Line_stream1.str() << " leng=" << Line_stream1.tellg() << endl;

  if (int(Line_stream1.tellg())<int(Line_stream1.str().length())){
    do{
      getline(Line_stream1,Token1,Separator);
    } while (Token1=="" && int(Line_stream1.tellg())<int(Line_stream1.str().length()));
    if (Token1.size()>0){
      if (Token1[Token1.size()-1]=='\r') Token1.erase(Token1.size() - 1);
    }
  }
  else{
    Token1="";
  }
}

//HEA

bool _file_io::get_new_line(fstream &File,string &Line)
{
  bool Line_empty=true;
  string Aux;

  do{
    if (getline(File,Aux)){
      // remove carriage return
      Aux.erase(remove(Aux.begin(),Aux.end(),'\r'), Aux.end());
      // remove tabs
//      Aux.erase(remove(Aux.begin(),Aux.end(),'\t'), Aux.end());
      replace(Aux.begin(),Aux.end(),'\t',' ');
      Line=Aux;
//      Line=std::regex_replace(Aux, std::regex("\\s+")," ");
      if (Line.length()>0){
        return true;
      }
    }
    else return false;
  } while (Line_empty==true);
  return false;
}


//HEA

bool _file_io::get_new_line(fstream &File,istringstream &Line_stream)
{
  bool Line_empty=true;

  string Line;
  do{
    if (getline(File,Line)){
      // remove carriage return
      Line.erase(remove(Line.begin(),Line.end(),'\r'), Line.end());
      // remove blank spaces at the beginning
//      Line.erase(remove(Line.begin(),Line.end(),' '), Line.end());
			// remove tabs
      Line.erase(remove(Line.begin(),Line.end(),'\t'), Line.end());
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

//HEA

void _file_io::get_token(string &Token,char Separator)
{
  std::size_t Pos = Token.find(Separator);
  while ((Pos+1)<string::npos && Token[Pos+1]==Separator) Pos++;
  if (Pos!=string::npos) Token=Token.substr(Pos+1);
}


void _file_io::get_tokens(string &String, char Separator, vector<string> &Tokens)
{
  std::size_t Pos;
  string Token;
  Tokens.clear();

  do{
    Pos = String.find(Separator);
    if (Pos!=string::npos){
      Token=String.substr(0,Pos);
      Tokens.push_back(Token);
      while ((Pos+1)<string::npos && String[Pos+1]==Separator) Pos++;
      String=String.substr(Pos+1);
    }
  }while (Pos!=string::npos);
  if (String.size()>0) Tokens.push_back(String);
}


