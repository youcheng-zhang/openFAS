import dlib
import cv2
from PIL import Image, ImageDraw
import numpy as np

class VideoMaker(object):

    """
    path : blah.mp4
    height : 720
    width : 1280
    """

    def __init__(self, outputpath, width=1280, height=720):
        try:
            self.outputpath = outputpath
            size = (width,height)
            self.out = cv2.VideoWriter(outputpath, cv2.VideoWriter_fourcc(*'mp4v'), 30, size)
        except Exception as e:
            print(e)

    def add_frame(self, img):
        try:
            rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            self.out.write(rgb_img)
        except Exception as e:
            print(e)

    def add_landmark_frame(self, img, landmarks):
        try:
            # need to write the landmarks onto the im
            if landmarks:
                im = Image.fromarray(img)
                draw = ImageDraw.Draw(im)
                for i, value in enumerate(landmarks):
                    draw.text((value[0], value[1]), str(i), fill=(255,255,255,255))
                    draw.point((value[0], value[1]), fill=(255,255,255,255))
                
                img = np.array(im)
                rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                self.out.write(rgb_img)
            else:
                rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                self.out.write(rgb_img)
        except Exception as e:
            print(e)


    def close(self):
        try:
            self.out.release()
        except Exception as e:
            print(e)
