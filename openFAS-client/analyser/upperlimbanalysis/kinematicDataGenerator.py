import sys
from turtle import color
sys.path.insert(1, 'pyKinectAzure/')

import pandas as pd
from filterpy.common import Q_discrete_white_noise
from filterpy.kalman import KalmanFilter
from bodyFrame import body_frame
from postures import get_posture_name_by_index
from bodyRecordRead import read_body_skeleton
from staticDataGenerator import get_angle
import postures as postures
from matplotlib import pyplot as plt
from scipy.signal import medfilt, lfilter
from kinectBodyTracker import kinectBodyTracker, _k4abt
from pyKinectAzure import pyKinectAzure, _k4a
import math
from scipy import stats
import numpy as np
import sys

from numpy.lib.function_base import average


ML_training_datapath = "ML/training_data/"


def calculate_linear_speed(frame, prev_frame, dot):
    time_change = frame.time - prev_frame.time
    x_change = frame.body.skeleton.joints[dot].position.xyz.x - frame.body.skeleton.joints[1].position.xyz.x - \
        prev_frame.body.skeleton.joints[dot].position.xyz.x + \
        prev_frame.body.skeleton.joints[1].position.xyz.x
    y_change = frame.body.skeleton.joints[dot].position.xyz.y - frame.body.skeleton.joints[1].position.xyz.y - \
        prev_frame.body.skeleton.joints[dot].position.xyz.y + \
        prev_frame.body.skeleton.joints[1].position.xyz.y
    z_change = frame.body.skeleton.joints[dot].position.xyz.z - frame.body.skeleton.joints[1].position.xyz.z - \
        prev_frame.body.skeleton.joints[dot].position.xyz.z + \
        prev_frame.body.skeleton.joints[1].position.xyz.z
    if time_change == 0:
        return 0, 0, 0
    else:
        return x_change/time_change, y_change/time_change, z_change/time_change


def calculate_angular_speed(frame, prev_frame, vertex, dot_1, dot_2):
    time_change = frame.time - prev_frame.time
    angle_change = get_angle(frame.body, vertex, dot_1, dot_2) - \
        get_angle(prev_frame.body, vertex, dot_1, dot_2)
    if time_change == 0:
        return 0
    else:
        return abs(angle_change/time_change)


def calculate_acceleration(frame, prev_frame, next_frame, dot):
    time_change = (frame.time - prev_frame.time + next_frame.time - frame.time) / 2
    if time_change == 0 or (frame.time - prev_frame.time) == 0 or (next_frame.time - frame.time) == 0:
        return 0, 0, 0
    x_speed_change = frame.body.skeleton.joints[dot].position.xyz.x - frame.body.skeleton.joints[1].position.xyz.x - \
        prev_frame.body.skeleton.joints[dot].position.xyz.x + \
        prev_frame.body.skeleton.joints[1].position.xyz.x
    y_speed_change = frame.body.skeleton.joints[dot].position.xyz.y - frame.body.skeleton.joints[1].position.xyz.y - \
        prev_frame.body.skeleton.joints[dot].position.xyz.y + \
        prev_frame.body.skeleton.joints[1].position.xyz.y
    z_speed_change = frame.body.skeleton.joints[dot].position.xyz.z - frame.body.skeleton.joints[1].position.xyz.z - \
        prev_frame.body.skeleton.joints[dot].position.xyz.z + \
        prev_frame.body.skeleton.joints[1].position.xyz.z
    return x_speed_change/time_change, y_speed_change/time_change, z_speed_change/time_change


# return the list of outliers in the input data
def z_score_method(data):
    z = np.abs(stats.zscore(data))
    threshold = 5
    outlier = []
    index = 0
    for i, v in enumerate(z[:]):
        if v > threshold:
            outlier.append(i)
        else:
            continue
    return outlier


# return the data list without outliers
def remove_outliers(data):
    outliers = z_score_method(data)
    outliers.reverse()
    #print(f"outliers: {outliers}")
    for o in outliers:
        data.pop(o)
    return data


def data_smoother(data):
    n = 10  # the larger n is, the smoother curve will be
    b = [1.0 / n] * n
    a = 1
    return lfilter(b,a,data)
    return data


