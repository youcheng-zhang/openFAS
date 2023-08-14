import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

class StaticAnalysis(object):
    
    def __init__(self, landmarks):
        self.landmarks = landmarks
        self.a = None
        self.b = None
        self.c = None
        self.d = None
        
    def calculate_plane(self):
        # we are going to calculate the equation for plane using normal vector and point
        vector = np.array(self.landmarks[39]) - np.array(self.landmarks[42])
        point = (np.array(self.landmarks[39]) + np.array(self.landmarks[42])) / 2
        
        # a,b,c,d coefficients for the plane as per ax + by + cz + d = 0
        a = vector[0]
        b = vector[1]
        c = vector[2]
        
        if a == 0:
            a = 0.001
        if b == 0:
            b = 0.001
        if c == 0:
            c = 0.001
        
        # calculate d by doing the dot product of the vector and point components
        d = - (a*point[0] + b*point[1] + c*point[2])
        
        self.a = a
        self.b = b
        self.c = c
        self.d = d
    
    def mirror_point(self, point):
        x1 = point[0]
        y1 = point[1]
        z1 = point[2]
        
        assert(self.a != None)
        assert(self.b != None)
        assert(self.c != None)
        assert(self.d != None)
        
        k =(-self.a * x1-self.b * y1-self.c * z1-self.d)/float((self.a * self.a + self.b * self.b + self.c * self.c)) 
        x2 = self.a * k + x1 
        y2 = self.b * k + y1 
        z2 = self.c * k + z1 
        x3 = 2 * x2-x1 
        y3 = 2 * y2-y1
        z3 = 2 * z2-z1
        
        return [x3, y3, z3]
    
    
    def peform_analysis(self):
        # need to initialise the calculating the plane and the planar coefficients first
        self.calculate_plane()
        
        # now need to do mirroring for corresponding points
        left_eyebrow = self.landmarks[17:22]
        left_eye = self.landmarks[36:42]
        left_nose = self.landmarks[31:33]
        left_upper_mouth = self.landmarks[48:51]
        left_bottom_mouth = self.landmarks[58:62] + [self.landmarks[67]]
        left_perimeter = self.landmarks[0:8]

        left_side = left_eyebrow + left_eye + left_nose + left_upper_mouth + left_bottom_mouth + left_perimeter
        mirrored = [self.mirror_point(l) for l in left_side]
        self.mirrored_x = [m[0] for m in mirrored]
        self.mirrored_y = [m[1] for m in mirrored]
        self.normal_x = [l[0] for l in self.landmarks]
        self.normal_y = [l[1] for l in self.landmarks]

    def generate_image(self, filename):
        try:
            # we need to flip y coordinates so things are the right way
            max_y = max(max(self.normal_y), max(self.mirrored_y))        
            normal_y = [max_y - y for y in self.normal_y]
            mirrored_y = [max_y - y for y in self.mirrored_y]

            plt.scatter(self.normal_x, normal_y, c='r', marker='s', label='normal')
            plt.scatter(self.mirrored_x, mirrored_y, c='b', marker='x', label='mirrored')

            plt.legend(loc='upper left')
            plt.axis('scaled')
            fig = matplotlib.pyplot.gcf()
            fig.set_size_inches(6, 6)

            plt.savefig(filename)
        except Exception as e:
            print('Unable to generate static image')
            print(e)

        plt.close()

        
    def write_static_analysis_to_db(self):
        #TODO
        pass