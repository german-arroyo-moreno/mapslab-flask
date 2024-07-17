#include "delaunay.h"

using namespace std;
using namespace _delaunay_triangulator_ns;

bool _delaunay_triangulator::circumcircle(float X_pos,float Y_pos,float X1,float Y1,float X2,float Y2,float X3,float Y3,float &X_center,float &Y_center,float &Radius)
{
  float m1=0;
  float m2=0;
  float X1_m=0;
  float X2_m=0;
  float Y1_m=0;
  float Y2_m=0;
  float dx=0;
  float dy=0;
  float rsqr=0;
  float drsqr=0;

  X_center=0;
  Y_center=0;
  Radius=0;

  // Check for coincident points
  if (fabs(Y1 - Y2) < EPSILON && fabs(Y2 - Y3) < EPSILON) return false;

  if (fabs(Y2-Y1) < EPSILON){
      m2 = - (X3 - X2) / (Y3 - Y2);
      X2_m = (X2 + X3) / 2.0f;
      Y2_m = (Y2 + Y3) / 2.0f;
      X_center = (X2 + X1) / 2.0f;
      Y_center = m2 * (X_center - X2_m) + Y2_m;
  }
  else{
    if (abs(Y3 - Y2) < EPSILON){
      m1 = - (X2 - X1) / (Y2 - Y1);
      X1_m = (X1 + X2) / 2.0f;
      Y1_m = (Y1 + Y2) / 2.0f;
      X_center = (X3 + X2) / 2.0f;
      Y_center = m1 * (X_center - X1_m) + Y1_m;
    }
    else{
      m1 = - (X2 - X1) / (Y2 - Y1);
      m2 = - (X3 - X2) / (Y3 - Y2);
      X1_m = (X1 + X2) / 2.0f;
      X2_m = (X2 + X3) / 2.0f;
      Y1_m = (Y1 + Y2) / 2.0f;
      Y2_m = (Y2 + Y3) / 2.0f;
      X_center = (m1 * X1_m - m2 * X2_m + Y2_m - Y1_m) / (m1 - m2);
      Y_center = m1 * (X_center - X1_m) + Y1_m;
    }
  }

  dx = X2 - X_center;
  dy = Y2 - Y_center;
  rsqr = dx * dx + dy * dy;
  Radius = sqrt(rsqr);
  dx = X_pos - X_center;
  dy = Y_pos - Y_center;
  drsqr = dx * dx + dy * dy;

  if (drsqr<=rsqr) return true;
  else return false;
}

//HEA