def make_kalman_filter(dt, noise_factor):
    kalmanFilter = KalmanFilter(dim_x=6, dim_z=3)
    kalmanFilter.P *= 3
    kalmanFilter.R *= noise_factor**2
    kalmanFilter.F = np.array([[1, 0, 0, dt, 0, 0],
                               [0, 1, 0, 0, dt, 0],
                               [0, 0, 1, 0, 0, dt],
                               [0, 0, 0, 1, 0, 0],
                               [0, 0, 0, 0, 1, 0],
                               [0, 0, 0, 0, 0, 1]], dtype=float)
    kalmanFilter.H = np.array([[1., 0., 0., 0., 0., 0.],
                         [0., 1., 0., 0., 0., 0.],
                         [0., 0., 1., 0., 0., 0.]])
    return kalmanFilter


def kalmanFilter(body_frame_list, jointIndex):
    dt = 0.033
    H_kalman = np.array([[1., 0., 0., 0., 0., 0.],
                         [0., 1., 0., 0., 0., 0.],
                         [0., 0., 1., 0., 0., 0.]])
    kalmanFilter = make_kalman_filter(dt, noise_factor=30)
    results = []
    for frame in body_frame_list:
        x_coordinate = frame.body.skeleton.joints[jointIndex].position.xyz.x
        y_coordinate = frame.body.skeleton.joints[jointIndex].position.xyz.y
        z_coordinate = frame.body.skeleton.joints[jointIndex].position.xyz.z
        z = np.array([[x_coordinate, y_coordinate, z_coordinate]], dtype=float)
        kalmanFilter.predict()
        kalmanFilter.update(z)
        results.append(kalmanFilter.x[0])
        frame.body.skeleton.joints[jointIndex].position.xyz.x = kalmanFilter.x[0]
        frame.body.skeleton.joints[jointIndex].position.xyz.y = kalmanFilter.x[1]
        frame.body.skeleton.joints[jointIndex].position.xyz.z = kalmanFilter.x[2]
    return body_frame_list

def apply_kalman_filter(body_frame_list):
    indexs = [4, 5, 6, 7, 11, 12, 13, 14, 1, 19, 23]
    for index in indexs:
        body_frame_list = kalmanFilter(body_frame_list, index)
    return body_frame_list


# # ======================================================================
# def test_kalman(body_frame_list):
#     jointIndex = 7  # K4ABT_JOINT_WRIST_LEFT
#     # original data
#     original = []
#     for f in body_frame_list:
#         original.append(f.body.skeleton.joints[jointIndex].position.xyz.z)
#     # processed data
#     processed = []
#     processed_frame_list = kalmanFilter(body_frame_list, jointIndex)
#     for f in processed_frame_list:
#         processed.append(f.body.skeleton.joints[jointIndex].position.xyz.z)
#     plt.plot(original, 'g*', processed, 'ro')
#     plt.show()


# filename = "C:/Users/xqsxl/Desktop/openFAS-client/analyser/ML/training_data/L_TOUCH_KNEE_Kinematic/3_1"
# body_frame_list = read_body_skeleton(filename)
# test_kalman(body_frame_list)
# # ======================================================================


# plot the linear and angular data, save the data to the "filename.png"
def plot_kinematic_data(filename, elbow_linear_speed, wrist_linear_speed, elbow_angular_speed, shoulder_angular_speed):
    plt.clf()
    plt.subplot(1, 2, 1)
    plt.plot(elbow_linear_speed, label='elbow speed')
    plt.plot(wrist_linear_speed, label='wrist speed')
    plt.legend()
    plt.subplot(1, 2, 2)
    plt.plot(elbow_angular_speed, label='elbow angular speed')
    plt.plot(shoulder_angular_speed, label='shoulder angular speed')
    plt.legend()
    plt.savefig(filename+'.png')
    # plt.show()


