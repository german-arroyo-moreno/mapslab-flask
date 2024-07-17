//LIC

#include "layer_map_distance.h"
//#include "window.h"

using namespace _layer_map_distance_ns;

//HEA

_layer_map_distance::_layer_map_distance()
{
  Layer_type=_layer_ns::_layer_type::LAYER_TYPE_MAP_DISTANCE;

  // GPU
  // load shaders
  _shaders Shader;

  static const GLchar * P0_vs[]={
  #include "shaders/distance.vert"
  };

  static const GLchar * P0_fs[]={
  #include "shaders/distance.frag"
  };

  Program0=Shader.load_shaders(P0_vs,P0_fs);
  if (Program0==0){
    cout << "Error with the GPU program distance" << endl;
    exit(-1);
  }
}

//HEA

_layer_map_distance::~_layer_map_distance()
{
#ifdef DEBUG_PROGRAM
  cout << "terminando layer element" << endl;
#endif
}

//HEA

void _layer_map_distance::create_buffers()
{
  Vec_color.resize(Vec_element_data.size());

  shared_ptr<cv::Mat> Image_normalized=Vec_input_images[0];

//  int Col_pos1;
//  int Row_pos1;

  // We are going to take the color from the input image (normalized) that correspond to each sample position
//  int Pos=0;
  for (unsigned int i=0;i<Vec_element_data.size();i++){
    // get the color OpenCV uses a left hand CS
    Vec_color[i]=Image_normalized->at<cv::Vec4f>(Vec_element_data[i].y,Vec_element_data[i].x);
  }

//  Image_result=make_shared<cv::Mat>();
//  Image_result->create(Height,Width,CV_32F);

  // create the textures for the input images
  // At least one VAO
  glCreateVertexArrays(1,&VAO1);
  glBindVertexArray(VAO1);

  // the buffer for the normalized image. It is used as a texture
  if (Tex_input_image_normalized>0) glDeleteTextures(1,&Tex_input_image_normalized);
  glCreateTextures(GL_TEXTURE_2D,1,&Tex_input_image_normalized);
  glTextureStorage2D(Tex_input_image_normalized,1,GL_RGBA32F,Width,Height); //RGBA
  glTextureSubImage2D(Tex_input_image_normalized,0,0,0,Width,Height,GL_RGBA,GL_FLOAT,&Image_normalized->data[0]);

  // The buffer for the result. A float (it is saved in the red channedl)
  if (Tex_image_result>0) glDeleteTextures(1,&Tex_image_result);
  glCreateTextures(GL_TEXTURE_2D,1,&Tex_image_result);
  glTextureStorage2D(Tex_image_result,1,GL_R32F,Width,Height);

  // The buffer for the positions data (x,y,value). It will be a SSB
  glGenBuffers(1, &Element_data);
  glBindBuffer(GL_SHADER_STORAGE_BUFFER,Element_data);
  glBufferData(GL_SHADER_STORAGE_BUFFER,Vec_element_data.size()*3*sizeof(GLfloat),&Vec_element_data[0],GL_STATIC_DRAW);

  // The buffer for the color of the input data. It will be a SSB
  glGenBuffers(1, &Colors);
  glBindBuffer(GL_SHADER_STORAGE_BUFFER,Colors);
  glBufferData(GL_SHADER_STORAGE_BUFFER,Vec_color.size()*4*sizeof(GLfloat),&Vec_color[0],GL_STATIC_DRAW);

  // The buffer for the valid pixels
  glGenBuffers(1, &Colors);
  glBindBuffer(GL_SHADER_STORAGE_BUFFER,Colors);
  glBufferData(GL_SHADER_STORAGE_BUFFER,Vec_color.size()*4*sizeof(GLfloat),&Vec_color[0],GL_STATIC_DRAW);

  glBindVertexArray(0);
}


//HEA

