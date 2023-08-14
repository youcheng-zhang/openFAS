from logging import error
from flask import Flask, request
import time
import numpy as np
import pymongo
import pyrealsense2 as rs
import os
from PIL import Image, ImageDraw, ImageFont
from dotenv import load_dotenv
from celery import Celery
import celeryconfig
import shutil

import sys
sys.path.append('upperlimbanalysis/')

import facialanalysis.dataproducer as dataproducer
from facialanalysis.landmarker import Landmarker
from facialanalysis.videomaker import VideoMaker
from facialanalysis.dynamic import DynamicAnalysis
from facialanalysis.static import StaticAnalysis
from upperlimbanalysis.bodyRecordRead import record_upper_limb, read_body_skeleton
from upperlimbanalysis.ULanalyzer import ULanalyzer
from upperlimbanalysis.bodyFrame import body_frame
from upperlimbanalysis.postureClassifier import posture_classifier

load_dotenv()

def generate_filename(session_id, movement_id):
    return "ULresources/" + session_id + "/" + movement_id + "/recording"

def generate_bag_filename(session_id, movement_id):
    return "resources/" + session_id + "/" + movement_id + "/rgbd.bag"

def generate_mp4_filename(session_id, movement_id):
    return "resources/" + session_id + "/" + movement_id + "/rgb.mp4"

def generate_mp4_landmarked_filename(session_id, movement_id):
    return "resources/" + session_id + "/" + movement_id + "/rgb_landmarked.mp4"

def cleanup():
    try:
        client = pymongo.MongoClient(os.getenv("MONGO_URI"))
        db = client['openfas']
        ULsessions = db['ulsessions'].find({})
        current_ULsessions = ["movement_recordings"]
        for x in ULsessions:
            current_ULsessions.append(str(x["_id"]))
        all_ULsessions = os.listdir(os.getcwd()+"/ULresources")
        for session in all_ULsessions:
            if session not in current_ULsessions:
                shutil.rmtree(os.getcwd()+"/ULresources/"+session)
        sessions = db['sessions'].find({})
        current_sessions = ["movement_recordings"]
        for x in sessions:
            current_sessions.append(str(x["_id"]))
        all_sessions = os.listdir(os.getcwd()+"/resources")
        for session in all_sessions:
            if session not in current_sessions:
                shutil.rmtree(os.getcwd()+"/resources/"+session)
    except error as e:
        print("Error: %s - %s." % (e.filename, e.strerror))
        

app = Flask(__name__, static_folder='resources')
app.config['CELERY_BROKER_URL'] = os.getenv("REDIS_URI")
app.config['CELERY_RESULT_BACKEND'] = os.getenv("REDIS_URI")

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'],)
celery.conf.update(app.config)
celery.config_from_object(celeryconfig)


@celery.task(serializer='pickle')
def dynamic_analysis_task(landmarks, session_id, movement_id):
    da = DynamicAnalysis(landmarks)
    da.perform_analysis(session_id, movement_id)

@celery.task(serializer='pickle')
def static_analysis_task(landmarks, filename):
    sa = StaticAnalysis(landmarks)
    sa.peform_analysis()
    sa.generate_image(filename)


@app.route('/record', methods = ['POST'])
def record():
    data = request.get_json()

    if 'time' in data:
        total_time = float(data['time'])
    else:
        return "Must specify time parameter in body", 400

    if 'sessionid' in data:
        session_id = data['sessionid']
    else:
        return "Must specify time sessionid in body", 400
    
    if 'movementid' in data:
        movement_id = data['movementid']
    else:
        return "Must specify time movementid in body", 400

    #TODO: delete
    time.sleep(1)
    return "done"


    # try create the resources directory
    os.makedirs("resources", exist_ok=True)
    # need to create the session id directory if it does not already exist
    os.makedirs("resources/" + session_id , exist_ok=True)
    # likewise need to do the movement id directory
    os.makedirs("resources/" + session_id + "/" + movement_id, exist_ok=True)


    filename = generate_bag_filename(session_id, movement_id)

    record_file(filename, total_time = total_time, retry = 2)
    return "done"

def record_file(filename, total_time, retry = 2):
    try:
        dataproducer.data_realtime_record(filename, total_time)
    except Exception as e:
        print(e)
        if retry != 0:
            print("Unable to start recording, retry:", retry)
            record_file(filename, total_time, retry-1)
        else:
            print("Unable to start recording")