# return speed list of left arm
def get_left_speed(body_frame_list):
    elbow_linear_speed_list = []
    wrist_linear_speed_list = []
    elbow_angular_speed_list = []
    shoulder_angular_speed_list = []
    prev_frame = body_frame_list[0]
    for frame in body_frame_list:
        elbow_x_change, elbow_y_change, elbow_z_change = calculate_linear_speed(
            frame, prev_frame, 6)
        wrist_x_change, wrist_y_change, wrist_z_change = calculate_linear_speed(
            frame, prev_frame, 7)
        elbow_linear_speed_list.append(
            math.sqrt(elbow_x_change**2+elbow_y_change**2+elbow_z_change**2))
        wrist_linear_speed_list.append(
            math.sqrt(wrist_x_change**2+wrist_y_change**2+wrist_z_change**2))
        elbow_angular_speed = calculate_angular_speed(
            frame, prev_frame, 13, 12, 14)
        shoulder_angular_speed = calculate_angular_speed(
            frame, prev_frame, 12, 11, 13)
        elbow_angular_speed_list.append(elbow_angular_speed)
        shoulder_angular_speed_list.append(shoulder_angular_speed)
        prev_frame = frame
    elbow_linear_speed_list = remove_outliers(elbow_linear_speed_list)
    wrist_linear_speed_list = remove_outliers(wrist_linear_speed_list)
    elbow_angular_speed_list = remove_outliers(elbow_angular_speed_list)
    shoulder_angular_speed_list = remove_outliers(shoulder_angular_speed_list)
    return elbow_linear_speed_list[7:], wrist_linear_speed_list[7:], elbow_angular_speed_list[7:], shoulder_angular_speed_list[7:]


# return speed list of right arm
def get_right_speed(body_frame_list):
    elbow_linear_speed_list = []
    wrist_linear_speed_list = []
    elbow_angular_speed_list = []
    shoulder_angular_speed_list = []
    prev_frame = body_frame_list[0]
    for frame in body_frame_list:
        elbow_x_change, elbow_y_change, elbow_z_change = calculate_linear_speed(
            frame, prev_frame, 13)
        wrist_x_change, wrist_y_change, wrist_z_change = calculate_linear_speed(
            frame, prev_frame, 14)
        elbow_linear_speed_list.append(
            math.sqrt(elbow_x_change**2+elbow_y_change**2+elbow_z_change**2))
        wrist_linear_speed_list.append(
            math.sqrt(wrist_x_change**2+wrist_y_change**2+wrist_z_change**2))
        elbow_angular_speed = calculate_angular_speed(
            frame, prev_frame, 6, 5, 7)
        shoulder_angular_speed = calculate_angular_speed(
            frame, prev_frame, 5, 4, 6)
        elbow_angular_speed_list.append(elbow_angular_speed)
        shoulder_angular_speed_list.append(shoulder_angular_speed)
        prev_frame = frame
    # elbow_linear_speed_list = remove_outliers(elbow_linear_speed_list)
    # wrist_linear_speed_list = remove_outliers(wrist_linear_speed_list)
    # elbow_angular_speed_list = remove_outliers(elbow_angular_speed_list)
    # shoulder_angular_speed_list = remove_outliers(shoulder_angular_speed_list)
    return elbow_linear_speed_list[7:], wrist_linear_speed_list[7:], elbow_angular_speed_list[7:], shoulder_angular_speed_list[7:]


# get the peak velocity for left arm
# returns the peak linear/angular velocity (average of 5 largest values)
def get_peak_velocity(data):
    return average(sorted(data, reverse=True)[:5])


# Minimum angle of elbow flexion (angle between the vectors joining the elbow and wrist and the elbow and shoulder)
# Maximum angle in sagittal plane detected (the angle between the vectors joining the shoulder and elbow markers and the vertical vector from the shoulder marker toward the hip)
# correlation between sholder and elbow flexion
def get_left_flexion(body_frame_list):
    elbow_flexion_list = []
    shoulder_flexion_list = []
    for frame in body_frame_list:
        elbow_flexion_angle = get_angle(frame.body, 6, 5, 7)
        elbow_flexion_list.append(elbow_flexion_angle)
        dot_x1_xyz = frame.body.skeleton.joints[5].position.xyz
        dot_x2_xyz = frame.body.skeleton.joints[6].position.xyz
        dot_y1_xyz = frame.body.skeleton.joints[3].position.xyz
        dot_y2_xyz = frame.body.skeleton.joints[2].position.xyz
        a = np.array([dot_x1_xyz.x - dot_x2_xyz.x,
                      dot_x1_xyz.y - dot_x2_xyz.y,
                      dot_x1_xyz.z - dot_x2_xyz.z])
        b = np.array([dot_y1_xyz.x - dot_y2_xyz.x,
                      dot_y1_xyz.y - dot_y2_xyz.y,
                      dot_y1_xyz.z - dot_y2_xyz.z])
        angle_cos = np.dot(a, b)/(math.sqrt(np.dot(a, a))
                                  * math.sqrt(np.dot(b, b)))
        shoulder_flexion_angle = np.arccos(angle_cos) * 180/math.pi
        shoulder_flexion_list.append(shoulder_flexion_angle)
    corr, _ = stats.pearsonr(elbow_flexion_list, shoulder_flexion_list)
    elbow_flexion_list = remove_outliers(elbow_flexion_list)
    shoulder_flexion_list = remove_outliers(shoulder_flexion_list)
    elbow_flexion = average(sorted(elbow_flexion_list, reverse=False)[:5])
    shoulder_flexion = average(sorted(shoulder_flexion_list, reverse=True)[:5])
    return elbow_flexion, shoulder_flexion, corr


