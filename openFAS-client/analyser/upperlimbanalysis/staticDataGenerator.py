import pandas as pd
from bodyRecordRead import read_body_skeleton, record_upper_limb, play_back
from bodyFrame import body_frame
from bodyRecordRead import read_body_skeleton
import postures
import math
import pickle
from kinectBodyTracker import kinectBodyTracker, _k4abt
from pyKinectAzure import pyKinectAzure, _k4a
import numpy as np
import sys
sys.path.insert(1, 'pyKinectAzure/')


ML_training_datapath = "ML/training_data/"


# calculate angles between 3 input points (index of joint)
def get_angle(body_data, vertex, dot_1, dot_2):
    vertex_xyz = body_data.skeleton.joints[vertex].position.xyz
    dot_1_xyz = body_data.skeleton.joints[dot_1].position.xyz
    dot_2_xyz = body_data.skeleton.joints[dot_2].position.xyz
    a = np.array([vertex_xyz.x - dot_1_xyz.x,
                  vertex_xyz.y - dot_1_xyz.y,
                  vertex_xyz.z - dot_1_xyz.z])
    b = np.array([vertex_xyz.x - dot_2_xyz.x,
                  vertex_xyz.y - dot_2_xyz.y,
                  vertex_xyz.z - dot_2_xyz.z])
    angle_cos = np.dot(a, b)/(math.sqrt(np.dot(a, a))
                              * math.sqrt(np.dot(b, b)))
    angle = np.arccos(angle_cos) * 180/math.pi
    return angle


# calculate the distance between 2 dots
def get_distance(body_data, dot_1, dot_2):
    dot_1_xyz = body_data.skeleton.joints[dot_1].position.xyz
    dot_2_xyz = body_data.skeleton.joints[dot_2].position.xyz
    distance = math.sqrt((dot_1_xyz.x - dot_2_xyz.x)**2
                         + (dot_1_xyz.y - dot_2_xyz.y)**2
                         + (dot_1_xyz.z - dot_2_xyz.z)**2)
    return distance


def get_training_data(mode):
    if mode == postures.R_TOUCH_EAR:
        return get_R_TOUCH_EAR_data(), 11
    elif mode == postures.L_TOUCH_EAR:
        return get_L_TOUCH_EAR_data(), 11
    elif mode == postures.R_TOUCH_KNEE:
        return get_R_TOUCH_KNEE_data(), 14
    elif mode == postures.L_TOUCH_KNEE:
        return get_L_TOUCH_KNEE_data(), 14
    elif mode == postures.R_TOUCH_BACK:
        return get_R_TOUCH_BACK_data(), 11
    elif mode == postures.L_TOUCH_BACK:
        return get_L_TOUCH_BACK_data(), 11
    elif mode == postures.R_RAISE_HAND:
        return get_R_RAISE_HAND_data(), 11
    elif mode == postures.L_RAISE_HAND:
        return get_L_RAISE_HAND_data(), 11


def process_body_data(body_data, mode):
    if mode == postures.R_TOUCH_EAR:
        return process_R_TOUCH_EAR(body_data)
    elif mode == postures.L_TOUCH_EAR:
        return process_L_TOUCH_EAR(body_data)
    elif mode == postures.R_TOUCH_KNEE:
        return process_R_TOUCH_KNEE(body_data)
    elif mode == postures.L_TOUCH_KNEE:
        return process_L_TOUCH_KNEE(body_data)
    elif mode == postures.R_TOUCH_BACK:
        return process_R_TOUCH_BACK(body_data)
    elif mode == postures.L_TOUCH_BACK:
        return process_L_TOUCH_BACK(body_data)
    elif mode == postures.R_RAISE_HAND:
        return process_R_RAISE_HAND(body_data)
    elif mode == postures.L_RAISE_HAND:
        return process_L_RAISE_HAND(body_data)


