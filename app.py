from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import whisper
from transformers import AutoModelForCausalLM, AutoTokenizer
from PIL import Image
import torch
import gc

torch.cuda.empty_cache()

gc.collect()  # Run garbage collection to free up memory

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load Whisper model
whisper_model = whisper.load_model('base')

local_model_dir = './moondreamer_model'
model_moon_dreamer = AutoModelForCausalLM.from_pretrained(local_model_dir, trust_remote_code=True)
tokenizer = AutoTokenizer.from_pretrained(local_model_dir, trust_remote_code = True)

# Set device to GPU if available, otherwise fallback to CPU
device = "cuda" if torch.cuda.is_available() else "cpu"
model_moon_dreamer = model_moon_dreamer.to(device)  # Move model to the appropriate device

@app.route('/uploads/<path:filename>')
def download_file(filename):
    return send_from_directory('uploads', filename)

@app.route('/', methods=["GET"])
def home():
    return render_template('index.html')

# Define the function to convert audio to text
def convert_audio_to_text(input_file):
    result = whisper_model.transcribe(input_file)
    text = result['text']
    return text

# Function to generate prediction for MoonDreamer
def generate_prediction_for_moondreamer(model, image: Image, text: str):
    enc_image = model.encode_image(image)
    prompt = f"Do the best that you can to answer this: {text}"
    return model.answer_question(enc_image, prompt, tokenizer)

@app.route("/upload_audio", methods=["POST"])
def upload_audio():
    if "audio" not in request.files or "image" not in request.files:
        return jsonify({"error": "No audio or image file uploaded"}), 400

    # Save the audio file
    # audio_file = request.files["audio"]
    audio_path = os.path.join(UPLOAD_FOLDER, "recorded_audio.wav")
    # audio_file.save(audio_path)

    # Convert audio to text
    try:
        transcription = convert_audio_to_text(audio_path)
    except Exception as e:
        return jsonify({"error": "Transcription failed", "details": str(e)}), 500

    # Save the image file
    image_file = request.files["image"]
    image_path = os.path.join(UPLOAD_FOLDER, "received_image.png")
    image_file.save(image_path)

    # Load and encode the image
    image = Image.open(image_path)

    # Generate prediction using MoonDreamer
    try:
        response = generate_prediction_for_moondreamer(model_moon_dreamer, image, transcription)
        return jsonify({
            "message": "Audio uploaded and transcribed successfully",
            "transcription": transcription,
            "response": response
        })
    except Exception as e:
        return jsonify({"error": "Failed to generate response", "details": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True)
