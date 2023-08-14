from bodyRecordRead import read_body_skeleton, record_upper_limb, play_back
from kinematicDataGenerator import process_kinematic_data
from postureClassifier import posture_classifier
from staticDataGenerator import process_body_data
from postures import get_posture_name_by_index
from bodyFrame import body_frame
from matplotlib import pyplot as plt
from bson.objectid import ObjectId
import pymongo
import os
import time
import pandas as pd
import math
import pickle
import cv2
from kinectBodyTracker import kinectBodyTracker, _k4abt
from pyKinectAzure import pyKinectAzure, _k4a
import numpy as np
import sys
sys.path.insert(1, 'pyKinectAzure/')


static_module_filename = "ML/ML_static_module"
dynamic_module_filename = "ML/ML_dynamic_module"

# Path to the module
# TODO: Modify with the path containing the k4a.dll from the Azure Kinect SDK
modulePath = 'C:\\Program Files\\Azure Kinect SDK v1.4.1\\sdk\\windows-desktop\\amd64\\release\\bin\\k4a.dll'
bodyTrackingModulePath = 'C:\\Program Files\\Azure Kinect Body Tracking SDK\\sdk\\windows-desktop\\amd64\\release\\bin\\k4abt.dll'
# under x86_64 linux please use r'/usr/lib/x86_64-linux-gnu/libk4a.so'
# In Jetson please use r'/usr/lib/aarch64-linux-gnu/libk4a.so'


class ULanalyzer(object):

    def __init__(self, posture, data) -> None:
        super().__init__()
        self.MONGO_URI = os.getenv("MONGO_URI")
        self.posture = posture
        self.data = data
        self.postureClassifier = None
        self.kinematicClassifier = None

        with open(static_module_filename, "rb") as file:
            postureClassifier = pickle.load(file)
            self.postureClassifier = postureClassifier
        if self.postureClassifier is None:
            print("Fail to load the postureClassifier")

        with open(dynamic_module_filename, "rb") as file:
            kinematicClassifier = pickle.load(file)
            self.kinematicClassifier = kinematicClassifier
        if self.kinematicClassifier is None:
            print("Fail to load the kinematicClassifier")

    # get the posture score for each body frame
    def get_posture_score(self, bodyFrame, posture):
        body_data = process_body_data(bodyFrame.body, posture)
        if not body_data:
            return 0
        test_row = pd.DataFrame(np.array(body_data)).T
        return self.postureClassifier.get_classifier(posture).predict(test_row)[0]

    # get the final static score for the recording
    def get_static_score(self, bodyFrameList, posture):
        if (len(bodyFrameList) < 2):
            return 0
        static_score_list = []  # list of scores for each frame
        for bodyFrame in bodyFrameList:
            static_score_list.append(
                self.get_posture_score(bodyFrame, posture))
        # return the maximun of the list which occurs in at least 5 consective frames
        # return static_score_list
        consective_count = 1
        previous = -1
        one_score = False
        two_score = False
        for score in static_score_list:
            if previous == score:
                consective_count += 1
            else:
                if consective_count >= 5:
                    if previous == 1:
                        one_score = True
                    elif previous == 2:
                        two_score = True
                previous = score
                consective_count = 1
        if two_score == True:
            return 2
        elif one_score == True:
            return 1
        return 0

    def get_dynamic_score(self, bodyFrameList, posture, filename):
        if (len(bodyFrameList) < 2):
            return 0
        posture = int(posture)
        body_data = process_kinematic_data(bodyFrameList, posture, filename)
        test_row = pd.DataFrame(np.array(body_data)).T
        return self.kinematicClassifier.get_classifier(posture).predict(test_row)[0]

    def perform_analysis(self, filename, session_id, movement_id):
        self.static_score = self.get_static_score(self.data, self.posture)
        self.dynamic_score = self.get_dynamic_score(
            self.data, self.posture, filename)
        # self.write_analysis_to_db(session_id, movement_id)
        return self.static_score, self.dynamic_score

    def write_analysis_to_db(self, session_id, movement_id, filename):
        ULResult = {}
        ULResult['static'] = str(self.static_score)
        ULResult['dynamic'] = str(self.dynamic_score)
        ULResult['name'] = str(get_posture_name_by_index(movement_id))
        ULResult['id'] = str(movement_id)
        ULResult['maxStatic'] = str(2)
        ULResult['maxDynamic'] = str(2)
        ULResult['recordingURL'] = os.getcwd().replace("\\", "/") + \
            '/'+filename+'.mkv'
        ULResult['imageURL'] = os.getcwd().replace("\\", "/") + \
            '/'+filename+'.png'

        client = pymongo.MongoClient(os.getenv("MONGO_URI"))
        db = client['openfas']
        session = db['ulsessions'].find_one(
            {'_id': ObjectId(session_id)})

        # update maximun score if len(session['ULResults'])!=movement_id
        maxScore = 0
        if (len(session['ULResults']) != movement_id):
            maxScore = int(session['maximunScore']) + 4
        else:
            maxScore = int(session['maximunScore'])

        # update maximunDynamicScore
        maxDynamicScore = 0
        if (len(session['ULResults']) != movement_id):
            maxDynamicScore = int(session['maximunDynamicScore']) + 2
        else:
            maxDynamicScore = int(session['maximunDynamicScore'])

        # update maximunStaticScore
        maxStaticScore = 0
        if (len(session['ULResults']) != movement_id):
            maxStaticScore = int(session['maximunStaticScore']) + 2
        else:
            maxStaticScore = int(session['maximunStaticScore'])

        # update score
        score = 0
        if (len(session['ULResults']) != movement_id):
            score = int(session['score']) + \
                self.static_score + self.dynamic_score
        else:
            ULResults = session['ULResults'][str(movement_id)]
            prev_static_score = int(ULResults["static"])
            prev_dynamic_score = int(ULResults["dynamic"])
            score = int(session['score']) + self.static_score + \
                self.dynamic_score - prev_static_score - prev_dynamic_score

        # update  staticScore
        staticScore = 0
        try:
            if (len(session['ULResults']) != movement_id):
                staticScore = int(session['staticScore']) + self.static_score
            else:
                ULResults = session['ULResults'][str(movement_id)]
                staticScore = int(session['staticScore']) + \
                    self.static_score - int(ULResults["static"])
        except:
            staticScore = int(session['staticScore']) + self.static_score

        # update  staticScore
        dynamicScore = 0
        try:
            if (len(session['ULResults']) != movement_id):
                dynamicScore = int(
                    session['dynamicScore']) + self.dynamic_score
            else:
                ULResults = session['ULResults'][str(movement_id)]
                dynamicScore = int(
                    session['dynamicScore']) + self.dynamic_score - int(ULResults["dynamic"])
        except:
            dynamicScore = int(session['dynamicScore']) + self.dynamic_score

        db['ulsessions'].update_one(
            {'_id': ObjectId(session_id)},
            {'$set':
                {
                    f'ULResults.{movement_id}': ULResult,
                    'maximunScore': str(maxScore),
                    'score': str(score),
                    'maximunStaticScore': str(maxStaticScore),
                    'staticScore': str(staticScore),
                    'maximunDynamicScore': str(maxDynamicScore),
                    'dynamicScore': str(dynamicScore)
                }
             },
        )
        print("uploaded analysis results")