def process_R_TOUCH_EAR(body_data):
    return_data = []

    # right shoulder and elbow joint angles
    return_data.append(get_angle(body_data, 12, 11, 13))
    return_data.append(get_angle(body_data, 13, 12, 14))

    # distance between chest and neck, used for normalize data
    d = get_distance(body_data, 3, 2)

    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.x - body_data.skeleton.joints[12].position.xyz.x)/d)
    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.y - body_data.skeleton.joints[12].position.xyz.y)/d)
    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.z - body_data.skeleton.joints[12].position.xyz.z)/d)

    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.x - body_data.skeleton.joints[13].position.xyz.x)/d)
    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.y - body_data.skeleton.joints[13].position.xyz.y)/d)
    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.z - body_data.skeleton.joints[13].position.xyz.z)/d)

    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.x - body_data.skeleton.joints[14].position.xyz.x)/d)
    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.y - body_data.skeleton.joints[14].position.xyz.y)/d)
    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.z - body_data.skeleton.joints[14].position.xyz.z)/d)
    return return_data


def process_L_TOUCH_EAR(body_data):
    return_data = []

    # right shoulder and elbow joint angles
    return_data.append(get_angle(body_data, 5, 4, 6))
    return_data.append(get_angle(body_data, 6, 5, 7))

    # distance between chest and neck, used for normalize data
    d = get_distance(body_data, 3, 2)

    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.x - body_data.skeleton.joints[5].position.xyz.x)/d)
    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.y - body_data.skeleton.joints[5].position.xyz.y)/d)
    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.z - body_data.skeleton.joints[5].position.xyz.z)/d)

    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.x - body_data.skeleton.joints[6].position.xyz.x)/d)
    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.y - body_data.skeleton.joints[6].position.xyz.y)/d)
    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.z - body_data.skeleton.joints[6].position.xyz.z)/d)

    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.x - body_data.skeleton.joints[7].position.xyz.x)/d)
    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.y - body_data.skeleton.joints[7].position.xyz.y)/d)
    return_data.append(
        (body_data.skeleton.joints[1].position.xyz.z - body_data.skeleton.joints[7].position.xyz.z)/d)
    return return_data


def process_R_TOUCH_KNEE(body_data):
    return_data = []
    # distance between chest and neck, used for normalize data
    d = get_distance(body_data, 3, 2)
    return_data.append(
        (body_data.skeleton.joints[19].position.xyz.x - body_data.skeleton.joints[14].position.xyz.x)/d)
    return_data.append(
        (body_data.skeleton.joints[19].position.xyz.y - body_data.skeleton.joints[14].position.xyz.y)/d)
    return_data.append(
        (body_data.skeleton.joints[19].position.xyz.z - body_data.skeleton.joints[14].position.xyz.z)/d)
    return process_R_TOUCH_EAR(body_data) + return_data


def process_L_TOUCH_KNEE(body_data):
    return_data = []
    # distance between chest and neck, used for normalize data
    d = get_distance(body_data, 3, 2)
    return_data.append(
        (body_data.skeleton.joints[23].position.xyz.x - body_data.skeleton.joints[7].position.xyz.x)/d)
    return_data.append(
        (body_data.skeleton.joints[23].position.xyz.y - body_data.skeleton.joints[7].position.xyz.y)/d)
    return_data.append(
        (body_data.skeleton.joints[23].position.xyz.z - body_data.skeleton.joints[7].position.xyz.z)/d)
    return process_L_TOUCH_EAR(body_data) + return_data


def process_R_TOUCH_BACK(body_data):
    return process_R_TOUCH_EAR(body_data)


def process_L_TOUCH_BACK(body_data):
    return process_L_TOUCH_EAR(body_data)


def process_R_RAISE_HAND(body_data):
    return process_R_TOUCH_EAR(body_data)


def process_L_RAISE_HAND(body_data):
    return process_L_TOUCH_EAR(body_data)


