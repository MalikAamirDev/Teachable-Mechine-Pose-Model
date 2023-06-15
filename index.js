// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/5B2gXAtGU/";
let model, webcam, ctx, labelContainer, maxPredictions;

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // Note: the pose library adds a tmPose object to your window (window.tmPose)
  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const size = 200;
  const flip = true; // whether to flip the webcam
  webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append/get elements to the DOM
  const canvas = document.getElementById("canvas");
  canvas.width = size;
  canvas.height = size;
  ctx = canvas.getContext("2d");
  labelContainer = document.getElementById("label-container");

  for (let i = 0; i < maxPredictions; i++) {
    const progressBarContainer = document.createElement("div");
    progressBarContainer.classList.add("progress-bar-container");

    const progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar");

    const label = document.createElement("div");
    label.classList.add("label");

    progressBarContainer.appendChild(progressBar);
    progressBarContainer.appendChild(label);
    labelContainer.appendChild(progressBarContainer);
  }
}

async function loop(timestamp) {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

// async function predict() {
//   // Prediction #1: run input through posenet
//   // estimatePose can take in an image, video, or canvas HTML element
//   const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
//   // Prediction 2: run input through teachable machine classification model
//   const prediction = await model.predict(posenetOutput);

//   for (let i = 0; i < maxPredictions; i++) {
//     const classPrediction = prediction[i].className;
//     const probability = (prediction[i].probability * 100).toFixed(2) + "%";
//     const progressBarContainer = labelContainer.childNodes[i];
//     const progressBar = progressBarContainer.childNodes[0];
//     const label = progressBarContainer.childNodes[1];

//     progressBar.style.width = probability;
//     label.innerHTML = `<strong>${classPrediction}</strong>: ${probability}`;
//   }

//   // finally draw the poses
//   drawPose(pose);
// }

async function predict() {
  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  // Prediction 2: run input through teachable machine classification model
  const prediction = await model.predict(posenetOutput);

  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction = prediction[i].className;
    const probability = (prediction[i].probability * 100).toFixed(2);

    const progressBarContainer = labelContainer.childNodes[i];
    const progressBar = progressBarContainer.querySelector(".progress-bar");
    const label = progressBarContainer.querySelector(".label");

    progressBar.style.width = `${probability}%`;
    label.innerHTML = `<strong>${classPrediction}</strong>: ${probability}%`;
  }

  // finally draw the poses
  drawPose(pose);
}


function drawPose(pose) {
  if (webcam.canvas) {
    ctx.drawImage(webcam.canvas, 0, 0);
    // draw the keypoints and skeleton
    if (pose) {
      const minPartConfidence = 0.5;
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
  }
}
