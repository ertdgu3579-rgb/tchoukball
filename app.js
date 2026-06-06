
/* -------------------------------------------------
MediaPipe Pose + 카메라 초기화
------------------------------------------------- */

console.log('app.js 실행됨');

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
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

pose.onResults(onResults);

/* -------------------------------------------------
결과 처리
------------------------------------------------- */

function onResults(results) {

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (!results.poseLandmarks) {
    canvasCtx.restore();
    return;
  }

  const landmarks = results.poseLandmarks;

  /* =========================
     1. 얼굴 (귀 2 + 코 1)
  ========================= */

  const face = [
    landmarks[7],  // 왼쪽 귀
    landmarks[8],  // 오른쪽 귀
    landmarks[0]   // 코
  ];

  // 점만 표시
  drawLandmarks(canvasCtx, face, {
    color: '#ffffff',
    radius: 4
  });

  // 연결선 (삼각형)
  drawConnectors(canvasCtx, landmarks,
    [
      [7, 8],
      [7, 0],
      [8, 0]
    ],
    {
      color: '#ffffff',
      lineWidth: 2
    }
  );

  /* =========================
     2. 몸 스켈레톤 (선 유지)
  ========================= */

  drawConnectors(canvasCtx, landmarks,
    [[11, 13], [13, 15]],
    { color: '#ff4d4d', lineWidth: 4 }
  );

  drawConnectors(canvasCtx, landmarks,
    [[12, 14], [14, 16]],
    { color: '#4d79ff', lineWidth: 4 }
  );

  drawConnectors(canvasCtx, landmarks,
    [[11, 12], [11, 23], [12, 24], [23, 24]],
    { color: '#ffffff', lineWidth: 4 }
  );

  drawConnectors(canvasCtx, landmarks,
    [[23, 25], [25, 27]],
    { color: '#4dff88', lineWidth: 4 }
  );

  drawConnectors(canvasCtx, landmarks,
    [[24, 26], [26, 28]],
    { color: '#ffd24d', lineWidth: 4 }
  );

  /* =========================
     3. 관절 점 (전체 유지)
  ========================= */

  drawLandmarks(canvasCtx, landmarks, {
    color: '#ffffff',
    radius: 0
  });

  canvasCtx.restore();
}

/* -------------------------------------------------
카메라 시작
------------------------------------------------- */

async function initCamera() {

  console.log('카메라 시작');

  try {

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    videoElement.srcObject = stream;

    videoElement.onloadedmetadata = async () => {

      await videoElement.play();

      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;

      placeholder.style.display = 'none';

      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await pose.send({ image: videoElement });
        },
        width: videoElement.videoWidth,
        height: videoElement.videoHeight
      });

      camera.start();
    };

  } catch (err) {

    console.error('카메라 접근 오류:', err);

    placeholder.innerHTML =
      '<p>카메라 권한을 확인해주세요</p>';
  }
}

/* -------------------------------------------------
시작
------------------------------------------------- */

window.addEventListener('DOMContentLoaded', () => {
  initCamera();
});