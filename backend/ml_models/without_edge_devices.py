import cv2
import os
import random
import json
import re
import easyocr
import numpy as np
from ultralytics import YOLO

# Random Picture Function

def get_random_image_path(folder_path):
    """
    Selects a random image file from a given folder.

    Args:
        folder_path (str): The path to the folder containing images.

    Returns:
        str: The full path to a randomly selected image file, or None if no images are found.
    """
    try:
        # Define common image file extensions
        image_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
        
        # List all files in the directory and filter for images
        all_files = os.listdir(folder_path)
        image_files = [f for f in all_files if os.path.splitext(f)[1].lower() in image_extensions]
        
        if not image_files:
            print(f"No image files found in the folder: {folder_path}")
            return None
            
        # Select a random image file from the list
        random_image_name = random.choice(image_files)
        
        # Construct the full path to the image
        image_path = os.path.join(folder_path, random_image_name)
        
        return image_path

    except FileNotFoundError:
        print(f"Error: The folder '{folder_path}' was not found.")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

# --- ================= CONFIGURATION ================= ---
# YOLO Model
VEHICLE_MODEL_PATH = 'yolov8s.pt'

# Picture Path
# Set the path to your folder
IMAGE_FOLDER = 'test_picture' 

# Get the path of a random image from the folder
IMAGE_PATH = get_random_image_path(IMAGE_FOLDER)

# Output Path
OUTPUT_JSON_PATH = 'detection_results.json'
OUTPUT_IMAGE_PATH = 'visualization_result.jpg'
# --- =============================================== ---

# --- Model Initialization ---
try:
    print("Loading models...")
    vehicle_model = YOLO(VEHICLE_MODEL_PATH)
    ocr_reader = easyocr.Reader(['id', 'en'], gpu=False)
    print("All models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")
    exit()

# Filter and Classification
CUSTOM_CLASSIFICATION = {3: "A", 2: "B", 5: "C", 7: "C"}
TARGET_CLASSES = list(CUSTOM_CLASSIFICATION.keys())

def is_plausible_plate(text):
    # This filter is more important now because OCR searches a wider area
    text = text.replace(" ", "").upper()
    # Looks for a pattern containing letters and numbers
    if any(char.isdigit() for char in text) and any(char.isalpha() for char in text) and 4 < len(text) < 10:
        return True
    return False

# --- Main Process ---
all_results = []
img = cv2.imread(IMAGE_PATH)

if img is None:
    print(f"Error: Could not open image at '{IMAGE_PATH}'")
else:
    # STAGE 1: VEHICLE DETECTION
    vehicle_detections = vehicle_model(img, classes=TARGET_CLASSES, verbose=False)[0]
    print(f"Detected a total of {len(vehicle_detections.boxes)} vehicles...")

    # Find the vehicle with the largest area
    largest_vehicle_box = None
    max_area = 0
    if len(vehicle_detections.boxes) > 0:
        for box in vehicle_detections.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
            area = (x2 - x1) * (y2 - y1)
            if area > max_area:
                max_area = area
                largest_vehicle_box = box

    # Process only if the largest vehicle is found
    if largest_vehicle_box is not None:
        x1_v, y1_v, x2_v, y2_v = map(int, largest_vehicle_box.xyxy[0].cpu().numpy())
        coco_class_id = int(largest_vehicle_box.cls[0].cpu().numpy())
        confidence = float(largest_vehicle_box.conf[0].cpu().numpy())
        custom_label = CUSTOM_CLASSIFICATION.get(coco_class_id, "Unknown")

        current_result = {
            "vehicle_type": custom_label,
            # "vehicle_confidence": confidence,
            # "vehicle_bounding_box": [x1_v, y1_v, x2_v, y2_v],
            "license_plate": "Not Detected"
            # "plate_confidence": 0.0
        }

        # STAGE 2: DIRECT OCR ON THE VEHICLE AREA
        vehicle_crop = img[y1_v:y2_v, x1_v:x2_v]
        if vehicle_crop.size > 0:
            # Pre-processing to improve OCR accuracy
            gray_crop = cv2.cvtColor(vehicle_crop, cv2.COLOR_BGR2GRAY)

            # Run OCR on the entire cropped vehicle area
            ocr_results = ocr_reader.readtext(gray_crop)

            for (bbox, text, prob) in ocr_results:
                if is_plausible_plate(text):
                    plate_text = text.upper().replace(" ", "").replace(".", "").replace("-", "")
                    current_result["license_plate"] = plate_text
                    # current_result["plate_confidence"] = prob

                    # Display the license plate text below the vehicle box
                    cv2.putText(img, plate_text, (x1_v, y2_v + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
                    break # Stop after the first valid plate is found

        all_results.append(current_result)

        # Draw the vehicle box and label
        cv2.rectangle(img, (x1_v, y1_v), (x2_v, y2_v), (255, 0, 0), 2)
        cv2.putText(img, custom_label, (x1_v, y1_v - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)

    # Save the results to a JSON file and image
    with open(OUTPUT_JSON_PATH, 'w') as f:
        json.dump(all_results, f, indent=4)
    print(f"\nProcess finished. Detection results have been saved to '{OUTPUT_JSON_PATH}'")

    cv2.imwrite(OUTPUT_IMAGE_PATH, img)
    print(f"Detection visualization has been saved to '{OUTPUT_IMAGE_PATH}'")