from flask import Flask, render_template, request, jsonify
import os
import whisper

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

model = whisper.load_model('base')

@app.route('/', methods=["GET"])
def home():
    return render_template('index.html')

# Define the function to convert audio to text
def convert_audio_to_text(input_file):
    result = model.transcribe(input_file)
    text = result['text']
    return text

@app.route("/upload_audio", methods=["POST"])
def upload_audio():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file uploaded"}), 400

    audio_file = request.files["audio"]
    audio_path = os.path.join(UPLOAD_FOLDER, "recorded_audio.wav")
    audio_file.save(audio_path)

    # Convert audio to text
    try:
        transcription = convert_audio_to_text(audio_path)
        return jsonify({"message": "Audio uploaded and transcribed successfully", "transcription": transcription})
    except Exception as e:
        return jsonify({"error": "Transcription failed", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