def get_R_TOUCH_EAR_data():
    column_names = ["shoulder_angle", "elbow_angle", "shoulder_x", "shoulder_y",
                    "shoulder_z", "elbow_x", "elbow_y", "elbow_z", "hand_x", "hand_y", "hand_z", "result"]
    df = pd.DataFrame(columns=[i for i in range(1, 12)])
    R_touch_ear_2 = read_body_skeleton(ML_training_datapath+"R_touch_ear_2")
    R_touch_ear_1 = read_body_skeleton(ML_training_datapath+"R_touch_ear_1")
    UNKNOWN = read_body_skeleton(ML_training_datapath+"UNKNOWN")

    # process R_touch_ear data
    for body_frame in R_touch_ear_2:
        data_list = process_body_data(body_frame.body, postures.R_TOUCH_EAR)
        data_list.append(2)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)

    for body_frame in R_touch_ear_1:
        data_list = process_body_data(body_frame.body, postures.R_TOUCH_EAR)
        data_list.append(1)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)

    for body_frame in UNKNOWN:
        data_list = process_body_data(body_frame.body, postures.R_TOUCH_EAR)
        data_list.append(0)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)
    df = df.set_axis(column_names, axis=1, inplace=False)
    return df


def get_L_TOUCH_EAR_data():
    column_names = ["shoulder_angle", "elbow_angle", "shoulder_x", "shoulder_y",
                    "shoulder_z", "elbow_x", "elbow_y", "elbow_z", "hand_x", "hand_y", "hand_z", "result"]
    df = pd.DataFrame(columns=[i for i in range(1, 12)])
    L_touch_ear_2 = read_body_skeleton(ML_training_datapath+"L_touch_ear_2")
    L_touch_ear_1 = read_body_skeleton(ML_training_datapath+"L_touch_ear_1")
    UNKNOWN = read_body_skeleton(ML_training_datapath+"UNKNOWN")

    # process L_touch_ear data
    for body_frame in L_touch_ear_2:
        data_list = process_body_data(body_frame.body, postures.L_TOUCH_EAR)
        data_list.append(2)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)

    for body_frame in L_touch_ear_1:
        data_list = process_body_data(body_frame.body, postures.L_TOUCH_EAR)
        data_list.append(1)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)

    for body_frame in UNKNOWN:
        data_list = process_body_data(body_frame.body, postures.L_TOUCH_EAR)
        data_list.append(0)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)
    df = df.set_axis(column_names, axis=1, inplace=False)
    return df


def get_R_TOUCH_KNEE_data():
    column_names = ["shoulder_angle", "elbow_angle", "shoulder_x", "shoulder_y", "shoulder_z", "elbow_x",
                    "elbow_y", "elbow_z", "hand_x", "hand_y", "hand_z", "knee_x", "knee_y", "knee_z", "result"]
    df = pd.DataFrame(columns=[i for i in range(1, 14)])
    R_touch_knee_2 = read_body_skeleton(ML_training_datapath+"R_touch_knee_2")
    R_touch_knee_1 = read_body_skeleton(ML_training_datapath+"R_touch_knee_1")
    UNKNOWN = read_body_skeleton(ML_training_datapath+"UNKNOWN")

    # process R_touch_knee data
    for body_frame in R_touch_knee_2:
        data_list = process_body_data(body_frame.body, postures.R_TOUCH_KNEE)
        data_list.append(2)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)

    for body_frame in R_touch_knee_1:
        data_list = process_body_data(body_frame.body, postures.R_TOUCH_KNEE)
        data_list.append(1)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)

    for body_frame in UNKNOWN:
        data_list = process_body_data(body_frame.body, postures.R_TOUCH_KNEE)
        data_list.append(0)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)
    df = df.set_axis(column_names, axis=1, inplace=False)
    return df


def get_L_TOUCH_KNEE_data():
    column_names = ["shoulder_angle", "elbow_angle", "shoulder_x", "shoulder_y", "shoulder_z", "elbow_x",
                    "elbow_y", "elbow_z", "hand_x", "hand_y", "hand_z", "knee_x", "knee_y", "knee_z", "result"]
    df = pd.DataFrame(columns=[i for i in range(1, 14)])
    L_touch_knee_2 = read_body_skeleton(ML_training_datapath+"L_touch_knee_2")
    L_touch_knee_1 = read_body_skeleton(ML_training_datapath+"L_touch_knee_1")
    UNKNOWN = read_body_skeleton(ML_training_datapath+"UNKNOWN")

    # process L_touch_knee data
    for body_frame in L_touch_knee_2:
        data_list = process_body_data(body_frame.body, postures.L_TOUCH_KNEE)
        data_list.append(2)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)

    for body_frame in L_touch_knee_1:
        data_list = process_body_data(body_frame.body, postures.L_TOUCH_KNEE)
        data_list.append(1)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)

    for body_frame in UNKNOWN:
        data_list = process_body_data(body_frame.body, postures.L_TOUCH_KNEE)
        data_list.append(0)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)
    df = df.set_axis(column_names, axis=1, inplace=False)
    return df


