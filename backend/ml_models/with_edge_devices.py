import cv2
import json
import time
import easyocr
import numpy as np
from ultralytics import YOLO

# --- ================= CONFIGURATION ================= ---
# YOLO Model Path
VEHICLE_MODEL_PATH = 'yolov8s.pt'

# JSON Output Path
OUTPUT_JSON_PATH = 'detection_results.json'

# --- =============================================== ---

def capture_and_detect():
    """
    Main function to activate the webcam, capture a single image,
    detect vehicle and license plate, then save the result to JSON.
    """
    # --- Model Initialization ---
    try:
        print("Loading models...")
        vehicle_model = YOLO(VEHICLE_MODEL_PATH)
        ocr_reader = easyocr.Reader(['id', 'en'], gpu=False)
        print("Models loaded successfully.")
    except Exception as e:
        print(f"Error while loading models: {e}")
        return

    # --- Webcam Initialization ---
    print("Accessing webcam...")
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    # Give the camera 1-2 seconds to stabilize its sensors
    time.sleep(1)

    # --- Capture a Single Image (Snap) ---
    ret, frame = cap.read()

    # Release the webcam immediately after the picture is taken
    cap.release()
    print("Webcam released.")

    if not ret:
        print("Error: Failed to capture image from webcam.")
        return
    
    print("Image captured successfully, starting detection process...")

    # Filter and Classification
    CUSTOM_CLASSIFICATION = {3: "Small", 2: "Medium", 5: "Large", 7: "Large"}
    TARGET_CLASSES = list(CUSTOM_CLASSIFICATION.keys())

    def is_plausible_plate(text):
        text = text.replace(" ", "").upper()
        if any(char.isdigit() for char in text) and any(char.isalpha() for char in text) and 4 < len(text) < 10:
            return True
        return False

    # --- Detection Process on the Captured Image ---
    vehicle_detections = vehicle_model(frame, classes=TARGET_CLASSES, verbose=False)[0]

    largest_vehicle_box = None
    max_area = 0
    if len(vehicle_detections.boxes) > 0:
        for box in vehicle_detections.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
            area = (x2 - x1) * (y2 - y1)
            if area > max_area:
                max_area = area
                largest_vehicle_box = box
    
    final_result = {}

    if largest_vehicle_box is not None:
        x1_v, y1_v, x2_v, y2_v = map(int, largest_vehicle_box.xyxy[0].cpu().numpy())
        coco_class_id = int(largest_vehicle_box.cls[0].cpu().numpy())
        confidence = float(largest_vehicle_box.conf[0].cpu().numpy())
        custom_label = CUSTOM_CLASSIFICATION.get(coco_class_id, "Unknown")

        final_result = {
            "detection_status": "Success",
            "vehicle_type": custom_label,
            "vehicle_confidence": confidence,
            "vehicle_bounding_box": [x1_v, y1_v, x2_v, y2_v],
            "license_plate": "Not Detected",
            "plate_confidence": 0.0,
            "timestamp": time.time()
        }

        vehicle_crop = frame[y1_v:y2_v, x1_v:x2_v]
        if vehicle_crop.size > 0:
            gray_crop = cv2.cvtColor(vehicle_crop, cv2.COLOR_BGR2GRAY)
            ocr_results = ocr_reader.readtext(gray_crop)
            
            best_plate_text = "Not Detected"
            best_plate_prob = 0.0
            for (bbox, text, prob) in ocr_results:
                if is_plausible_plate(text) and prob > best_plate_prob:
                    best_plate_text = text.upper().replace(" ", "").replace(".", "").replace("-", "")
                    best_plate_prob = prob
            
            if best_plate_text != "Not Detected":
                final_result["license_plate"] = best_plate_text
                final_result["plate_confidence"] = prob
    else:
        print("No vehicle was detected.")
        final_result = {
            "detection_status": "Failed",
            "reason": "No vehicle detected in the frame.",
            "timestamp": time.time()
        }

    # --- Save Result to JSON File ---
    with open(OUTPUT_JSON_PATH, 'w') as f:
        # Saving as a single JSON object, not a list
        json.dump(final_result, f, indent=4)
    
    print(f"Process finished. Detection result saved to '{OUTPUT_JSON_PATH}'")
    print("---")
    print(json.dumps(final_result, indent=4))


if __name__ == "__main__":
    capture_and_detect()