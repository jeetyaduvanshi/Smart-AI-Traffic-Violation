 # Smart Traffic Violation App
 This is a full-stack application designed to automatically detect traffic violations from uploaded images and videos.

The system features a frontend for file uploads and a Python backend powered by **Flask** and the **YOLOv8** object detection model. When a user uploads media, the backend analyzes it, draws bounding boxes around detected violations, and saves the results to **Supabase** for storage and data logging. The frontend then displays the annotated media to the user.
 
 This is a code bundle for Smart Traffic Violation App.
 
 ## Running the code
 
 Run `npm i` to install the dependencies.
 
 Run `npm run dev` to start the development server.
 
 ## Backend (Flask + YOLOv8)
 
 A lightweight Flask backend with YOLOv8 handles image/video uploads, annotates detections with red bounding boxes, uploads results to Supabase Storage, and records metadata in the `violations` table.
 
 ### Directory
 
 - `backend/app.py`: Flask server with `/analyze` endpoint
 - `backend/results/`: Temporary output files (auto-created)
 
 ### Environment Variables
 
 Create a `.env` file in `backend/` (same folder as `app.py`) with:
 
 ```
 SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
 SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
 SUPABASE_BUCKET=violations
 YOLO_WEIGHTS=yolov8n.pt
 PORT=5001
 ```
 
 Notes:
 - `SUPABASE_SERVICE_ROLE_KEY` must have insert and storage upload permissions.
 - `SUPABASE_BUCKET` must exist (create a public bucket named `violations`).
 
 ### Install and Run (Python)
 
 From the project root:
 
 ```
 cd backend
 python -m venv .venv
 . .venv/Scripts/activate  # PowerShell: . .venv/Scripts/Activate.ps1
 pip install -r ../requirements.txt
 python app.py
 ```
 
 Server starts at `http://localhost:5001`.
 
 ### API
 
 - `POST /analyze` (multipart form)
   - field: `file` (image or video)
   - Response (image): `{ type: 'image', violation: boolean, violation_type, timestamp, file_url, image_base64 }`
   - Response (video): `{ type: 'video', violation: boolean, violation_type, timestamp, file_url }`
 
 ## Frontend
 
 - Upload from `UploadPage` sends to `http://localhost:5001/analyze`.
 - If image: shows annotated image (base64).
 - If video: shows a video player using `file_url`.
 - History persists to localStorage and/or server depending on availability.
 