def get_right_flexion(body_frame_list):
    elbow_flexion_list = []
    shoulder_flexion_list = []
    for frame in body_frame_list:
        elbow_flexion_angle = get_angle(frame.body, 13, 12, 14)
        elbow_flexion_list.append(elbow_flexion_angle)
        dot_x1_xyz = frame.body.skeleton.joints[12].position.xyz
        dot_x2_xyz = frame.body.skeleton.joints[13].position.xyz
        dot_y1_xyz = frame.body.skeleton.joints[3].position.xyz
        dot_y2_xyz = frame.body.skeleton.joints[2].position.xyz
        a = np.array([dot_x1_xyz.x - dot_x2_xyz.x,
                      dot_x1_xyz.y - dot_x2_xyz.y,
                      dot_x1_xyz.z - dot_x2_xyz.z])
        b = np.array([dot_y1_xyz.x - dot_y2_xyz.x,
                      dot_y1_xyz.y - dot_y2_xyz.y,
                      dot_y1_xyz.z - dot_y2_xyz.z])
        angle_cos = np.dot(a, b)/(math.sqrt(np.dot(a, a))
                                  * math.sqrt(np.dot(b, b)))
        shoulder_flexion_angle = np.arccos(angle_cos) * 180/math.pi
        shoulder_flexion_list.append(shoulder_flexion_angle)
    corr, _ = stats.pearsonr(elbow_flexion_list, shoulder_flexion_list)
    elbow_flexion_list = remove_outliers(elbow_flexion_list)
    shoulder_flexion_list = remove_outliers(shoulder_flexion_list)
    elbow_flexion = average(sorted(elbow_flexion_list, reverse=False)[:5])
    shoulder_flexion = average(sorted(shoulder_flexion_list, reverse=True)[:5])
    return elbow_flexion, shoulder_flexion, corr


# process the kinematic data (smooth, get peak velocity, shoulder flexion, elbow extension, correlation)
def process_kinematic_data(body_frame_list, mode, filename):
    return_data = []
    body_frame_list = apply_kalman_filter(body_frame_list)
    if mode in [postures.R_TOUCH_EAR, postures.R_TOUCH_KNEE, postures.R_TOUCH_BACK, postures.R_RAISE_HAND]:
        shoulder_flexion, elbow_extension, corr = get_right_flexion(
            body_frame_list)
        elbow_linear_speed, wrist_linear_speed, elbow_angular_speed, shoulder_angular_speed = get_right_speed(
            body_frame_list)
    else:
        shoulder_flexion, elbow_extension, corr = get_left_flexion(
            body_frame_list)
        elbow_linear_speed, wrist_linear_speed, elbow_angular_speed, shoulder_angular_speed = get_left_speed(
            body_frame_list)
    elbow_linear_speed = data_smoother(elbow_linear_speed)
    wrist_linear_speed = data_smoother(wrist_linear_speed)
    elbow_angular_speed = data_smoother(elbow_angular_speed)
    shoulder_angular_speed = data_smoother(shoulder_angular_speed)
    plot_kinematic_data(filename, elbow_linear_speed, wrist_linear_speed,
                        elbow_angular_speed, shoulder_angular_speed)
    return_data.append(shoulder_flexion)
    return_data.append(elbow_extension)
    return_data.append(corr)
    return_data.append(get_peak_velocity(elbow_linear_speed))
    return_data.append(get_peak_velocity(wrist_linear_speed))
    return_data.append(get_peak_velocity(elbow_angular_speed))
    return_data.append(get_peak_velocity(shoulder_angular_speed))
    return return_data