@app.route('/process', methods = ['POST'])
def process():
    
    #TODO: delete
    return "done! Processed frames: " , 200

    landmarker = Landmarker('model/shape_predictor_68_face_landmarks.dat')

    data = request.get_json()

    if 'sessionid' in data:
        session_id = data['sessionid']
    else:
        return "Must specify time sessionid in body", 400
    
    if 'movementid' in data:
        movement_id = data['movementid']
    else:
        return "Must specify time movementid in body", 400

    print("args: ", session_id, movement_id)

    filename = generate_bag_filename(session_id, movement_id)
    # check if file exists - if it doesn't throw error back to user
    if not os.path.exists(filename):
        return "This session id and movement id combination has not been recorded", 400

    mp4filename = generate_mp4_filename(session_id, movement_id)

    try:
        #pipe, color_height, color_width, depth_height, depth_width = dataproducer.data_recording(filename)
        playback = dataproducer.data_recording(filename)
    except Exception as e:
        print("error creating pipe:", e)
        return "Error creating pipe", 400

    playback.open()
    playback.seek(int(1 * 1000000))
    capture = playback.get_next_capture()
    total_frames = 0

    vm = VideoMaker(mp4filename, width=capture.depth.shape[0], height=capture.depth.shape[1])
    vm_landmark = VideoMaker(generate_mp4_landmarked_filename(session_id, movement_id), width=capture.depth.shape[0], height=capture.depth.shape[1] )

    all_landmarks = []
    all_img = []

    complete_frames = 0
    while True:
        try:
            capture = playback.get_next_capture()

            color_frame = capture.color
            depth_frame = capture.depth
            if (color_frame is None) or (color_frame is None):
                continue
            depth = np.asanyarray(depth_frame)
            img = np.asanyarray(color_frame[:, :, 2::-1])

            landmarks = landmarker.find_landmarks(img, depth)

            # Only want to do analysis if there were actually landmarks for the frame
            if len(landmarks) > 0:
                all_landmarks.append(landmarks)
                # TODO perhaps think of a more memory efficient way of doing this
                all_img.append(img)
                total_frames += 1

            vm.add_frame(img)
            vm_landmark.add_landmark_frame(img, landmarks)
            complete_frames += 1
            
        except Exception as e:
            print(e)
            break

    if complete_frames < 1:
        return "Unable to get feed", 400

    # Cleanup!
    playback.close()
    vm.close()

    if len(all_landmarks) == 0:
        return "Unable to landmark, no results made", 400

    # Perform the dynamic analysis
    da = DynamicAnalysis(all_landmarks)
    da.perform_analysis(session_id, movement_id)
    #dynamic_analysis_task.delay(all_landmarks, session_id, movement_id)

    # Only do static analysis if the file doesn't already exist
    # TODO: Is using the first frame reliable?
    try:
        filename = "resources/" + session_id + "/static.png"
        if not os.path.exists(filename):
            # print("DID STATIC")
            sa = StaticAnalysis(all_landmarks[0])
            sa.peform_analysis()
            sa.generate_image(filename)
            #static_analysis_task.delay(all_landmarks[0], filename)
    except Exception as e:
        print(e)
        return 'Unable to generate static analysis image', 400        

    return "done! Processed frames: " + str(total_frames), 200


@app.route('/ULrecord', methods = ['POST'])
def ULrecord():
    data = request.get_json()

    if 'time' in data:
        total_time = float(data['time'])
    else:
        total_time = 15

    if 'sessionid' in data:
        session_id = data['sessionid']
    else:
        return "Must specify time sessionid in body", 400
    
    if 'movementid' in data:
        movement_id = data['movementid']
    else:
        return "Must specify time movementid in body", 400


    # try create the ULresources directory
    os.makedirs("ULresources", exist_ok=True)
    # need to create the session id directory if it does not already exist
    os.makedirs("ULresources/" + session_id , exist_ok=True)
    # likewise need to do the movement id directory
    os.makedirs("ULresources/" + session_id + "/" + str(movement_id), exist_ok=True)


    filename = generate_filename(session_id, str(movement_id))

    record_upper_limb(filename, total_time)

    return "done"
    

@app.route('/ULprocess', methods = ['POST'])
def ULprocess():
    data = request.get_json()

    if 'sessionid' in data:
        session_id = data['sessionid']
    else:
        return "Must specify the sessionid in body", 400
    
    if 'movementid' in data:
        movement_id = data['movementid']
    else:
        return "Must specify the movementid in body", 400

    filename = generate_filename(session_id, str(movement_id))
    # check if file exists - if it doesn't throw error back to user
    if not os.path.exists(filename):
        return "This session id and movement id combination has not been recorded", 400

    bodydata = read_body_skeleton(filename)
    analyzer = ULanalyzer(int(movement_id), bodydata)
    static_score, dynamic_score = analyzer.perform_analysis(filename, session_id, movement_id)
    analyzer.write_analysis_to_db(session_id, movement_id, filename)
    return f"static_score: {static_score}\n dynamic_score: {dynamic_score}", 200


if __name__ == '__main__':
    if not os.getenv("FRAME_TIMEOUT"):
        print("MUST INCLUDE FRAME_TIMEOUT IN ENV")
        exit(1)

    # delete cache and outdated resources before starting the server
    cleanup()

    app.run(debug=True, port=os.getenv("PORT_NUMBER"), threaded=True)
