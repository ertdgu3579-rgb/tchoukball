/* -------------------------------------------------
MediaPipe Pose + 카메라 초기화
------------------------------------------------- */

console.log('app.js 실행됨');

// 요소 가져오기
const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');

const placeholder = document.getElementById('placeholder');

/* -------------------------------------------------
Pose 설정
------------------------------------------------- */

const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  }
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,

  // 정확도 향상
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

pose.onResults(onResults);

/* -------------------------------------------------
결과 그리기
------------------------------------------------- */

function onResults(results) {

  canvasCtx.save();

  canvasCtx.clearRect(
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  // 스켈레톤 출력
  if (results.poseLandmarks) {

    // 얼굴 제외 (11번부터 몸 시작)
    const bodyLandmarks =
      results.poseLandmarks.filter((_, index) => index >= 11);

    drawConnectors(canvasCtx, results.poseLandmarks,
      [
        [11, 13], [13, 15]
      ],
      { color: '#ff4d4d', lineWidth: 4 } // 왼팔
    );

    drawConnectors(canvasCtx, results.poseLandmarks,
      [
        [12, 14], [14, 16]
      ],
      { color: '#4d79ff', lineWidth: 4 } // 오른팔
    );

    drawConnectors(canvasCtx, results.poseLandmarks,
      [
        [23, 25], [25, 27]
      ],
      { color: '#4dff88', lineWidth: 4 } // 왼다리
    );

    drawConnectors(canvasCtx, results.poseLandmarks,
      [
        [24, 26], [26, 28]
      ],
      { color: '#ffd24d', lineWidth: 4 } // 오른다리
    );

    drawConnectors(canvasCtx, results.poseLandmarks,
      [
        [11, 12], [11, 23], [12, 24], [23, 24]
      ],
      { color: '#ffffff', lineWidth: 4 } // 몸통
    );

    drawLandmarks(
      canvasCtx,
      bodyLandmarks,
      {
        color: '#FFFFFF',
        lineWidth: 2,
        radius: 5
      }
    );

  }

  canvasCtx.restore();
}

/* -------------------------------------------------
카메라 시작
------------------------------------------------- */

async function initCamera() {

  console.log('카메라 시작');

  try {

    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

    videoElement.srcObject = stream;

    videoElement.onloadedmetadata = async () => {

      console.log('videoWidth:', videoElement.videoWidth);
      console.log('videoHeight:', videoElement.videoHeight);

      // canvas 크기 맞추기
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;

      await videoElement.play();

      console.log('비디오 재생 성공');

      // placeholder 제거
      placeholder.style.display = 'none';

      // MediaPipe 카메라 시작
      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await pose.send({ image: videoElement });
        },
        width: 1280,
        height: 720
      });

      camera.start();

    };


  } catch (err) {

    console.error('카메라 접근 오류:', err);

    placeholder.innerHTML =
      '<p>카메라에 접근할 수 없습니다.<br>권한을 확인해주세요.</p>';

  }
}

/* -------------------------------------------------
시작
------------------------------------------------- */

window.addEventListener('DOMContentLoaded', () => {
  initCamera();
});