void _layer_map_distance::update_map()
{
  // the computation of the distances is made only one time
  if (Computed==false){
    Computed=true;

//    Window->GL_widget->makeCurrent();

    create_buffers();

    // This is necessary because the use of EGL without a Pbuffer
    // Frame Buffer Object to do the off-screen rendering
    GLuint FBO;
    glGenFramebuffers(1,&FBO);
    glBindFramebuffer(GL_FRAMEBUFFER,FBO);

    // Attatchment of the textures to the FBO
    glFramebufferTexture(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0,Tex_image_result,0);

    // OpenGL will draw to these buffers (only one in this case)
    static const GLenum Draw_buffers[]={GL_COLOR_ATTACHMENT0};
    glDrawBuffers(1,Draw_buffers);

    //
    glBindVertexArray(VAO1);

    // program to add 1 to the color value to remove the 0 values (for the log operation)
    glUseProgram(Program0);
    glBindImageTexture(0,Tex_input_image_normalized,0,GL_FALSE,0,GL_READ_WRITE,GL_RGBA32F);
    glBindImageTexture(1,Tex_image_result,0,GL_FALSE,0,GL_READ_WRITE,GL_R32F);

    glBindBufferBase(GL_SHADER_STORAGE_BUFFER,0,Element_data);
    glBindBufferBase(GL_SHADER_STORAGE_BUFFER,1,Colors);

    glUniform1i(0,Width);
    glUniform1i(1,Height);
    glUniform1i(2,int(Vec_element_data.size()));

    // Probe
    glUniform1i(3,Probe);
    // Use colors
    glUniform1i(4,int(Use_colors[0]));
    glUniform1i(5,int(Use_colors[1]));
    glUniform1i(6,int(Use_colors[2]));
    // Use positions
    glUniform1i(7,int(Use_positions[0]));
    glUniform1i(8,int(Use_positions[1]));

    // size of the Diagonal
    float Diagonal=0;
    for (unsigned int i=0;i<Use_colors.size();i++){
      if (Use_colors[i]==true) Diagonal=Diagonal+1.0f;
    }

    // X
    if (Use_positions[0]==true){
      if (Position_normalization_type==_layer_map_distance_ns::_position_normalization_type::POSITION_NORMALIZATION_HOMOGENEOUS){
        Diagonal=Diagonal+1.0f;
      }
      else{
        if (Width>=Height) Diagonal=Diagonal+1.0f;
        else Diagonal=Diagonal+powf(float(Width)/float(Height),2); // the shape is not square so it is not a hypercube
      }
    }

    // Y
    if (Use_positions[1]==true){
      if (Position_normalization_type==_layer_map_distance_ns::_position_normalization_type::POSITION_NORMALIZATION_HOMOGENEOUS){
        Diagonal=Diagonal+1.0f;
      }
      else{
        if (Height>Width) Diagonal=Diagonal+1.0f;
        else Diagonal=Diagonal+powf(float(Height)/float(Width),2); // the shape is not square so it is not a hypercube
      }
    }

    // diagonal
    glUniform1f(9,sqrt(Diagonal));

    // color model
    glUniform1i(10,int(Color_model));

    // normaliaztion
    glUniform1i(11,Normalization);

    // position normalization
    glUniform1i(12,int(Position_normalization_type));

    //
    glViewport(0,0,Width,Height);
    // draw a point for each pixel
    glDrawArrays(GL_POINTS, 0, Width*Height);

//    vector<GLfloat> Data;
//    Data.resize(Width*Height*4*sizeof(GLfloat));

    // read the result
    if (Result_floats_image==nullptr){
      Result_floats_image=make_shared<cv::Mat>();
      Result_floats_image->create(Height,Width,CV_32FC1);
    }

    glBindTexture(GL_TEXTURE_2D,Tex_image_result);
    glGetTexImage(GL_TEXTURE_2D,0,GL_RED,GL_FLOAT,&Result_floats_image->data[0]);

//    for (unsigned int i=0;i<100;i++){
//      cout <<"i=" << i << " Valor=" << Result_floats_image->at<float>(i) << endl;
//    }

    glUseProgram(0);
    glBindVertexArray(0);

    glDeleteTextures(1,&Tex_input_image_normalized);
    glDeleteTextures(1,&Tex_image_result);
    glDeleteBuffers(1,&Element_data);
    glDeleteBuffers(1,&Colors);

    glDeleteProgram(Program0);
    glDeleteVertexArrays(1,&VAO1);

//    glDeleteTextures(1,&Color_texture);
    glDeleteFramebuffers(1,&FBO);

    apply_colormap();
//    apply_color_mixing();
  }
  else{
    // only update if necessary
    if (Colormap_changed){
      Colormap_changed=false;
      apply_colormap();
    }
//    if (Color_mixing_changed){
//      Color_mixing_changed=false;
//      apply_color_mixing();
//    }
  }
}

//HEA

void _layer_map_distance::update()
{
  update_map();
}

//HEA
// Returns the normalized value for a position. This is for the charts

float _layer_map_distance::get_value(int Col,int Row)
{
//  return(float(Result_gray_image->at<unsigned char>(Row,Col))/255.0f);
  return(Result_floats_image->at<float>(Row,Col));
}

