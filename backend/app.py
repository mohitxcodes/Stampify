from flask import Flask, request, send_file
from flask_cors import CORS
import os
from watermark import add_watermark_behind, add_watermark_overlay  # your existing function

app = Flask(__name__)
CORS(app)  # allows frontend to call API

UPLOAD_FOLDER = "uploads"
RESULT_FOLDER = "results"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

@app.route("/add_watermark", methods=["POST"])
def add_watermark():
    main_image = request.files["main_image"]
    watermark_image = request.files["watermark_image"]

    main_path = os.path.join(UPLOAD_FOLDER, main_image.filename)
    wm_path = os.path.join(UPLOAD_FOLDER, watermark_image.filename)
    result_path = os.path.join(RESULT_FOLDER, "output.png")

    main_image.save(main_path)
    watermark_image.save(wm_path)

    # Call your existing function
    add_watermark_overlay(main_path, wm_path, result_path)

    # Return image as response
    return send_file(result_path, mimetype="image/png")

if __name__ == "__main__":
    app.run(debug=True, port=5000)