import time
#import pyrealsense2 as rs
import numpy as np
from argparse import ArgumentParser
import os
os.add_dll_directory("C:/Program Files/Azure Kinect SDK v1.4.1/sdk/windows-desktop/amd64/release/bin")
from pyk4a import Config, ImageFormat, PyK4A, PyK4ARecord, PyK4APlayback, connected_device_count
import pyk4a

def data_recording(file):
    return PyK4APlayback(file)

#function not used in entire /analysis folder
"""def data_realtime():
    pipe = rs.pipeline()
    profile = pipe.start()
    return pipe
"""
def data_realtime_record(file, total_time):
    try:
        cnt = connected_device_count()
        if not cnt:
            print("No devices available")
        device = PyK4A()
        device.open()
        print(f"Starting device #{device.serial}")
        config = Config()
        device = PyK4A(config=config, device_id=0)
        device.start()

        print(f"Open record file {file}")
        record = PyK4ARecord(device=device, config=config, path=file)
        record.create()
        start_time = time.time()
        while (time.time()-start_time) < total_time:
            capture = device.get_capture()
            record.write_capture(capture)

        record.flush()
        record.close()
        print(f"{record.captures_count} frames written.")
    except Exception as e:
        print(e)

#function not used in entire /analysis folder
"""def depth_frames(pipe):
    frames = pipe.wait_for_frames()
    depth_frame = frames.get_depth_frame()
    arr = np.asanyarray(depth_frame.get_data())
    width = (depth_frame.get_width())
    height = (depth_frame.get_height())
    return arr, width, height"""