import math
import numpy as np
import pymongo
import json
from bson.objectid import ObjectId
import os
import pandas as pd
from scipy.signal import savgol_filter


LEFT_OUTER_MOUTH = 48
RIGHT_OUTER_MOUTH = 54

LEFT_OUTER_TOP_EYE = 37
LEFT_OUTER_BOTTOM_EYE = 41
LEFT_INNER_TOP_EYE = 38
LEFT_INNER_BOTTOM_EYE = 40

RIGHT_OUTER_TOP_EYE = 44
RIGHT_OUTER_BOTTOM_EYE = 46
RIGHT_INNER_TOP_EYE = 43
RIGHT_INNER_BOTTOM_EYE = 47


LEFT_INNER_EYE = 39
RIGHT_INNER_EYE = 42

LEFT_EYEBROW_INDEX = 19
RIGHT_EYEBROW_INDEX = 24


class DynamicAnalysis(object):
    
    def __init__(self, all_landmarks):
        self.MONGO_URI=os.getenv("MONGO_URI")

        self.all_landmarks = all_landmarks
        # Assumption that the first frame is going to be the resting frame for now
        self.resting_landmarks = all_landmarks[0]

        # The eyebrow values
        self.l_eyebrow_disp = []
        self.r_eyebrow_disp = []

        # The eye closure values
        self.l_i_eye_disp = []
        self.l_o_eye_disp = []
        self.r_i_eye_disp = []
        self.r_o_eye_disp = []

        # The mouth displacement values
        self.l_mouth_disp = []
        self.r_mouth_disp = []


    def length(self, vector):
        l = math.sqrt((vector[0]*vector[0]) + (vector[1]*vector[1]) + (vector[2]*vector[2]))
        return l

    def normalise(self, landmarks):
        left_inner_eye_dispacement = np.array(self.resting_landmarks[LEFT_INNER_EYE]) - np.array(landmarks[LEFT_INNER_EYE])
        right_inner_eye_displacement = np.array(self.resting_landmarks[RIGHT_INNER_EYE]) - np.array(landmarks[RIGHT_INNER_EYE])    
        return (left_inner_eye_dispacement + right_inner_eye_displacement)/2

    def difference(self, landmarks, part):
        displacement = np.array(self.resting_landmarks[part]) - np.array(landmarks[part])
        return displacement
        

    def eyebrow_displacements(self):

        for landmarks in self.all_landmarks:
            # need to check that the landmarks do not have holes in them
            if 0 in landmarks[LEFT_EYEBROW_INDEX] or 0 in landmarks[RIGHT_EYEBROW_INDEX]:
                continue
            
            # Use the value between middle of eyes to normalise the displacements to account for head movements
            normalising_value = self.normalise(landmarks)

            # calculate the eyebrow displacements
            left_eyebrow_displacement = self.difference(landmarks, LEFT_EYEBROW_INDEX)
            right_eyebrow_displacement = self.difference(landmarks, RIGHT_EYEBROW_INDEX)

            # calculate the magnitudes of the displacements
            left_eyebrow_displacement_length = self.length(left_eyebrow_displacement - normalising_value)
            right_eyebrow_displacement_length = self.length(right_eyebrow_displacement - normalising_value)

            self.l_eyebrow_disp.append(left_eyebrow_displacement_length)
            self.r_eyebrow_disp.append(right_eyebrow_displacement_length)

    def eye_closure(self, landmarks):
        left_inner = np.array(landmarks[LEFT_OUTER_TOP_EYE]) - np.array(landmarks[LEFT_OUTER_BOTTOM_EYE])
        left_outer = np.array(landmarks[LEFT_INNER_TOP_EYE]) - np.array(landmarks[LEFT_INNER_BOTTOM_EYE])
        
        right_inner = np.array(landmarks[RIGHT_INNER_TOP_EYE]) - np.array(landmarks[RIGHT_INNER_BOTTOM_EYE])
        right_outer = np.array(landmarks[RIGHT_OUTER_TOP_EYE]) - np.array(landmarks[RIGHT_OUTER_BOTTOM_EYE])
        
        return left_inner, left_outer, right_inner, right_outer


    def eye_closures(self):

        for landmarks in self.all_landmarks:
            (left_inner, left_outer, right_inner, right_outer) = self.eye_closure(landmarks)

            left_inner_length = self.length(left_inner)
            left_outer_length = self.length(left_outer)
            right_inner_length = self.length(right_inner)
            right_outer_length = self.length(right_outer)


            self.l_i_eye_disp.append(left_inner_length)
            self.l_o_eye_disp.append(left_outer_length)
            self.r_i_eye_disp.append(right_inner_length)
            self.r_o_eye_disp.append(right_outer_length)


    def mouth_displacements(self):
        self.l_mouth_disp = []
        self.r_mouth_disp = []

        for landmarks in self.all_landmarks:
            normalising_value = self.normalise(landmarks)

            left_mouth_displacement = self.difference(landmarks, LEFT_OUTER_MOUTH)
            right_mouth_displacement = self.difference(landmarks, RIGHT_OUTER_MOUTH)

            # calculate the magnitudes of the displacements
            left_mouth_displacement_length = self.length(left_mouth_displacement - normalising_value)
            right_mouth_displacement_length = self.length(right_mouth_displacement - normalising_value)

            self.l_mouth_disp.append(left_mouth_displacement_length)
            self.r_mouth_disp.append(right_mouth_displacement_length)

    def generate_eyebrow_json(self):

        eyebrow_json = {}
        data = []
        lines = ['leftEyebrow', 'rightEyebrow']
        for i in range(0, len(self.l_eyebrow_disp)):
            eyebrow_data = {}
            eyebrow_data['time'] = i
            eyebrow_data['leftEyebrow'] = self.l_eyebrow_disp[i]
            eyebrow_data['rightEyebrow'] = self.r_eyebrow_disp[i]
            data.append(eyebrow_data)

        eyebrow_json['name'] = 'Eyebrow'
        eyebrow_json['xAxisLabel'] = 'Frame'
        eyebrow_json['yAxisLabel'] = 'Displacement'
        eyebrow_json['lines'] = lines
        eyebrow_json['data'] = data

        return eyebrow_json

    def generate_mouth_json(self):
        mouth_json = {}
        data = []
        lines = ['leftMouth', 'rightMouth']
        for i in range(0, len(self.l_mouth_disp)):
            mouth_data = {}
            mouth_data['time'] = i
            mouth_data['leftMouth'] = self.l_mouth_disp[i]
            mouth_data['rightMouth'] = self.r_mouth_disp[i]
            data.append(mouth_data)

        mouth_json['name'] = 'Mouth'
        mouth_json['xAxisLabel'] = 'Frame'
        mouth_json['yAxisLabel'] = 'Displacement'
        mouth_json['lines'] = lines
        mouth_json['data'] = data

        return mouth_json

    def generate_eye_json(self):
        eye_json = {}
        data = []
        lines = ['leftEyeInner','leftEyeOuter', 'rightEyeInner', 'rightEyeOuter']
        for i in range(0, len(self.r_o_eye_disp)):
            eye_data = {}
            eye_data['time'] = i
            eye_data['leftEyeInner'] = self.l_i_eye_disp[i]
            eye_data['leftEyeOuter'] = self.l_o_eye_disp[i]
            eye_data['rightEyeInner'] = self.r_i_eye_disp[i]
            eye_data['rightEyeOuter'] = self.r_o_eye_disp[i]
            data.append(eye_data)

        eye_json['name'] = 'Eye'
        eye_json['xAxisLabel'] = 'Frame'
        eye_json['yAxisLabel'] = 'Eye Closure'
        eye_json['lines'] = lines
        eye_json['data'] = data

        return eye_json

    def write_dynamic_analysis_to_db(self, session_id, movement_id):

        dynamicResults = {}

        dynamicResults['Eyebrow'] = self.generate_eyebrow_json()
        dynamicResults['Mouth'] = self.generate_mouth_json()
        dynamicResults['Eye'] = self.generate_eye_json()
        

        client = pymongo.MongoClient(self.MONGO_URI)
        db = client['openfas']

        db['sessions'].update_one(
            { '_id': ObjectId(session_id) },
            { '$set': { f'dynamicResults.{movement_id}' : dynamicResults } },
        )

        print("uploaded dynamic results")

    def find_outliers(self, data, max_val = 200):
        outliers = []
        for i, point in enumerate(data):
            if point > max_val:
                outliers.append(i)
        return outliers

    def filter_outliers_mouth(self):
        left_outliers = self.find_outliers(self.l_mouth_disp)
        right_outliers = self.find_outliers(self.r_mouth_disp)
        outliers = list(set(left_outliers) | set(right_outliers)) 

        # Get rid of outliers - we want to get rid of the indexes in reverse
        # order otherwise we will end up messing up the later frames
        for outlier in sorted(outliers, reverse=True):
            del self.l_mouth_disp[outlier]
            del self.r_mouth_disp[outlier]
            

    def smooth_mouth(self):
        self.l_mouth_disp = self.smooth_data(self.l_mouth_disp)
        self.r_mouth_disp = self.smooth_data(self.r_mouth_disp)

    def filter_outliers_eyes(self):
        left_inner_outliers = self.find_outliers(self.l_i_eye_disp)
        left_outer_outliers = self.find_outliers(self.l_o_eye_disp)
        right_inner_outliers = self.find_outliers(self.r_i_eye_disp)
        right_outer_outliers = self.find_outliers(self.r_o_eye_disp)

        outliers = list(set(left_inner_outliers) | set(left_outer_outliers) | set(right_inner_outliers) | set(right_outer_outliers)) 

        # Get rid of outliers - we want to get rid of the indexes in reverse
        # order otherwise we will end up messing up the later frames
        for outlier in sorted(outliers, reverse=True):
            del self.l_i_eye_disp[outlier]
            del self.l_o_eye_disp[outlier]
            del self.r_i_eye_disp[outlier]
            del self.r_o_eye_disp[outlier]

    def smooth_eyes(self):
        self.l_i_eye_disp = self.smooth_data(self.l_i_eye_disp)
        self.l_o_eye_disp = self.smooth_data(self.l_o_eye_disp)
        self.r_i_eye_disp = self.smooth_data(self.r_i_eye_disp)
        self.r_o_eye_disp = self.smooth_data(self.r_o_eye_disp)

    def filter_outliers_eyebrows(self):
        left_outliers = self.find_outliers(self.l_eyebrow_disp)
        right_outliers = self.find_outliers(self.r_eyebrow_disp)
        outliers = list(set(left_outliers) | set(right_outliers)) 

        # Get rid of outliers - we want to get rid of the indexes in reverse
        # order otherwise we will end up messing up the later frames
        for outlier in sorted(outliers, reverse=True):
            del self.l_eyebrow_disp[outlier]
            del self.r_eyebrow_disp[outlier]

    def smooth_eyebrows(self):
        self.l_eyebrow_disp = self.smooth_data(self.l_eyebrow_disp)
        self.r_eyebrow_disp = self.smooth_data(self.r_eyebrow_disp)

    def smooth_data(self, data, window_size = 11):
        if len(data) < window_size:
           return data 
        else:
            return savgol_filter(data, 11, 2)


    def perform_analysis(self, session_id, movement_id):
        self.eyebrow_displacements()
        self.mouth_displacements()
        self.eye_closures()

        self.filter_outliers_mouth()
        self.smooth_mouth()

        self.filter_outliers_eyebrows()
        self.smooth_eyebrows()

        self.filter_outliers_eyes()
        self.smooth_eyes()
        

        # # TODO find % movements on each side



        self.write_dynamic_analysis_to_db(session_id, movement_id)