def get_training_data(mode, filename):
    df = pd.DataFrame(columns=[i for i in range(8)])
    for score in range(3):
        for case in range(20):
            bodydata = read_body_skeleton(
                f"{ML_training_datapath}{get_posture_name_by_index(mode)}_Kinematic/{case}_{score}")
            data_list = process_kinematic_data(bodydata, mode, filename)
            data_list.append(score)
            # print(data_list)
            new_row = pd.DataFrame(np.array(data_list)).T
            df = df.append(new_row)
    column_names = ["shoulder_flexion", "elbow_extension", "correlation", "peak_elbow_linear",
                    "peak_wrist_linear", "peak_elbow_angular", "peak_elbow_angular", "result"]
    df = df.set_axis(column_names, axis=1, inplace=False)
    return df


"""from bodyRecordRead import read_body_skeleton, record_upper_limb, play_back
record_upper_limb(ML_training_datapath+"L_RAISE_HAND_Kinematic/10_1", 15)
record_upper_limb(ML_training_datapath+"L_RAISE_HAND_Kinematic/11_1", 15)
record_upper_limb(ML_training_datapath+"L_RAISE_HAND_Kinematic/12_1", 15)
record_upper_limb(ML_training_datapath+"L_RAISE_HAND_Kinematic/13_1", 15)
record_upper_limb(ML_training_datapath+"L_RAISE_HAND_Kinematic/14_1", 15)
record_upper_limb(ML_training_datapath+"L_RAISE_HAND_Kinematic/15_1", 15)
record_upper_limb(ML_training_datapath+"L_RAISE_HAND_Kinematic/16_1", 15)
record_upper_limb(ML_training_datapath+"L_RAISE_HAND_Kinematic/17_1", 15)
record_upper_limb(ML_training_datapath+"L_RAISE_HAND_Kinematic/18_1", 15)
record_upper_limb(ML_training_datapath+"L_RAISE_HAND_Kinematic/19_1", 15)"""


# # print observed speed of kalman filter
# filename = "C:/Users/xqsxl/Desktop/openFAS-client/analyser/ML/training_data/L_TOUCH_KNEE_Kinematic/3_1"
# #record_upper_limb(filename, 10)
# bodydata = read_body_skeleton(filename)
# for frame in bodydata:
#     frame.body.skeleton.joints[1].position.xyz.x = 100
# plt_filename = "C:/Users/xqsxl/Desktop/openFAS-client/analyser/plt"
# bodydata_processed = apply_kalman_filter(bodydata)
# d = []
# for frame in bodydata_processed:
#     d.append(frame.body.skeleton.joints[1].position.xyz.x)
# plt.clf()
# plt.plot(d, label='observed speed')
# plt.legend()
# plt.show



# # print right elbow x-axis speed
# from bodyRecordRead import read_body_skeleton, record_upper_limb, play_back
# filename = "C:/Users/xqsxl/Desktop/openFAS-client/analyser/ML/eval_speed"
# record_upper_limb(filename, 10)
# bodydata = read_body_skeleton(filename)
# #bodydata_processed = apply_kalman_filter(bodydata)
# elbow_linear_speed, wrist_linear_speed, elbow_angular_speed, shoulder_angular_speed = get_right_speed(
#             bodydata)
# prev_frame = None
# speed = []
# for frame in bodydata:
#     if prev_frame != None:
#         time_change = frame.time - prev_frame.time
#         x_change = frame.body.skeleton.joints[14].position.xyz.x - frame.body.skeleton.joints[1].position.xyz.x - \
#             prev_frame.body.skeleton.joints[14].position.xyz.x + \
#             prev_frame.body.skeleton.joints[1].position.xyz.x
#         speed.append(x_change/time_change)
#     prev_frame = frame

# plt.clf()
# plt.plot(speed, label='observed speed')
# plt.legend()
# plt.show()



# # speed evaluation
# from bodyRecordRead import record_upper_limb
# import time
# filename = "C:/Users/xqsxl/Desktop/openFAS-client/analyser/ML/eval_acc"
# time.sleep(5)
# record_upper_limb(filename, 7)
# bodydata = read_body_skeleton(filename)
# elbow_linear_speed_list, wrist_linear_speed_list, elbow_angular_speed_list, shoulder_angular_speed_list = get_right_speed(bodydata)
# r = [i/500 for i in wrist_linear_speed_list]
# print(max(r))
# plt.clf()
# plt.plot(real, label='expected speed',color="orange")
# plt.legend()
# plt.show()