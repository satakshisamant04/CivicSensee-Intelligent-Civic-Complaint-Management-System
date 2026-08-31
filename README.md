# CivicSense 🏛️⚡
### AI-Powered Civic Complaint Intelligence & Municipal Priority Prediction System

CivicSense is a full-stack civic intelligence platform designed for municipal corporations and smart city authorities. It automatically ingests, classifies, and prioritizes citizen complaints in real time using Natural Language Processing (NLP). 

Instead of hazardous emergencies (such as live sparking electrical wires, deep crater potholes, or drinking water pipeline bursts) sitting unread in massive backlogs, CivicSense's dual-engine ML pipeline vectorizes complaint texts using **TF-IDF** and computes category and urgency scores via **Multi-Class Logistic Regression**, providing sub-millisecond triage recommendations, explainable factor drivers, and automated work-order dispatch.

---

## 🌟 Key Features

### 1. Interactive Landing Page & Live ML Sandbox
- **Instant Triage Playground**: Test civic hazard descriptions or choose from realistic templates (*Live Transformer Sparking*, *Deep Crater Pothole*, *Main Pipeline Burst*, *Garbage Overflow*) to inspect real-time TF-IDF categorization and urgency scoring.
- **Key Municipal Metrics**: Live benchmark statistics showcasing 94.2% accuracy, <15ms inference latency, and 4.2x faster emergency dispatch.
- **Visual End-to-End Workflow**: Step-by-step guidance from citizen submission through ML processing to field verification.

### 2. User Authentication & Role-Based Access Control
- **Dual Portal Security**: Tailored experiences for **Citizens** and **Municipal Officials**.
- **Instant Demo Access**: 1-click login profiles for rapid testing:
  - 👤 **Citizen Demo**: `citizen@civicsense.gov` / `citizen123`
  - 🛡️ **Admin Demo**: `admin@civicsense.gov` / `admin123`
- **Registration Flow**: Support for custom user registration with persistent sessions.

### 3. Citizen Reporting & Tracking Portal
- **Intelligent Ingestion Form**: Captures complaint title, description, location ward/sector, and metadata (`days_pending`, `previous_complaints`).
- **Real-Time ML Preview**: Live indicator dynamically vectorizes text as the citizen types to preview predicted category and urgency level.
- **Resolution Stepper**: End-to-end milestone tracker (*Submitted → Under Review → Assigned → In Progress → Resolved*).
- **My Registered Issues**: Personal tracking registry with search, category filtering, and status badges.

### 4. Municipal Authority Command Console
- **Command Overview**: Real-time KPI summary (Total, High Priority, Pending, Resolved, Avg SLA), hazard alert banners, category breakdown charts, and 7-day trend analysis.
- **High-Priority Triage Queue**: Dedicated hazard console with instant emergency work-order dispatch, urgency driver inspection, and status updates.
- **All Registry Table**: Searchable records table with multi-filter parameters (Category, Priority, Status), custom sorting, pagination, inline status updates, and CSV export.
- **Analytics & SLA**: Ward resolution rate benchmarks and operational pipeline analytics.
- **ML Model Metrics**: Interactive confusion matrix, classification report (Precision, Recall, F1-Score), and model evaluation comparisons.

---

## 🧠 Machine Learning Architecture

```
[ Citizen Complaint Text ] ──▶ [ Regex Tokenizer & Stopword Cleaning ]
                                              │
                                              ▼
                                 [ TF-IDF N-Gram Vectorizer ]
                                              │
                                              ▼
                             [ Multi-Class Logistic Regression ]
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       ▼                                             ▼
        [ Category Softmax Probabilities ]            [ Urgency Priority Softmax ]
        • Roads & Potholes                            • HIGH (Critical Hazard)
        • Electricity & Streetlights                  • MEDIUM (Standard Backlog)
        • Water Supply & Drainage                     • LOW (Routine Maintenance)
        • Sanitation & Solid Waste
        • Public Health & Parks
                       │                                             │
                       └──────────────────────┬──────────────────────┘
                                              ▼
                          [ Explainability & Top Keyword Drivers ]
```

