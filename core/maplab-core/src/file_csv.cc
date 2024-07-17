#include "file_csv.h"
//#include "window.h"

using namespace std;

//HEA

int _file_csv::open(const string &File_name, _file_csv_ns::_mode Mode)
{

  if (Mode==_file_csv_ns::_mode::MODE_READ) File.open(File_name.c_str(),ios::in);
  if (Mode==_file_csv_ns::_mode::MODE_WRITE) File.open(File_name.c_str(),ios::out);

  if (File.good()) return 1;
  else return 0;
}

//HEA

void _file_csv::close()
{
  File.close();
}

//HEA

void _file_csv::get_token(istringstream &Line_stream1,string &Token1,char Separator)
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

bool _file_csv::get_new_line(fstream &File,istringstream &Line_stream)
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

bool _file_csv::get_new_line(fstream &File,string &Line)
{
  bool Line_empty=true;

  do{
    if (getline(File,Line)){
      // remove carriage return
      Line.erase(remove(Line.begin(),Line.end(),'\r'), Line.end());
      // remove blank spaces at the beginning
//      Line.erase(remove(Line.begin(),Line.end(),' '), Line.end());
      // remove tabs
      Line.erase(remove(Line.begin(),Line.end(),'\t'), Line.end());
      if (Line.length()>0){
        return true;
      }
    }
    else return false;
  } while (Line_empty==true);
  return false;
}

//HEA

void _file_csv::get_token(string &Token,char Separator)
{
  std::size_t Pos = Token.find(Separator);
  if (Pos!=string::npos) Token=Token.substr(Pos+1);
}

//HEA

void _file_csv::get_tokens(string &String, char Separator, vector<string> &Tokens)
{
  std::size_t Pos;
  string Token;
  Tokens.clear();

  do{
    Pos = String.find(Separator);
    if (Pos!=string::npos){
      Token=String.substr(0,Pos);
      Tokens.push_back(Token);
      String=String.substr(Pos+1);
    }
  }while (Pos!=string::npos);
  if (String.size()>0) Tokens.push_back(String);
}

//HEA

bool _file_csv::read(_project_data_ns::_project_data &Project_data,std::vector<std::string> &Vec_element_names,std::string &Error,std::string &Line, int &Position)
{
  int Value;
  string Text;
  string Name;
  vector<string> Tokens;
  bool Result=true;

  string Token;
  istringstream Line_stream;
  setlocale(LC_ALL, "C");

  while (get_new_line(File,Token)==true){
    //
    get_tokens(Token,';',Tokens);
    Token=Tokens[0];
    remove(Token.begin(),Token.end(),' ');

    // convert to uppercase
    for (auto & c: Token) c = toupper(c);

    auto It=std::find(_file_csv_ns::Vec_allowed_words.begin(),_file_csv_ns::Vec_allowed_words.end(),Token);
    if (It!=_file_csv_ns::Vec_allowed_words.end()){
      switch(It-_file_csv_ns::Vec_allowed_words.begin()){
        case int(_file_csv_ns::_allowed_tokens::TOKEN_PROJECT_NAME):
          Project_data.Project_name=Tokens[1];
          break;
        case int(_file_csv_ns::_allowed_tokens::TOKEN_AUTHOR):
          Project_data.Author=Tokens[1];
          break;
        case int(_file_csv_ns::_allowed_tokens::TOKEN_DATE):
          Project_data.Date=Tokens[1];
          break;
        case int(_file_csv_ns::_allowed_tokens::TOKEN_DEVICE):
          Project_data.Device=Tokens[1];
          break;
        case int(_file_csv_ns::_allowed_tokens::TOKEN_WIDTH):
          Text=Tokens[1];
          replace(Text.begin(),Text.end(),',','.');
          Value=int(stof(Text));
          if (Value>=0) Project_data.Width=Value;
          else{
            cout << "Error: The WIDTH is less than 0" << endl;
            exit(-1);
          }
          break;
        case int(_file_csv_ns::_allowed_tokens::TOKEN_HEIGHT):
          Text=Tokens[1];
          replace(Text.begin(),Text.end(),',','.');
          Value=int(stof(Text));
          if (Value>=0) Project_data.Height=Value;
          else{
            cout << "Error: The HEIGHT is less than 0" << endl;
            exit(-1);
          }
          break;
        case int(_file_csv_ns::_allowed_tokens::TOKEN_NUM_SAMPLES):
          Text=Tokens[1];
          replace(Text.begin(),Text.end(),',','.');
          Project_data.Num_samples=int(stof(Text));
          break;
        case int(_file_csv_ns::_allowed_tokens::TOKEN_X):
          if (int(Tokens.size())-2>=Project_data.Num_samples){
            Project_data.Vec_coordinate_x.resize(Project_data.Num_samples);
            for (int i=0;i<Project_data.Num_samples;i++){
              Text=Tokens[i+2];
              replace(Text.begin(),Text.end(),',','.');
              Value=int(stof(Text));
              if (Value>=0 && Value<Project_data.Width) Project_data.Vec_coordinate_x[i]=Value;
              else{
                cout << "Error: The coordinate x of position "+to_string(i+1)+" is not in the valid range" << endl;
                exit(-1);
              }
            }
          }
          else{// error
            cout << "Error: There are less values than the number of samples" << endl;
            exit(-1);
          }
          break;
        case int(_file_csv_ns::_allowed_tokens::TOKEN_Y):
          if (int(Tokens.size())-2>=Project_data.Num_samples){
            Project_data.Vec_coordinate_y.resize(Project_data.Num_samples);
            for (int i=0;i<Project_data.Num_samples;i++){
              Text=Tokens[i+2];
              replace(Text.begin(),Text.end(),',','.');
              Value=int(stof(Text));
              if (Value>=0 && Value<Project_data.Height) Project_data.Vec_coordinate_y[i]=Value;
              else{
                cout << "Error: The coordinate y of position "+to_string(i+1)+" is not in the valid range" << endl;
                exit(-1);
              }
            }
          }
          else{// error
            cout << "Error: There are less values than the number of samples" << endl;
            exit(-1);
          }
          break;
        case int(_file_csv_ns::_allowed_tokens::TOKEN_XRF):
          {
            Name=Tokens[1];
            Name.erase(std::remove_if(Name.begin(),Name.end(),[](unsigned char x){return std::isspace(x);}),Name.end());
            auto It=std::find(Vec_element_names.begin(),Vec_element_names.end(),Name);
            if (It!=Vec_element_names.end()){
              _project_data_ns::_interpreted_data Interpreted_data;

              Interpreted_data.Name=Name;
              Interpreted_data.Vec_value.resize(Project_data.Num_samples);
              for (int i=0;i<Project_data.Num_samples;i++){
                Text=Tokens[i+2];
                replace(Text.begin(),Text.end(),',','.');
                Interpreted_data.Vec_value[i]=stof(Text);
              }

              Project_data.Vec_interpreted_data_xrf.push_back(Interpreted_data);
            }
          }
          break;
//        case int(_file_csv_ns::_allowed_tokens::TOKEN_XRD):
//          {
//            Name=Tokens[1];
//            auto It=std::find(Vec_element_names.begin(),Vec_element_names.end(),Name);
//            if (It!=Vec_element_names.end()){
//              _project_data_ns::_interpreted_data Interpreted_data;

//              Interpreted_data.Name=Name;
//              Interpreted_data.Vec_values.resize(Project_data.Num_samples);
//              for (int i=0;i<Project_data.Num_samples;i++){
//                Text=Tokens[i+2];
//                replace(Text.begin(),Text.end(),',','.');
//                Interpreted_data.Vec_values[i]=stof(Text);
//              }

//              Project_data.Vec_interpreted_data_xrd.push_back(Interpreted_data);
//            }
//          }
//          break;
        default:break;
      }
    }
  }
  return Result;
}

