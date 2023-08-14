
import sys
sys.path.insert(1, 'pyKinectAzure/')

import numpy as np
from pyKinectAzure import pyKinectAzure, _k4a
from kinectBodyTracker import kinectBodyTracker, _k4abt
import cv2
import pickle
import math
from bodyFrame import body_frame
from typing import Optional, Tuple
import os
from pyk4a import PyK4APlayback, ImageFormat
import time

# Path to the module
# TODO: Modify with the path containing the k4a.dll from the Azure Kinect SDK
modulePath = 'C:/Program Files/Azure Kinect SDK v1.4.1/sdk/windows-desktop/amd64/release/bin/k4a.dll' 
# under x86_64 linux please use r'/usr/lib/x86_64-linux-gnu/libk4a.so'
# In Jetson please use r'/usr/lib/aarch64-linux-gnu/libk4a.so'

# TODO: Modify with the folder containing the k4a.dll from the Azure Kinect SDK
os.add_dll_directory("C:/Program Files/Azure Kinect SDK v1.4.1/sdk/windows-desktop/amd64/release/bin")

# TODO: Modify with the path containing the k4abt.dll from the Azure Kinect Body Tracking SDK
bodyTrackingModulePath = 'C:/Program Files/Azure Kinect Body Tracking SDK/sdk/windows-desktop/amd64/release/bin/k4abt.dll'


def record_upper_limb(filename, total_time):
	# Initialize the library with the path containing the module
	pyK4A = pyKinectAzure(modulePath)

	# Open device
	pyK4A.device_open()

	# Modify camera configuration
	device_config = pyK4A.config
	device_config.color_resolution = _k4a.K4A_COLOR_RESOLUTION_720P
	device_config.depth_mode = _k4a.K4A_DEPTH_MODE_NFOV_UNBINNED
	#print(device_config)

	# Start cameras using modified configuration
	pyK4A.device_start_cameras(device_config)

	# Initialize the body tracker
	# Note: using LITE mode. Replace the following line with the comment below to get better accuracy
	pyK4A.bodyTracker_start(bodyTrackingModulePath, _k4abt.K4ABT_LITE_MODEL)
	#pyK4A.bodyTracker_start(bodyTrackingModulePath)


	# Start recording
	pyK4A.start_recording(f"{filename}.mkv")

	k = 0
	count = 0
	bodydata=[]
	start_time = time.time()
	while time.time() < start_time + total_time:
		pyK4A.update()
		count += 1
		# Get capture
		#pyK4A.device_get_capture()

		# Get the depth image from the capture
		depth_image_handle = pyK4A.capture_get_depth_image()

        # Check the image has been read correctly
		if depth_image_handle:

			# Perform body detection
			pyK4A.bodyTracker_update()

			# Draw the skeleton
			for body in pyK4A.body_tracker.bodiesNow:
				bodyFrame = body_frame(body,time.time()-start_time)
				bodydata.append(bodyFrame)

			# Release the image
			pyK4A.image_release(depth_image_handle)
			pyK4A.image_release(pyK4A.body_tracker.segmented_body_img)

		pyK4A.capture_release()
		pyK4A.body_tracker.release_frame()

		"""
        # this version display the depth picature and the body skeleton during the recording
        # Check the image has been read correctly
		if depth_image_handle:

			# Perform body detection
			pyK4A.bodyTracker_update()

			# Read and convert the image data to numpy array:
			depth_image = pyK4A.image_convert_to_numpy(depth_image_handle)
			depth_color_image = cv2.convertScaleAbs (depth_image, alpha=0.05)  #alpha is fitted by visual comparison with Azure k4aviewer results 
			depth_color_image = cv2.cvtColor(depth_color_image, cv2.COLOR_GRAY2RGB) 

			# Get body segmentation image
			body_image_color = pyK4A.bodyTracker_get_body_segmentation()

			combined_image = cv2.addWeighted(depth_color_image, 0.8, body_image_color, 0.2, 0)

			# Draw the skeleton
			for body in pyK4A.body_tracker.bodiesNow:
				bodyFrame = body_frame(body,time.time()-start_time)
				bodydata.append(bodyFrame)
				skeleton2D = pyK4A.bodyTracker_project_skeleton(body.skeleton)
				combined_image = pyK4A.body_tracker.draw2DSkeleton(skeleton2D, body.id, combined_image)

			# Overlay body segmentation on depth image
			cv2.imshow('Segmented Depth Image',combined_image)
			k = cv2.waitKey(1)

			# Release the image
			pyK4A.image_release(depth_image_handle)
			pyK4A.image_release(pyK4A.body_tracker.segmented_body_img)

		pyK4A.capture_release()
		pyK4A.body_tracker.release_frame()

		if k==27:    # Esc key to stop
			break
		elif k == ord('q'):
			cv2.imwrite('outputImage.jpg',combined_image)
        """

	with open(filename,"wb") as file:
		pickle.dump(bodydata, file, True)

	pyK4A.device_stop_cameras()
	pyK4A.device_close()
	pyK4A.stop_recording()
	print(f"{count} frames written.")


def read_body_skeleton(filename):
	with open(filename, "rb") as file:
		bodyFrameList =  pickle.load(file)
		# print(f"{len(bodyFrameList)} frames read")
		return bodyFrameList


def convert_to_bgra_if_required(color_format: ImageFormat, color_image):
    # examples for all possible pyk4a.ColorFormats
    if color_format == ImageFormat.COLOR_MJPG:
        color_image = cv2.imdecode(color_image, cv2.IMREAD_COLOR)
    elif color_format == ImageFormat.COLOR_NV12:
        color_image = cv2.cvtColor(color_image, cv2.COLOR_YUV2BGRA_NV12)
    elif color_format == ImageFormat.COLOR_YUY2:
        color_image = cv2.cvtColor(color_image, cv2.COLOR_YUV2BGRA_YUY2)
    return color_image


def colorize(
    image: np.ndarray,
    clipping_range: Tuple[Optional[int], Optional[int]] = (None, None),
    colormap: int = cv2.COLORMAP_HSV,
) -> np.ndarray:
    if clipping_range[0] or clipping_range[1]:
        img = image.clip(clipping_range[0], clipping_range[1])
    else:
        img = image.copy()
    img = cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
    img = cv2.applyColorMap(img, colormap)
    return img


def play_back(filename):
	playback = PyK4APlayback(filename+".mkv")
	playback.open()
	print(f"Record length: {playback.length / 1000000: 0.2f} sec")
	while True:
		try:
			capture = playback.get_next_capture()
			if capture.color is not None:
				cv2.imshow("Color", convert_to_bgra_if_required(playback.configuration["color_format"], capture.color))	
			if capture.depth is not None:
				cv2.imshow("Depth", colorize(capture.depth, (None, 5000)))
			key = cv2.waitKey(10)
			if key != -1:
				break
			time.sleep(0.1)
		except EOFError:
			break
	cv2.destroyAllWindows()
	playback.close()

# time.sleep(5)
# record_upper_limb("C:/Users/xqsxl/Desktop/openFAS-client/analyser/temp", 10)
play_back("C:/Users/xqsxl/Desktop/openFAS-client/analyser/temp")