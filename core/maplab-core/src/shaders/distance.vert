R"(
#version 450 core       
layout (location=0) uniform int Width; // width of the image in pixels        
layout (location=1) uniform int Height; // height of the image in pixels        
layout (location=2) uniform int Num_samples; // number of samples in the image (where we have real data)  
layout (location=3) uniform int Probe; // given the central position, this parameter indicates the number of pixels surounding it. This allows to get a mean value       
layout (location=4) uniform int Use_color1; // this is boolean parameter to indicate if the colors are used to get 
layout (location=5) uniform int Use_color2; 
layout (location=6) uniform int Use_color3; 
layout (location=7) uniform int Use_position1; // this is boolean parameter to indicate if the positions are sued to get the nearest one
layout (location=8) uniform int Use_position2; 
layout (location=9) uniform float Diagonal; // this is the value of the diagonal of the hypercube. Used to normalize the final result
layout (location=10) uniform int Color_model; // the color model: 0=RGB(0-1,0-1,0-1), 1=HLS(0-360,0-1,0-1), 2=HSV(0-360,0-1,0-1), 3=Lab(0-100,-127->127,-127->127), 4=Luv(0-100,-134->220,-140->122))   
layout (location=11) uniform bool Normalization; 
// Position_normalization_type the normalization of data using the Diagonal value
// 0=Homogeneous (smArt_scan) 1=Heterogeneous 
layout (location=12) uniform int Position_normalization_type; 

layout (binding = 0,rgba32f) uniform image2D Input_image_normalized; // the input image with the values normalized and using floats
layout (binding = 1,r32f) uniform image2D Result_image; // the output is an image with a float for each pixel with the corresponding values of the interpolation
 
// the data of each compound (x,y,z). The positions are NOT normalized
struct Data
{ 
  float Pos_x;          
  float Pos_y;
  float Value;
};

// the position data 
layout (binding=0,std430) buffer SSB_sample   
{ 
  Data Vec_data[]; 
};

// the color of each sample position  
layout (binding=1,std430) buffer SSB_sample_color        
{ 
  vec4 Vec_color[];        
};


// get mean color in a window

void compute_color(in ivec2 Pos,in int probe, out vec4 Result_color)         
{        
  vec4 Color_normalized_input_image=vec4(0,0,0,1);
  vec4 Color1=vec4(0,0,0,1); 
  ivec2 Pos_aux;  
  int Pos_x=Pos.x;
  int Pos_y=Pos.y;
  int Count=0;  
  
  Result_color=vec4(0,0,0,1);
      
  // these double for is for compute the mean color. Given the center, Probe is the size of the surrounded window
	for (int Row=-Probe;Row<Probe;Row++){
		// check that is in the image for the Row pos
		Pos_aux.y=Pos_y+Row;
		if ((Pos_y+Row)<0) Pos_aux.y=0;       
		if ((Pos_y+Row)>=Height) Pos_aux.y=Height-1;     
																																											
		for (int Col=-Probe;Col<Probe;Col++){
		  Pos_aux.x=Pos_x+Col;
			// check that is in the image for the Col pos
			if ((Pos_x+Col)<0) Pos_aux.x=0;     
			if ((Pos_x+Col)>=Width) Pos_aux.x=Width-1;     
			
			// get the color from the imput image
			Color_normalized_input_image=imageLoad(Input_image_normalized,Pos_aux);         
																						
			// check that is a good value
			if (Color_normalized_input_image.a!=0){
				// add to the resulting color 
				Result_color=Result_color+Color_normalized_input_image;
				// count the number of additions
				Count=Count+1;         
			}  
		}    
	}
	
	// compute the mean color for the window
	Result_color=Result_color/float(Count);   
}

// function to compute the color using the minimum distance in the hypercube

