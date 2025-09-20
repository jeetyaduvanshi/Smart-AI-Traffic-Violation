import os
import io
import base64
import uuid
from datetime import datetime, timezone

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Heavy deps imported lazily to reduce cold-start cost
from ultralytics import YOLO
import cv2
import numpy as np
from supabase import create_client, Client


RESULTS_DIR = os.path.join(os.path.dirname(__file__), 'results')
os.makedirs(RESULTS_DIR, exist_ok=True)


def get_env(name: str, required: bool = True, default: str | None = None) -> str | None:
    value = os.getenv(name, default)
    if required and not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def init_supabase() -> Client:
    url = get_env('SUPABASE_URL')
    key = get_env('SUPABASE_SERVICE_ROLE_KEY')
    return create_client(url, key)


def init_model() -> YOLO:
    # Load a small default model; user can override via env
    weights = os.getenv('YOLO_WEIGHTS', 'yolov8n.pt')
    return YOLO(weights)


app = Flask(__name__)
CORS(app)

supabase: Client | None = None
model: YOLO | None = None

# Initialize model at startup
try:
    model = init_model()
    print(f"✅ YOLO model initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize YOLO model: {e}")
    model = None


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'model_type': 'YOLOv8' if model is not None else None,
        'results_dir': RESULTS_DIR
    })


def draw_boxes_on_image(image_bgr: np.ndarray, boxes: np.ndarray, labels: list[str]) -> np.ndarray:
    annotated = image_bgr.copy()
    for i, box in enumerate(boxes):
        x1, y1, x2, y2 = map(int, box[:4])
        cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 0, 255), 2)
        label = labels[i]
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(annotated, (x1, y1 - th - 6), (x1 + tw + 6, y1), (0, 0, 255), -1)
        cv2.putText(annotated, label, (x1 + 3, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    return annotated


def run_yolo_on_image_bytes(file_bytes: bytes):
    assert model is not None, 'Model not initialized'
    np_arr = np.frombuffer(file_bytes, np.uint8)
    img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    results = model(img_bgr, verbose=False)[0]
    boxes = results.boxes.xyxy.cpu().numpy() if results.boxes is not None else np.empty((0, 4))
    cls_ids = results.boxes.cls.cpu().numpy().astype(int) if results.boxes is not None else np.array([], dtype=int)
    confs = results.boxes.conf.cpu().numpy() if results.boxes is not None else np.array([])
    names = results.names
    labels = [f"{names[c]} {conf:.2f}" for c, conf in zip(cls_ids, confs)]
    annotated = draw_boxes_on_image(img_bgr, boxes, labels) if len(boxes) > 0 else img_bgr
    return img_bgr, annotated, boxes, cls_ids, confs, names


def save_image(image_bgr: np.ndarray, out_path: str):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    cv2.imwrite(out_path, image_bgr)


def encode_image_to_base64(image_bgr: np.ndarray) -> str:
    _, buf = cv2.imencode('.jpg', image_bgr)
    return base64.b64encode(buf.tobytes()).decode('utf-8')


def upload_to_supabase_storage(client: Client, bucket: str, file_path: str, dest_path: str) -> str:
    with open(file_path, 'rb') as f:
        res = client.storage.from_(bucket).upload(dest_path, f, {
            'contentType': 'image/jpeg' if file_path.lower().endswith(('.jpg', '.jpeg', '.png')) else 'video/mp4',
            'upsert': True,
        })
    if res.get('error'):
        raise RuntimeError(str(res['error']))
    public_url = client.storage.from_(bucket).get_public_url(dest_path)
    return public_url


def insert_violation_record(client: Client, filename: str, violation_type: str, file_url: str):
    timestamp = datetime.now(timezone.utc).isoformat()
    data = {
        'filename': filename,
        'violation_type': violation_type,
        'timestamp': timestamp,
        'file_url': file_url,
    }
    res = client.table('violations').insert(data).execute()
    if getattr(res, 'error', None):
        raise RuntimeError(str(res.error))
    return data


@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        file = request.files['file']
        filename = file.filename or f"upload_{uuid.uuid4().hex}"
        content = file.read()
        mimetype = file.mimetype or ''

        is_image = mimetype.startswith('image/')
        is_video = mimetype.startswith('video/')

        if not (is_image or is_video):
            return jsonify({'error': 'Unsupported file type'}), 400

        # Ensure services are ready
        global supabase, model
        if supabase is None:
            supabase = init_supabase()
        if model is None:
            model = init_model()

        bucket_name = os.getenv('SUPABASE_BUCKET', 'violations')

        if is_image:
            original_img, annotated_img, boxes, cls_ids, confs, names = run_yolo_on_image_bytes(content)
            had_detections = len(boxes) > 0
            out_id = uuid.uuid4().hex
            temp_out_path = os.path.join(RESULTS_DIR, f"{out_id}_annotated.jpg")
            save_image(annotated_img if had_detections else original_img, temp_out_path)

            dest_path = f"images/{out_id}.jpg"
            public_url = upload_to_supabase_storage(supabase, bucket_name, temp_out_path, dest_path)

            violation_type = 'Violation Detected' if had_detections else 'No Violation'
            record = insert_violation_record(supabase, filename, violation_type, public_url)

            img_b64 = encode_image_to_base64(annotated_img if had_detections else original_img)

            return jsonify({
                'type': 'image',
                'violation': had_detections,
                'violation_type': violation_type,
                'timestamp': record['timestamp'],
                'file_url': public_url,
                'image_base64': img_b64,
            })

        # Video path
        temp_in_path = os.path.join(RESULTS_DIR, f"{uuid.uuid4().hex}_{filename}")
        with open(temp_in_path, 'wb') as f:
            f.write(content)

        cap = cv2.VideoCapture(temp_in_path)
        if not cap.isOpened():
            return jsonify({'error': 'Failed to read video'}), 400

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 24.0

        out_id = uuid.uuid4().hex
        temp_out_path = os.path.join(RESULTS_DIR, f"{out_id}_annotated.mp4")
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(temp_out_path, fourcc, fps, (width, height))

        any_detections = False
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            res = model(frame, verbose=False)[0]
            boxes = res.boxes.xyxy.cpu().numpy() if res.boxes is not None else np.empty((0, 4))
            cls_ids = res.boxes.cls.cpu().numpy().astype(int) if res.boxes is not None else np.array([], dtype=int)
            confs = res.boxes.conf.cpu().numpy() if res.boxes is not None else np.array([])
            names = res.names
            labels = [f"{names[c]} {conf:.2f}" for c, conf in zip(cls_ids, confs)]
            annotated = draw_boxes_on_image(frame, boxes, labels) if len(boxes) > 0 else frame
            if len(boxes) > 0:
                any_detections = True
            writer.write(annotated)

        cap.release()
        writer.release()

        dest_path = f"videos/{out_id}.mp4"
        public_url = upload_to_supabase_storage(supabase, bucket_name, temp_out_path, dest_path)
        violation_type = 'Violation Detected' if any_detections else 'No Violation'
        record = insert_violation_record(supabase, filename, violation_type, public_url)

        return jsonify({
            'type': 'video',
            'violation': any_detections,
            'violation_type': violation_type,
            'timestamp': record['timestamp'],
            'file_url': public_url,
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/results/<path:filename>')
def serve_results(filename: str):
    return send_from_directory(RESULTS_DIR, filename)


if __name__ == '__main__':
    port = int(os.getenv('PORT', '5001'))
    app.run(host='0.0.0.0', port=port, debug=True)