//HEA

void _file_csv::write(_project_data_ns::_project_data &Project_data)
{
  string Text;

  int Num_samples=Project_data.Num_samples;

  setlocale(LC_ALL, "C");

  File << "PROJECT_NAME;" << Project_data.Project_name << ";";
  for (int i=0;i<Num_samples;i++) File << ";";
  File << "\n";

  File << "AUTHOR;" << Project_data.Author << ";";
  for (int i=0;i<Num_samples;i++) File << ";";
  File << "\n";

  File << "DATE;" << Project_data.Date;
  for (int i=0;i<Num_samples;i++) File << ";";
  File << "\n";

  File << "DEVICE;" << Project_data.Device;
  for (int i=0;i<Num_samples;i++) File << ";";
  File << "\n";


  Text=to_string(int(Project_data.Width));
  File << "WIDTH;" << Text;
  for (int i=0;i<Num_samples;i++) File << ";";
  File << "\n";

  Text=to_string(int(Project_data.Height));
  File << "HEIGHT;" << Text;
  for (int i=0;i<Num_samples;i++) File << ";";
  File << "\n";

  Text=to_string(int(Project_data.Num_samples));
  File << "NUM_SAMPLES;" << Text;
  for (int i=0;i<Num_samples;i++) File << ";";
  File << "\n";

  // coordinates
  File << "X;-";
  for (unsigned int i=0;i<Project_data.Vec_coordinate_x.size();i++){
    Text=to_string(Project_data.Vec_coordinate_x[i]);
    replace(Text.begin(),Text.end(),'.',',');
    File << "; " << Text;
  }
  File << "\n";

  File << "Y;-";
  for (unsigned int i=0;i<Project_data.Vec_coordinate_y.size();i++){
    Text=to_string(Project_data.Vec_coordinate_y[i]);
    replace(Text.begin(),Text.end(),'.',',');
    File << "; " << Text;
  }
  File << "\n";

  // elements
  for (unsigned int i=0;i<Project_data.Vec_interpreted_data_xrf.size();i++){
    File << "XRF" << "; ";

    File << Project_data.Vec_interpreted_data_xrf[i].Name;
    for (int j=0;j<Project_data.Num_samples;j++){
      Text=to_string(Project_data.Vec_interpreted_data_xrf[i].Vec_value[j]);
      replace(Text.begin(),Text.end(),'.',',');
      File << "; " << Text;
    }
    File << "\n";
  }
}
