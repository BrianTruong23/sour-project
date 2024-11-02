from flask import Flask, render_template, request, jsonify
import os
import whisper
from transformers import AutoModelForCausalLM, AutoTokenizer
from PIL import Image
import torch
# Specify the model ID and local directory
model_id = 'vikhyatk/moondream2'
local_model_dir = './moondreamer_model'

revision = '2024-08-26'

# Step 1: Load the model and tokenizer (only needed the first time)
model = AutoModelForCausalLM.from_pretrained(model_id, trust_remote_code=True, revision = revision)
tokenizer = AutoTokenizer.from_pretrained(model_id)

# Step 2: Save the model and tokenizer to the local directory
model.save_pretrained(local_model_dir)
tokenizer.save_pretrained(local_model_dir)
print(f"Model saved to {local_model_dir}")