from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import os
from watermark import add_watermark_overlay

app = Flask(__name__)

# Enhanced CORS configuration
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

UPLOAD_FOLDER = "uploads"
RESULT_FOLDER = "results"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

@app.route("/add_watermark", methods=["POST", "OPTIONS"])
def add_watermark():
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        return "", 204
    
    try:
        # Ensure both files exist
        if "main_image" not in request.files or "watermark_image" not in request.files:
            return jsonify({"error": "Both main_image and watermark_image are required"}), 400
        
        main_image = request.files["main_image"]
        watermark_image = request.files["watermark_image"]
        
        # Save uploaded files
        main_path = os.path.join(UPLOAD_FOLDER, main_image.filename)
        wm_path = os.path.join(UPLOAD_FOLDER, watermark_image.filename)
        result_path = os.path.join(RESULT_FOLDER, f"watermarked_{main_image.filename}")
        
        main_image.save(main_path)
        watermark_image.save(wm_path)
        
        # Apply watermark
        add_watermark_overlay(main_path, wm_path, result_path)
        
        # Return watermarked image
        return send_file(result_path, mimetype="image/png")
    
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)