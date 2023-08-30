const videoElement = document.createElement('video');
document.body.appendChild(videoElement);

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        videoElement.srcObject = stream;
        videoElement.play();
    })
    .catch(error => console.error('Error accessing webcam:', error));


// Example using face-api.js
const canvas = faceapi.createCanvasFromMedia(videoElement);
document.body.appendChild(canvas);

const displaySize = { width: videoElement.width, height: videoElement.height };
faceapi.matchDimensions(canvas, displaySize);

videoElement.addEventListener('play', () => {
    const canvasContext = canvas.getContext('2d');
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(videoElement,
            new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // Process the detection data to determine head movement
        // For example, calculate the position of the face landmarks
        // Inside the setInterval function where face detection is happening
        if (resizedDetections && resizedDetections.length > 0) {
            const faceLandmarks = resizedDetections[0].landmarks;
            const nose = faceLandmarks.getNose()[0]; // Example: using the nose landmark

            // Calculate the movement from the previous frame (if available)
            if (prevNose) {
                const movementX = nose.x - prevNose.x;
                const movementY = nose.y - prevNose.y;

                // You can use the movement values to control the game, e.g., move the mole
                // Here, we'll just log the movement for demonstration
                console.log("Movement X:", movementX);
                console.log("Movement Y:", movementY);
            }

            // Store the current nose position for the next frame
            const prevNose = nose;
        }

    }, 100);
});


// Inside the setInterval function from the previous step
if (resizedDetections && resizedDetections.length > 0) {
    const faceLandmarks = resizedDetections[0].landmarks;
    const nose = faceLandmarks.getNose()[0]; // Example: using the nose landmark

    // Calculate mole position based on head movement
    const moleX = nose.x; // Adjust as needed
    const moleY = nose.y; // Adjust as needed

    // Update mole position on the game canvas
    mole.style.left = `${moleX}px`;
    mole.style.top = `${moleY}px`;
}
