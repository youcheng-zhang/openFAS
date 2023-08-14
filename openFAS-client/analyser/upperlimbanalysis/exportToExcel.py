import sys
sys.path.insert(1, 'pyKinectAzure/')
import pandas as pd
import csv  
import math
from bodyFrame import body_frame
from bodyRecordRead import read_body_skeleton
import postures as postures
from matplotlib import pyplot as plt
from kinectBodyTracker import kinectBodyTracker, _k4abt
from pyKinectAzure import pyKinectAzure, _k4a
from kinematicDataGenerator import calculate_acceleration, calculate_linear_speed

# left hand dot=7
# right hand dot=14
def generate_speed_csv(data, dot, path):
    with open(path+"linearSpeed.csv", 'w', newline='', encoding='UTF8') as f:
        writer = csv.writer(f)
        # write the header
        writer.writerow(["timeStamp","linearSpeed(m/s)"])
        prev_frame = data[0]
        for frame in data:
            x_speed, y_speed, z_speed = calculate_linear_speed(
                frame, prev_frame, dot)
            linearSpeed = math.sqrt(x_speed**2+y_speed**2+z_speed**2) / 500
            writer.writerow([frame.time,linearSpeed])


def generate_acceleration_csv(data, dot, path):
    with open(path+"acceleration.csv", 'w', newline='', encoding='UTF8') as f:
        writer = csv.writer(f)
        # write the header
        writer.writerow(["timeStamp","acc x", "acc y", "acc z", "acc mag"])
        prev_frame = data[0]
        current_frame = data[0]
        for next_frame in data:
            x_acceeration, y_acceeration, z_acceeration = calculate_acceleration(current_frame, prev_frame, next_frame, dot)
            writer.writerow([current_frame.time,x_acceeration/1000,y_acceeration/1000,z_acceeration/1000,math.sqrt((x_acceeration/1000)**2+(y_acceeration/1000)**2+(z_acceeration/1000)**2)])
            prev_frame = current_frame
            current_frame = next_frame



# filename = "C:/Users/xqsxl/Desktop/openFAS-client/analyser/ML/eval_max_speed"
filename = "C:/Users/xqsxl/Desktop/openFAS-client/analyser/ML/eval_acc"
csv_path = "C:/Users/xqsxl/Desktop/openFAS-client/analyser/csv/"
bodydata = read_body_skeleton(filename)
generate_speed_csv(bodydata, 14, csv_path)
generate_acceleration_csv(bodydata, 14, csv_path)