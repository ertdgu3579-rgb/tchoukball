/* -------------------------------------------------
   디버깅용 카메라 초기화
------------------------------------------------- */

console.log('app.js 실행됨');

const videoElement = document.getElementById('video');
const placeholder = document.getElementById('placeholder');

async function initCamera() {

  console.log('카메라 시작');

  try {

    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

    videoElement.srcObject = stream;

    // 메타데이터 로드 확인
    videoElement.onloadedmetadata = () => {

      console.log('videoWidth:', videoElement.videoWidth);
      console.log('videoHeight:', videoElement.videoHeight);

      console.log('clientWidth:', videoElement.clientWidth);
      console.log('clientHeight:', videoElement.clientHeight);

    };

    // 실제 영상 데이터 로드 후 placeholder 제거
    videoElement.onloadeddata = () => {

      console.log('영상 데이터 로드 완료');

      placeholder.style.display = 'none';

    };

    await videoElement.play();

    console.log('비디오 재생 성공');

  } catch (err) {

    console.error('카메라 접근 오류:', err);

    placeholder.innerHTML =
      '<p>카메라에 접근할 수 없습니다.<br>권한을 확인해주세요.</p>';

  }
}

// HTML 로드 후 실행
window.addEventListener('DOMContentLoaded', () => {
  initCamera();
});