vector<_triangle> _delaunay_triangulator::triangulate(vector<_point> Points1)
{
   vector<_triangle> Triangles_final;
   if (Points1.size()<3) return Triangles_final;

   vector<_point> Points=Points1;

   // order the points by x
   std::sort(Points.begin(),Points.end(),[](_delaunay_triangulator_ns::_point &A,_delaunay_triangulator_ns::_point &B){
     return (A.x < B.x) || (A.x == B.x && A.y < B.y);
   });

  deque<std::pair<_triangle,bool>> Triangles;

  // find the maximums for the bounding triangle
  float X_min=1e6;
  float X_max=1e-6;
  float Y_min = 1e6;
  float Y_max = 1e-6;

  for (unsigned int i=0;i<Points.size();i++){
      if (Points[i].x<X_min) X_min=Points[i].x;
      if (Points[i].x>X_max) X_max=Points[i].x;
      if (Points[i].y<Y_min) Y_min=Points[i].y;
      if (Points[i].y>Y_max) Y_max=Points[i].y;
  }

  float X_diff=X_max-X_min;
  float Y_diff=Y_max-Y_min;
  float Max_diff=0;

  if (X_diff>Y_diff) Max_diff=X_diff;
  else Max_diff=Y_diff;

  float X_middle=(X_max+X_min)/2.0f;
  float Y_middle=(Y_max+Y_min)/2.0f;

  // add the 3 points at the end
  int Pos=Points.size();
  Points.push_back(_point(X_middle-20*Max_diff,Y_middle-Max_diff,Pos));
  Points.push_back(_point(X_middle, Y_middle+20*Max_diff,Pos+1));
  Points.push_back(_point(X_middle+20*Max_diff,Y_middle-Max_diff,Pos+2));

  // add the first triangle
  Triangles.push_back({_triangle(Pos,Pos+1,Pos+2),false});

//  int Num_triangles=1;

  // include each point one at a time
  float Xp;
  float Yp;
  float x1;
  float y1;
  float x2;
  float y2;
  float x3;
  float y3;
  bool Inside;
  float X_center;
  float Y_center;
  float Radius;

  for (unsigned int i=0;i<Points.size()-3;i++){
    vector<_edge> Edges;

    Xp=Points[i].x;
    Yp=Points[i].y;

//    cout << "--- Including point=" << i << endl;
//    cout << "x=" << Xp << " y=" << Yp << endl;

//    int Num_edges=0;

    // set up the edge buffer
    // If the point (xp,yp) lies inside the circumcircle then the three edges of that triangle are added to the edge buffer
    // and that triangle is removed.

//    cout << "Num_triangles=" << Triangles.size() << endl;

    // this for not to remove the not used triangles
    for (auto &Triangle:Triangles) Triangle.second=false;

    for (auto &Triangle:Triangles){
      // get the points for the triangle
      x1=Points[Triangle.first.P1].x;
      y1=Points[Triangle.first.P1].y;

      x2 = Points[Triangle.first.P2].x;
      y2 = Points[Triangle.first.P2].y;

      x3 = Points[Triangle.first.P3].x;
      y3 = Points[Triangle.first.P3].y;

      Inside=circumcircle(Xp,Yp,x1,y1,x2,y2,x3,y3,X_center,Y_center,Radius);

//      cout << "Inside=" << Inside << " xc=" << X_center << " yc=" << Y_center << " Radius=" << Radius << endl;

      if (Inside==true){
        Edges.push_back(_edge(Triangle.first.P1,Triangle.first.P2));
        Edges.push_back(_edge(Triangle.first.P2, Triangle.first.P3));
        Edges.push_back(_edge(Triangle.first.P3, Triangle.first.P1));

//        Num_edges=Num_edges+3;
        // mark the triangle to be removed
        Triangle.second=true;
      }
    }

//    cout << "Before " << endl;
//    for (auto Triangle:Triangles){
//      cout << "Triangle P1=" << Triangle.first.P1 << " P2=" << Triangle.first.P2 << " P3=" << Triangle.first.P3 << " Delete=" << Triangle.second << endl;
//    }

    // remove all the marked triangles
    deque<pair<_triangle,bool>>::iterator It=Triangles.begin();
//    deque<pair<_triangle,bool>>::iterator It_next=It1;
    deque<pair<_triangle,bool>>::iterator It_end=Triangles.end();

    while (It!=Triangles.end()){
//      cout << "in DEL Triangle P1=" << (*It).first.P1 << " P2=" << (*It).first.P2 << " P3=" << (*It).first.P3 << " Delete=" << (*It).second << endl;
      if ((*It).second==true){
        // delete
//        cout << "Delete" << endl;
        It=Triangles.erase(It);
      }
      else It=next(It);
    }

//    cout << "After " << endl;
//    for (auto Triangle:Triangles){
//      cout << "Triangle P1=" << Triangle.first.P1 << " P2=" << Triangle.first.P2 << " P3=" << Triangle.first.P3 << " Delete=" << Triangle.second << endl;
//    }

    // Tag multiple edges
    // Note: if all triangles are specified anticlockwise then all interior edges are opposite pointing in direction.

    for (unsigned int j=0;j<Edges.size()-1;j++){
      for (unsigned int k=j+1;k<Edges.size();k++){
        if (Edges[j].P1==Edges[k].P2 && Edges[j].P2==Edges[k].P1){
          Edges[j].P1=-1;
          Edges[j].P2=-1;
          Edges[k].P1=-1;
          Edges[k].P2=-1;
        }
      }
    }

    // Form new triangles for the current point
    // Skipping over any tagged edges.
    // All edges are arranged in clockwise order.

    for (unsigned int j=0;j<Edges.size();j++){
//        cout << "j=" << j << "Edge=" << Edges[j] << endl;
      if (Edges[j].P1<0 || Edges[j].P2<0)
        continue;
      Triangles.push_back({_triangle(Edges[j].P1,Edges[j].P2,i),false});
    }

//    cout << "News " << endl;
//    for (auto Triangle:Triangles){
//      cout << "Triangle P1=" << Triangle.first.P1 << " P2=" << Triangle.first.P2 << " P3=" << Triangle.first.P3 << " Delete=" << Triangle.second << endl;
//    }

  }

  // Remove triangles with supertriangle vertices

  int Max_size=Points.size()-3;
  int P1,P2,P3;
  for (auto Triangle:Triangles){
    if (Triangle.first.P1<Max_size && Triangle.first.P2<Max_size && Triangle.first.P3<Max_size){
      P1=Points[Triangle.first.P1].Position;
      P2=Points[Triangle.first.P2].Position;
      P3=Points[Triangle.first.P3].Position;

      Triangles_final.push_back({P1,P2,P3});
    }
  }

  return Triangles_final;
}