def get_R_TOUCH_BACK_data():
    column_names = ["shoulder_angle", "elbow_angle", "shoulder_x", "shoulder_y",
                    "shoulder_z", "elbow_x", "elbow_y", "elbow_z", "hand_x", "hand_y", "hand_z", "result"]
    df = pd.DataFrame(columns=[i for i in range(1, 12)])
    R_touch_back_2 = read_body_skeleton(ML_training_datapath+"R_touch_back_2")
    R_touch_back_1 = read_body_skeleton(ML_training_datapath+"R_touch_back_1")
    UNKNOWN = read_body_skeleton(ML_training_datapath+"UNKNOWN")

    # process R_touch_back data
    for body_frame in R_touch_back_2:
        data_list = process_body_data(body_frame.body, postures.R_TOUCH_BACK)
        data_list.append(2)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)

    for body_frame in R_touch_back_1:
        data_list = process_body_data(body_frame.body, postures.R_TOUCH_BACK)
        data_list.append(1)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)

    for body_frame in UNKNOWN:
        data_list = process_body_data(body_frame.body, postures.R_TOUCH_BACK)
        data_list.append(0)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)
    df = df.set_axis(column_names, axis=1, inplace=False)
    return df


def get_L_TOUCH_BACK_data():
    column_names = ["shoulder_angle", "elbow_angle", "shoulder_x", "shoulder_y",
                    "shoulder_z", "elbow_x", "elbow_y", "elbow_z", "hand_x", "hand_y", "hand_z", "result"]
    df = pd.DataFrame(columns=[i for i in range(1, 12)])
    L_touch_back_2 = read_body_skeleton(ML_training_datapath+"L_touch_back_2")
    L_touch_back_1 = read_body_skeleton(ML_training_datapath+"L_touch_back_1")
    UNKNOWN = read_body_skeleton(ML_training_datapath+"UNKNOWN")

    # process L_TOUCH_BACK data
    for body_frame in L_touch_back_2:
        data_list = process_body_data(body_frame.body, postures.L_TOUCH_BACK)
        data_list.append(2)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)

    for body_frame in L_touch_back_1:
        data_list = process_body_data(body_frame.body, postures.L_TOUCH_BACK)
        data_list.append(1)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)

    for body_frame in UNKNOWN:
        data_list = process_body_data(body_frame.body, postures.L_TOUCH_BACK)
        data_list.append(0)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)
    df = df.set_axis(column_names, axis=1, inplace=False)
    return df


def get_R_RAISE_HAND_data():
    column_names = ["shoulder_angle", "elbow_angle", "shoulder_x", "shoulder_y",
                    "shoulder_z", "elbow_x", "elbow_y", "elbow_z", "hand_x", "hand_y", "hand_z", "result"]
    df = pd.DataFrame(columns=[i for i in range(1, 12)])
    R_raise_hand_2 = read_body_skeleton(ML_training_datapath+"R_raise_hand_2")
    R_raise_hand_1 = read_body_skeleton(ML_training_datapath+"R_raise_hand_1")
    UNKNOWN = read_body_skeleton(ML_training_datapath+"UNKNOWN")

    # process R_raise_hand data
    for body_frame in R_raise_hand_2:
        data_list = process_body_data(body_frame.body, postures.R_RAISE_HAND)
        data_list.append(2)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)

    for body_frame in R_raise_hand_1:
        data_list = process_body_data(body_frame.body, postures.R_RAISE_HAND)
        data_list.append(1)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)

    for body_frame in UNKNOWN:
        data_list = process_body_data(body_frame.body, postures.R_RAISE_HAND)
        data_list.append(0)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)
    df = df.set_axis(column_names, axis=1, inplace=False)
    return df


