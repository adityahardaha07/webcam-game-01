const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");

// Set canvas size once
canvasElement.width = window.innerWidth;
canvasElement.height = window.innerHeight;

function countFingers(landmarks) {
    let count = 0;

    // Thumb
    if (landmarks[4].x < landmarks[3].x) count++;

    // Other fingers
    if (landmarks[8].y < landmarks[6].y) count++;
    if (landmarks[12].y < landmarks[10].y) count++;
    if (landmarks[16].y < landmarks[14].y) count++;
    if (landmarks[20].y < landmarks[18].y) count++;

    return count;
}

function onResults(results) {

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

            drawLandmarks(canvasCtx, landmarks);

            const fingers = countFingers(landmarks);

            const time = Date.now() / 200;

            // Background box
            canvasCtx.fillStyle = "rgba(0,0,0,0.6)";
            canvasCtx.fillRect(20, 20, 350, 100);

            // Glow effect
            canvasCtx.shadowColor = "#00ffff";
            canvasCtx.shadowBlur = 15 + Math.sin(time) * 10;

            canvasCtx.font = "bold 42px Segoe UI";
            canvasCtx.fillStyle = "#00ffff";

            canvasCtx.fillText(
                `${fingers} FINGERS DETECTED`,
                35,
                80
            );

            // Special effect when 4 fingers detected
            if (fingers === 4) {

                const scale = 1 + Math.sin(time * 2) * 0.1;

                canvasCtx.save();

                canvasCtx.translate(
                    canvasElement.width / 2,
                    150
                );

                canvasCtx.scale(scale, scale);

                canvasCtx.shadowColor = "#00ff00";
                canvasCtx.shadowBlur = 30;
                canvasCtx.fillStyle = "#00ff00";
                canvasCtx.font = "bold 60px Segoe UI";
                canvasCtx.textAlign = "center";

                canvasCtx.fillText(
                    "FOUR FINGERS!",
                    0,
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
    locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
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

// IMPORTANT: Start the camera
camera.start();
