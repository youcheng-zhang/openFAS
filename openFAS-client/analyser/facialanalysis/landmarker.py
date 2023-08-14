import dlib

class Landmarker(object):

    def __init__(self, predictor_path):
        self.detector = dlib.get_frontal_face_detector()
        self.predictor = dlib.shape_predictor(predictor_path)
        self.dets = None

    def find_average(self, x, y, depth):
        if depth[y][x] == 0:
            left = depth[y][x-1]
            right = depth[y][x+1]
            up = depth[y+1][x]
            down = depth[y-1][x]
            zeroes = 0
            if left == 0:
                zeroes += 1
            if right == 0:
                zeroes += 1
            if up == 0:
                zeroes += 1
            if down == 0:
                zeroes += 1
            
            if zeroes == 4:
                return 0

            ave = (left + right + up + down) / (4 - zeroes)
            return ave
        else:
            return depth[y][x]


    """
    Find the landmarks via the dlib implementation - replace this function in future
    if a better way to find landmarks is implemented
    """
    def find_landmarks(self, img, depth):
        if self.dets == None:
            self.dets = self.detector(img, 1)
        elif len(self.dets) < 1:
            self.dets = self.detector(img, 1)
        
        landmarks = []
        for k, d in enumerate(self.dets):
            shape = self.predictor(img, d)
            # Need to post process the shape as it is c++ obj
            for i in range(0, 68):
                x_val = shape.part(i).x
                y_val = shape.part(i).y

                z_val = depth[y_val][x_val]
                if z_val == 0:
                    z_val = self.find_average(x_val, y_val, depth)

                landmarks.append([x_val, y_val, z_val])
        return landmarks

    """
    Write the landmark values to the database via the rest api
    """
    def write_landmarks(self, landmarks):
        print("Unimplemented")