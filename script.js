const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");

function countFingers(landmarks) {

    let count = 0;

    if (landmarks[8].y < landmarks[6].y) count++;
    if (landmarks[12].y < landmarks[10].y) count++;
    if (landmarks[16].y < landmarks[14].y) count++;
    if (landmarks[20].y < landmarks[18].y) count++;

    return count;
}

function onResults(results) {

    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
    );

    if (results.multiHandLandmarks) {

        for (const landmarks of results.multiHandLandmarks) {

            drawConnectors(
                canvasCtx,
                landmarks,
                HAND_CONNECTIONS,
                { lineWidth: 3 }
            );

            drawLandmarks(
                canvasCtx,
                landmarks
            );

            let fingers = countFingers(landmarks);

           let time = Date.now() / 200;

// Glowing box
canvasCtx.fillStyle = "rgba(0,0,0,0.6)";
canvasCtx.fillRect(20, 20, 320, 100);

// Animated glow
let glow = 15 + Math.sin(time) * 10;

canvasCtx.shadowColor = "#00ffff";
canvasCtx.shadowBlur = glow;

// Stylish font
canvasCtx.font = "bold 42px Segoe UI";
canvasCtx.fillStyle = "#00ffff";

canvasCtx.fillText(
    fingers + " FINGERS DETECTED",
    35,
    80
);
if (fingers === 4 ) {

    canvasCtx.shadowColor = "#00ff00";
    canvasCtx.shadowBlur = 30;

    canvasCtx.font = "bold 60px Segoe UI";

    let scale = 1 + Math.sin(time * 2) * 0.1;

    canvasCtx.save();

    canvasCtx.translate(
        canvasElement.width / 2,
        150
    );

    canvasCtx.scale(scale, scale);

    canvasCtx.fillStyle = "#00ff00";

    canvasCtx.fillText(
        
        -200,
        0
    );

    canvasCtx.restore();
}

canvasCtx.shadowBlur = 0;
        }
    }

    canvasCtx.restore();
}

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({
            image: videoElement
        });
    },
    width: 1280,
    height: 720
});

camera.start();
