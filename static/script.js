let mediaRecorder;
let audioChunks = [];

const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const dotsContainer = document.getElementById("wave");
const transcriptionContainer = document.getElementById("transcription");

startButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recorded_audio.wav");

        // Send audio to Flask server
        await fetch("/upload_audio", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            print(data)
            if (data.transcription) {
                transcriptionContainer.textContent = data.transcription;
            } else {
                console.error("Error in transcription:", data.error);
            }
        })
        .catch(error => console.error("Error uploading audio:", error));
    };

    mediaRecorder.start();
    dotsContainer.classList.remove("hidden");
    startButton.classList.add("hidden");
    stopButton.classList.remove("hidden");
}

function stopRecording() {
    mediaRecorder.stop();
    dotsContainer.classList.add("hidden");
    stopButton.classList.add("hidden");
    startButton.classList.remove("hidden");
}
