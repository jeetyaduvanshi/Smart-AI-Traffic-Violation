# Smart Traffic Violation App

A comprehensive traffic violation detection system using YOLOv8 for object detection, built with React frontend and Flask backend. The system can analyze images and videos to detect traffic violations and store results in Supabase.

## Features

- 🚗 **Traffic Violation Detection**: Uses YOLOv8 model to detect vehicles and traffic violations
- 📸 **Image & Video Support**: Upload and analyze both images and videos
- 🎯 **Real-time Analysis**: Get instant results with annotated bounding boxes
- 📊 **History Tracking**: View past violation detections
- 🔐 **User Authentication**: Secure login/signup with Supabase Auth
- 📱 **Responsive Design**: Modern UI built with React and Tailwind CSS

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix UI components
- Supabase for authentication

### Backend
- Flask (Python)
- YOLOv8 for object detection
- OpenCV for image/video processing
- Supabase for data storage

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd smart-traffic-violation-app
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the `backend/` directory:
   ```env
   SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
   SUPABASE_BUCKET=violations
   YOLO_WEIGHTS=yolov8n.pt
   PORT=5001
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   python app.py
   ```
   Backend will run on `http://localhost:5001`

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`
 
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