def get_L_RAISE_HAND_data():
    column_names = ["shoulder_angle", "elbow_angle", "shoulder_x", "shoulder_y",
                    "shoulder_z", "elbow_x", "elbow_y", "elbow_z", "hand_x", "hand_y", "hand_z", "result"]
    df = pd.DataFrame(columns=[i for i in range(1, 12)])
    L_raise_hand_2 = read_body_skeleton(ML_training_datapath+"L_raise_hand_2")
    L_raise_hand_1 = read_body_skeleton(ML_training_datapath+"L_raise_hand_1")
    UNKNOWN = read_body_skeleton(ML_training_datapath+"UNKNOWN")

    # process L_raise_hand data
    for body_frame in L_raise_hand_2:
        data_list = process_body_data(body_frame.body, postures.L_RAISE_HAND)
        data_list.append(2)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)

    for body_frame in L_raise_hand_1:
        data_list = process_body_data(body_frame.body, postures.L_RAISE_HAND)
        data_list.append(1)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)

    for body_frame in UNKNOWN:
        data_list = process_body_data(body_frame.body, postures.L_RAISE_HAND)
        data_list.append(0)
        new_row = pd.DataFrame(np.array(data_list)).T
        df = df.append(new_row)
    df = df.set_axis(column_names, axis=1, inplace=False)
    return df


"""
def process_unnormalized(body_data):
    return_data = []

    # right shoulder and elbow joint angles
    return_data.append(get_angle(body_data, 5, 4, 6))
    return_data.append(get_angle(body_data, 6, 5, 7))

    return_data.append(
        (body_data.skeleton.joints[5].position.xyz.x))
    return_data.append(
        (body_data.skeleton.joints[5].position.xyz.y))
    return_data.append(
        (body_data.skeleton.joints[5].position.xyz.z))

    return_data.append(
        (body_data.skeleton.joints[6].position.xyz.x))
    return_data.append(
        (body_data.skeleton.joints[6].position.xyz.y))
    return_data.append(
        (body_data.skeleton.joints[6].position.xyz.z))

    return_data.append(
        (body_data.skeleton.joints[7].position.xyz.x))
    return_data.append(
        (body_data.skeleton.joints[7].position.xyz.y))
    return_data.append(
        (body_data.skeleton.joints[7].position.xyz.z))
    return return_data


filename = "C:/Users/xqsxl/Desktop/Bpresentation"
#record_upper_limb(filename, 10)
bodydata = read_body_skeleton(filename)
column_names = ["shoulder_angle", "elbow_angle", "shoulder_x", "shoulder_y",
                "shoulder_z", "elbow_x", "elbow_y", "elbow_z", "hand_x", "hand_y", "hand_z"]
results = pd.DataFrame(columns=[i for i in range(1, 11)])
for body_frame in bodydata:
    # data_list = process_L_RAISE_HAND(body_frame.body)
    data_list = process_unnormalized(body_frame.body)
    new_row = pd.DataFrame(np.array(data_list)).T
    results = results.append(new_row)
results = results.set_axis(column_names, axis=1, inplace=False)["hand_x"]
import matplotlib
import matplotlib.pyplot as plt
plt.plot([i for i in range(len(results))], results)
plt.show()

plt.close()
bodydata = read_body_skeleton(filename)
column_names = ["shoulder_angle", "elbow_angle", "shoulder_x", "shoulder_y",
                "shoulder_z", "elbow_x", "elbow_y", "elbow_z", "hand_x", "hand_y", "hand_z"]
results = pd.DataFrame(columns=[i for i in range(1, 11)])
for body_frame in bodydata:
    # data_list = process_L_RAISE_HAND(body_frame.body)
    data_list = process_L_TOUCH_EAR(body_frame.body)
    new_row = pd.DataFrame(np.array(data_list)).T
    results = results.append(new_row)
results = results.set_axis(column_names, axis=1, inplace=False)["hand_x"]
import matplotlib
import matplotlib.pyplot as plt
plt.plot([i for i in range(len(results))], results)

plt.show()
"""