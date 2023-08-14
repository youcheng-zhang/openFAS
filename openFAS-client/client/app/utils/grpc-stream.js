import { series } from 'async';
import { delay, random } from 'lodash';

export default class GrpcStream {
  static setupRGBStream(client, callback) {
    var call = client.RGBRoute();

    call.on('data', note => {
      console.log('Got message "', note);
    });

    call.on('end', callback);

    return call;
  }

  static setupDepthStream(client, callback) {
    var call = client.DepthRoute();

    call.on('data', note => {
      console.log('Got message "', note);
    });

    call.on('end', callback);

    return call;
  }

  static closeRGBStream(call) {
    call.end();
  }

  static closeDepthStream(call) {
    call.end();
  }

  static sendDepthFrame(
    call,
    exerciseName,
    frameNumber,
    frameHeight,
    frameWidth,
    depthData
  ) {
    console.log('SENDING');
    const depthFrame = {};
    depthFrame.exerciseName = exerciseName;
    depthFrame.frameNumber = frameNumber;
    depthFrame.frameHeight = frameHeight;
    depthFrame.frameWidth = frameWidth;
    depthFrame.points = [];

    // Copy across the points -> this is kinda inefficient but will have to do atm!
    for (var i = 0; i < frameHeight * frameWidth; i += 1) {
      depthFrame.points.push(depthData[i]);
    }

    call.write(depthFrame);
  }

  static sendMultiDepth(
    client,
    exerciseName1,
    frameNumber1,
    frameHeight1,
    frameWidth1,
    depthData1
  ) {
    const callback = (err, response) => {
      if (err) {
        console.log(err);
      } else {
        console.log(response);
      }
    };

    const call = client.MultiDepthRoute((error, stats) => {
      if (error) {
        callback(error);
        return;
      }
      console.log(stats);
      callback();
    });

    function pointSender(
      exerciseName,
      frameNumber,
      frameHeight,
      frameWidth,
      depthData
    ) {
      return callback => {
        const depthFrame = {};
        depthFrame.exerciseName = exerciseName;
        depthFrame.frameNumber = frameNumber;
        depthFrame.frameHeight = frameHeight;
        depthFrame.frameWidth = frameWidth;
        depthFrame.points = [];

        // Copy across the points -> this is kinda inefficient but will have to do atm!
        for (let i = 0; i < (frameHeight * frameWidth) / 10; i += 1) {
          depthFrame.points.push(depthData[i]);
        }

        call.write(depthFrame);

        delay(callback, random(1, 5));
      };
    }
    const pointsenders = [];
    const numframes = 10;
    for (let i = 0; i < numframes; i += 1) {
      pointsenders[i] = pointSender(
        exerciseName1,
        frameNumber1,
        frameHeight1,
        frameWidth1,
        depthData1
      );
    }

    series(pointsenders, () => {
      call.end();
    });
  }

  static sendRGBFrame(
    call,
    exerciseName,
    frameNumber,
    frameHeight,
    frameWidth,
    RGBData
  ) {
    console.log('SENDING FRAME: ', frameNumber);
    const RGBFrame = {};
    RGBFrame.exerciseName = exerciseName;
    RGBFrame.frameNumber = frameNumber;
    RGBFrame.frameHeight = frameHeight;
    RGBFrame.frameWidth = frameWidth;
    RGBFrame.points = [];

    // Copy across the points -> this is kinda inefficient but will have to do atm!
    for (var i = 0; i < frameHeight * frameWidth; i += 1) {
      RGBFrame.points.push(RGBData[i]);
    }

    call.write(RGBFrame);
  }

  static sendSingleRGBFrame(
    client,
    exerciseName,
    frameNumber,
    frameHeight,
    frameWidth,
    RGBData
  ) {
    console.log('SENDING FRAME: ', frameNumber);
    const RGBFrame = {};
    RGBFrame.exerciseName = exerciseName;
    RGBFrame.frameNumber = frameNumber;
    RGBFrame.frameHeight = frameHeight;
    RGBFrame.frameWidth = frameWidth;
    RGBFrame.points = [];

    // Copy across the points -> this is kinda inefficient but will have to do atm!
    for (let i = 0; i < frameHeight * frameWidth; i += 1) {
      //RGBFrame.points.push(RGBData[i] * 0.00100000005 * 65535);
      RGBFrame.points.push(RGBData[i]);
    }
    // for(let i = 0; i < 100; i += 1)
    // {
    //     RGBFrame.points.push(RGBData[i]);
    // }

    client.SingleDepthRoute(RGBFrame, (err, feature) => {
      if (err) {
        console.log(err);
      } else {
        console.log(feature);
      }
    });

    // call.write(RGBFrame);
  }
}