void compute_minimum_distance(in ivec2 Pos,in int Probe, out vec4 Color1)         
{ 
  // get the color of the treated pixel
  vec4 Color_normalized_input_image;
  if (Probe==0){
		Color_normalized_input_image=imageLoad(Input_image_normalized,Pos);     
	}
	else{
		compute_color(Pos,Probe,Color_normalized_input_image);
	}
  
  int Pos_min=-1;
  float Diff_color=0;
  float Diff_distance=0;
  float Min_value=Diagonal;
  float Sum;
  bool Valid;
  int Color_h;
  int Sample_h;

  // we have to compute the distance of the pixel to all the real samples (Num_samples)
  for (int i=0;i<Num_samples;i++){ 		
		// only the positive values can be used
		if (Vec_data[i].Value>=0){	
			Sum=0;
			
			//RGB
			switch (Color_model){
			case 0: //RGB
				// R
				if (Use_color1==1){
					Diff_color=Color_normalized_input_image.x-Vec_color[i].x;
					Sum=Sum+Diff_color*Diff_color;
				}
				// G
				if (Use_color2==1){
					Diff_color=Color_normalized_input_image.y-Vec_color[i].y;
					Sum=Sum+Diff_color*Diff_color;
				}
				// B
				if (Use_color3==1){
					Diff_color=Color_normalized_input_image.z-Vec_color[i].z;
					Sum=Sum+Diff_color*Diff_color;
				}
				break;
				
			case 1: // HLS
			case 2: // HSV 0-360,0-1,0-1
				if (Use_color1==1){
					Diff_color=Color_normalized_input_image.x-Vec_color[i].x;
					Diff_color=Diff_color/360.0;
					Sum=Sum+Diff_color*Diff_color;
				}
				// L
				if (Use_color2==1){
					Diff_color=Color_normalized_input_image.y-Vec_color[i].y;
					Sum=Sum+Diff_color*Diff_color;
				}
				// S/V
				if (Use_color3==1){
					Diff_color=Color_normalized_input_image.z-Vec_color[i].z;
					Sum=Sum+Diff_color*Diff_color;
				}
				break;
				
			case 3: //Lab(0-100,-127->127,-127->127) 
				// L
				if (Use_color1==1){
					Diff_color=Color_normalized_input_image.x-Vec_color[i].x;
					Diff_color=Diff_color/100.0;
					Sum=Sum+Diff_color*Diff_color;
				}
				// a
				if (Use_color2==1){
					Diff_color=Color_normalized_input_image.y-Vec_color[i].y;
					Diff_color=Diff_color/254.0;
					Sum=Sum+Diff_color*Diff_color;
				}
				// b
				if (Use_color3==1){
					Diff_color=Color_normalized_input_image.x-Vec_color[i].x;
					Diff_color=Diff_color/254.0;
					Sum=Sum+Diff_color*Diff_color;
				}
				break;
				
			case 4: //Luv(0-100,-134->220,-140->122))  
				// L
				if (Use_color1==1){
					Diff_color=Color_normalized_input_image.x-Vec_color[i].x;
					Diff_color=Diff_color/100.0;
					Sum=Sum+Diff_color*Diff_color;
				}
				// u
				if (Use_color2==1){
					Diff_color=Color_normalized_input_image.y-Vec_color[i].y;
					Diff_color=Diff_color/354.0;
					Sum=Sum+Diff_color*Diff_color;
				}
				// v
				if (Use_color3==1){
					Diff_color=Color_normalized_input_image.x-Vec_color[i].x;
					Diff_color=Diff_color/262.0;
					Sum=Sum+Diff_color*Diff_color;
				}
				break;
			}
				
			// computes the cartesian distance between the positions of the treated pixel and the sample
			//float Pos_image_normalized;
			if (Use_position1==1){
				Diff_distance=float(Pos.x)-Vec_data[i].Pos_x;
				
				if (Position_normalization_type==0){ //homogeneous
					Diff_distance=Diff_distance/float(Width-1);
				}
				else{ // heterogeneous
					// computation of the normalized coordinates
					if (Width>=Height){
						Diff_distance=Diff_distance/float(Width-1);
					}
					else{
						Diff_distance=Diff_distance/float(Height-1);
					}
				}
				
				Sum=Sum+Diff_distance*Diff_distance;
			}
				
			if (Use_position2==1){
				Diff_distance=float(Pos.y)-Vec_data[i].Pos_y;
				
				if (Position_normalization_type==0){ //homogeneous
					Diff_distance=Diff_distance/float(Height-1);
				}
				else{
					if (Width>=Height){
						Diff_distance=Diff_distance/float(Width-1);
					}
					else{
						Diff_distance=Diff_distance/float(Height-1);
					}
				}
		
				Sum=Sum+Diff_distance*Diff_distance;
			}
			
			// computes the square root
			Sum=sqrt(Sum);
			
			// check if the new values is a minimum
			if (Sum<Min_value){
				// saves the value
				Min_value=Sum;    
				
				// saves the position of the minimum
				Pos_min=i;        
			}        
		} 
	}

	// normalizes the distance depending on the value of the diagonal
	float Final_value;
	if (Normalization==false) Final_value=Vec_data[Pos_min].Value;  // NO normalization
	else Final_value=Vec_data[Pos_min].Value*(Diagonal-Min_value)/Diagonal;  
  
  // return the color as the red component
  Color1=vec4(Final_value,0,0,1);       
} 

// main 

void main(void)         
{
  // A vertex is emitted for each pixel. There are RowsxCols pixels. Now the inverse convertion is applied
  // The column
	int Pos_x=gl_VertexID % Width;
	// The row
  int Pos_y=gl_VertexID / Width;
  // the pos that will be used to scan the texture
  ivec2 Pos=ivec2(Pos_x,Pos_y);    
      
  // The initial color is black
  vec4 Result_color=vec4(0,0,0,1);          
         
  // Get the normalized color for the sample position
  vec4 Color_normalized_input_image=imageLoad(Input_image_normalized,Pos);
  
  // Check if the alpha value is 0 -> This part is no valid
  if (Color_normalized_input_image.a==0){
		// draw a chessboard texture using the module operator -> quares of size 10
    if (mod(Pos.x,20)<10 && mod(Pos.y,20)<10) Result_color=vec4(1,0,0,1); 
    else Result_color=vec4(0,0,0,1);        
  }          
  else{
		// It is normal color
    compute_minimum_distance(Pos,Probe,Result_color);    
  }          

  // save the result
  imageStore(Result_image,Pos,Result_color);  
} 
)"
