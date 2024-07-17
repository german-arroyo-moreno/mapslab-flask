#ifndef DELAUNAY_TRIANGULATION_H
#define DELAUNAY_TRIANGULATION_H

#include <vector>
#include <deque>
#include <math.h>
#include <iostream>
#include <algorithm>

namespace _delaunay_triangulator_ns {

  const float EPSILON = 0.000001;

  class _triangle{
  public:
    int P1=-1;
    int P2=-1;
    int P3=-1;

    _triangle(int P1a,int P2a,int P3a){
      P1=P1a;
      P2=P2a;
      P3=P3a;
    }
  };

  class _edge{
  public:
    int P1=-1;
    int P2=-1;

    _edge(int P1a,int P2a){
      P1=P1a;
      P2=P2a;
    }
  };

  class _point{
  public:
    float x=0;
    float y=0;
    int Position=-1;

    _point(){}
    _point(float x1,float y1,int Position1){
      x=x1;
      y=y1;
      Position=Position1;
    }
  };

  class _delaunay_triangulator
  {
  public:
    std::vector<_triangle> triangulate(std::vector<_point> Points);
  private:
    bool circumcircle(float X_pos, float Y_pos, float X1, float Y1, float X2, float Y2, float X3, float Y3, float &X_center, float &Y_center, float &Radius);

  };
}




#endif
