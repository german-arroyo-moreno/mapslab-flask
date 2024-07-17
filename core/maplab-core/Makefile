BIN=maplab-core.bin

CXX=g++

SOURCES=src/color_map.cc src/pigment_data.cc src/color_bar_abstract.cc src/color_bar_interpolation.cc src/color_bar_sections.cc src/shaders.cc src/layer_data.cc src/image_IO.cc src/layer.cc src/layer_map.cc src/layer_map_distance.cc src/palette_data.cc src/file_interpreted_txt.cc src/file_csv.cc src/file_io.cc src/file_colors_txt.cc src/delaunay.cc src/qcolor.cc src/main.cc

INC=-I/usr/include/opencv4/opencv2/ -I/usr/include/opencv4/ -I./glew-2.1.0/include

LIB= -lGLEW -L ./glew-2.1.0/lib -lGL -lEGL -lopencv_core -lopencv_highgui -lopencv_imgproc -lopencv_imgcodecs

all: $(SOURCES)
	$(CXX) -o $(BIN) $(INC) $(SOURCES) $(LIB)
