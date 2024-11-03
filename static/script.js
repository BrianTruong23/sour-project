let mediaRecorder;
let audioChunks = [];

const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const dotsContainer = document.getElementById("wave");
const transcriptionContainer = document.getElementById("transcription");

// startButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

// async function startRecording() {

//     console.log("hey");

//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     mediaRecorder = new MediaRecorder(stream);
//     audioChunks = [];

//     mediaRecorder.ondataavailable = event => {
//         audioChunks.push(event.data);
//     };

//     mediaRecorder.onstop = async () => {
//         const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
//         const formData = new FormData();
//         formData.append("audio", audioBlob, "recorded_audio.wav");

//         // Send audio to Flask server
//         await fetch("/upload_audio", {
//             method: "POST",
//             body: formData
//         })
//         .then(response => response.json())
//         .then(data => {
//             print(data)
//             if (data.transcription) {
//                 transcriptionContainer.textContent = data.transcription;
//             } else {
//                 console.error("Error in transcription:", data.error);
//             }
//         })
//         .catch(error => console.error("Error uploading audio:", error));
//     };

//     mediaRecorder.start();
//     dotsContainer.classList.remove("hidden");
//     startButton.classList.add("hidden");
//     stopButton.classList.remove("hidden");
// }

// async function startRecording() {
//     console.log("Attempting to start recording...");

//     try {
//         // Check available media devices
//         const devices = await navigator.mediaDevices.enumerateDevices();
//         const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
        
//         if (audioInputDevices.length === 0) {
//             console.error("No audio input devices found.");
//             alert("No microphone found. Please connect a microphone and try again.");
//             return;
//         }

//         // Request access to the microphone
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         mediaRecorder = new MediaRecorder(stream);
//         audioChunks = [];

//         mediaRecorder.ondataavailable = event => {
//             audioChunks.push(event.data);
//         };

//         mediaRecorder.onstop = async () => {
//             const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
//             const formData = new FormData();
//             formData.append("audio", audioBlob, "recorded_audio.wav");

//             // Send audio to Flask server
//             await fetch("/upload_audio", {
//                 method: "POST",
//                 body: formData
//             })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.transcription) {
//                     transcriptionContainer.textContent = data.transcription;
//                 } else {
//                     console.error("Error in transcription:", data.error);
//                 }
//             })
//             .catch(error => console.error("Error uploading audio:", error));
//         };

//         mediaRecorder.start();
//         dotsContainer.classList.remove("hidden");
//         startButton.classList.add("hidden");
//         stopButton.classList.remove("hidden");
//     } catch (error) {
//         if (error.name === 'NotAllowedError') {
//             console.error("Permission denied for microphone access.");
//             alert("Please allow microphone access to use this feature.");
//         } else if (error.name === 'NotFoundError') {
//             console.error("Requested device not found.");
//             alert("No microphone found. Please connect a microphone and try again.");
//         } else {
//             console.error("Error accessing media devices:", error);
//             alert("An error occurred while accessing the microphone. Please try again.");
//         }
//     }
// }
async function startPrediction() {
    console.log("Attempting to fetch and predict on the recorded audio...");

    try {
        // Fetch the audio file from the server
        const audioBlob = await fetch('/uploads/recorded_audio.wav')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            });

        // Prepare FormData to send to server
        const formData = new FormData();
        formData.append("audio", audioBlob, "recorded_audio.wav");

        // Send the audio to the Flask server for prediction
        const response = await fetch("/upload_audio", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.transcription) {
            transcriptionContainer.textContent = data.transcription;
        } else {
            console.error("Error in transcription:", data.error);
        }
    } catch (error) {
        console.error("Error during prediction:", error);
        alert("An error occurred while predicting. Please try again.");
    }
}

// Event listener for starting prediction
startButton.addEventListener("click", startPrediction);


function stopRecording() {
    mediaRecorder.stop();
    dotsContainer.classList.add("hidden");
    stopButton.classList.add("hidden");
    startButton.classList.remove("hidden");
}