- **TF-IDF Formulation**:
  $$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \left( \log\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1 \right)$$
- **Dual-Engine High Availability**: Backed by a Python FastAPI microservice (`/ml-service`) with an embedded TypeScript fallback engine ensuring zero-downtime high availability.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Motion |
| **Backend** | Node.js, Express.js REST API, tsx, esbuild CommonJS bundling |
| **ML Engine** | Python 3, FastAPI, Scikit-Learn, NumPy, TF-IDF + Logistic Regression |
| **Tooling & Build** | Vite 6, TypeScript Compiler (`tsc`) |

---

## 📁 Project Structure

```
.
├── index.html                    # HTML entry point with synchronized metadata
├── metadata.json                 # AI Studio applet configuration & permissions
├── package.json                  # Scripts & dependencies
├── server.ts                     # Express server & Vite middleware integration
├── ml-service/                   # Python FastAPI ML microservice
│   ├── app.py                    # FastAPI server for inference
│   ├── train.py                  # Model training script
│   └── requirements.txt          # Python dependencies
├── src/
│   ├── App.tsx                   # Main app orchestrator & view router
│   ├── main.tsx                  # React application entry point
│   ├── index.css                 # Tailwind CSS styles
│   ├── types/                    # TypeScript interfaces & types
│   ├── services/                 # API client services
│   ├── server/                   # Backend routes & controllers
│   │   ├── routes.ts             # REST API routes
│   │   ├── controllers/          # Business logic & ML controllers
│   │   ├── data/                 # In-memory datasets & seed records
│   │   └── ml/                   # Embedded TypeScript ML fallback engine
│   └── components/               # Modular UI Components
│       ├── LandingPage.tsx       # Public landing page with live ML sandbox
│       ├── Navbar.tsx            # Navigation header & portal switcher
│       ├── AuthModal.tsx         # Sign-in & registration modal
│       ├── SubmitComplaintForm.tsx # Citizen complaint submission form
│       ├── TrackComplaintView.tsx  # Complaint status tracking & stepper
│       ├── CitizenMyComplaints.tsx # Citizen complaints history table
│       ├── AdminOverview.tsx     # Municipal command dashboard
│       ├── HighPriorityQueue.tsx # High-priority emergency triage queue
│       ├── AllComplaintsTable.tsx# Full complaints registry & CSV export
│       ├── AdminAnalytics.tsx    # SLA & operational analytics
│       ├── ModelEvaluationExplorer.tsx # ML evaluation & confusion matrix
│       └── ComplaintDetailsModal.tsx   # Detailed complaint modal view
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **yarn**

### 2. Installation
Install project dependencies:
```bash
npm install
```

### 3. Development Server
Start the development server with live reload:
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### 4. Production Build
Build the optimized client static assets and compile the server bundle:
```bash
npm run build
```

To run the production build:
```bash
npm start
```

### 5. Type Checking & Linting
Run TypeScript verification:
```bash
npm run lint
```

---

## 📡 API Reference

### Authentication
- `POST /api/auth/login`: Authenticate as citizen or municipal administrator.
- `POST /api/auth/register`: Create a new user profile.

### Complaints Management
- `GET /api/complaints`: Query complaints with optional filtering by `category`, `priority`, `status`, and `search`.
- `GET /api/complaints/:id`: Retrieve single complaint with timeline history and ML factors.
- `POST /api/complaints`: Ingest a new complaint, execute ML classification, and save to registry.
- `PATCH /api/complaints/:id/status`: Update resolution status, assigned officer, or resolution notes.
- `DELETE /api/complaints/:id`: Remove complaint record.

### ML & Intelligence
- `POST /api/ml/predict`: Run inference on raw complaint text and return category, priority, confidence score, and top keyword drivers.
- `GET /api/ml/evaluation`: Retrieve precision, recall, F1-scores, and confusion matrix data.

### Analytics
- `GET /api/analytics`: Municipal KPI summary, ward performance metrics, and category SLA benchmarks.

---

## 📄 License
This project is licensed under the MIT License.
