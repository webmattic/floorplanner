# FloorPlanner Architecture and Design Document

## 1. System Overview

**Core Functionality:** Web-based floor planning application with real-time collaboration, 2D/3D visualization, CAD import, and professional export capabilities.

**Key Features:**

| Feature                  | Description                           |
| ------------------------ | ------------------------------------- |
| Drag-and-drop interface  | Automatic alignment of elements       |
| Real-time 2D-to-3D sync  | Seamless conversion between views     |
| Material personalization | Customize materials and lighting      |
| Multi-user collaboration | Shared cursors and real-time editing  |
| CAD file import          | Supports DXF, DWG, IFC, Revit formats |
| 8K rendering             | Photorealistic export capabilities    |
| Version history          | Track changes with visual diffing     |
| Customizable workspace   | Floating panels and UI customization  |

**Architecture Style:** Jamstack (React frontend) + Microservices backend

2. System Architecture Diagram

graph TD
A[Client] --> B[CDN]
A --> C[API Gateway]
subgraph Frontend
D[React Application]
E[Konva.js Canvas]
F[Three.js 3D]
G[shadcn UI Components]
end

    subgraph Backend
        C --> H[FastAPI Services]
        H --> I[Auth Service]
        H --> J[Collaboration Service]
        H --> K[Rendering Service]
        H --> L[CAD Processing Service]
        H --> M[Admin Service]
    end

    subgraph Data Layer
        I --> N[(PostgreSQL DB)]
        J --> O[(Redis)]
        K --> P[(S3 Storage)]
        L --> Q[(S3 Storage)]
        M --> R[(TimescaleDB)]
    end

    subgraph Infrastructure
        S[Cloudflare]
        T[AWS ECS/Fargate]
        U[Cloudflare Workers]
        V[AWS Lambda]
    end

## 3. Technology Stack

### Frontend

| Component               | Technology                   |
| ----------------------- | ---------------------------- |
| Core Framework          | React 18 + TypeScript        |
| State Management        | Zustand                      |
| 2D Canvas               | Konva.js                     |
| 3D Visualization        | Three.js + React Three Fiber |
| UI Components           | shadcn UI + Lucide Icons     |
| Real-time Communication | WebSocket + Socket.IO        |
| Routing                 | React Router 6               |
| Build Tool              | Vite                         |

### Backend

| Service          | Technology               | Responsibility              |
| ---------------- | ------------------------ | --------------------------- |
| API Gateway      | FastAPI + Uvicorn        | Request routing             |
| Auth Service     | FastAPI + OAuth2         | Authentication & RBAC       |
| Collaboration    | FastAPI + WebSockets     | Real-time editing           |
| Rendering        | FastAPI + Ray            | 8K image/video processing   |
| CAD Processing   | FastAPI + pythonocc-core | CAD conversion              |
| Admin Service    | FastAPI + SQLAdmin       | User management & analytics |
| Background Tasks | Celery + Redis           | Async processing            |

### Data Storage

| Data Type       | Storage Solution        |
| --------------- | ----------------------- |
| User Profiles   | PostgreSQL              |
| Floor Plans     | PostgreSQL (JSONB) + S3 |
| CAD Files       | S3 + Glacier            |
| Renders/Exports | S3                      |
| Real-time State | Redis                   |
| Analytics       | TimescaleDB             |
| Audit Logs      | PostgreSQL              |

### Infrastructure

| Component          | Technology           |
| ------------------ | -------------------- |
| Hosting            | AWS ECS/Fargate      |
| CDN                | Cloudflare           |
| File Storage       | AWS S3               |
| Monitoring         | Prometheus + Grafana |
| Logging            | ELK Stack            |
| CI/CD              | GitHub Actions       |
| Secrets Management | HashiCorp Vault      |

4. Frontend Architecture
   Component Hierarchy
   text
   src/
   ├── components/
   │ ├── canvas/ # 2D drawing system
   │ ├── panels/ # Floating UI panels
   │ │ ├── DrawingTools.tsx
   │ │ ├── FurnitureLibrary.tsx
   │ │ ├── 3DViewer.tsx
   │ │ └── ... (12 panels total)
   │ ├── workspace/ # Panel management
   │ └── ui/ # shadcn wrappers
   ├── stores/
   │ ├── usePanelStore.ts # Zustand panel state
   │ ├── useCanvasStore.ts # Canvas state
   │ └── useCollaborationStore.ts
   ├── hooks/
   │ ├── useDragResize.ts # Panel interactions
   │ ├── useWebSocket.ts # Real-time comms
   │ └── useCADProcessor.ts
   ├── services/
   │ ├── api.ts # API client
   │ ├── renderService.ts # Export handlers
   │ └── auth.ts
   └── utils/
   ├── measurement.ts # Dimension calculations
   └── geometry.ts # CAD conversion helpers

Panel System Design
typescript
// Panel configuration
interface PanelConfig {
id: string;
defaultPosition: { x: number; y: number };
defaultSize: { width: number; height: number };
minSize: { width: number; height: number };
persistenceKey: string;
}

// Zustand store
const usePanelStore = create<PanelState>()((set) => ({
panels: {
drawing: { x: 10, y: 10, width: 300, height: 400, minimized: false },
// ... other panels
},
actions: {
movePanel: (id, position) => set(/_ update position _/),
resizePanel: (id, size) => set(/_ update size _/),
toggleMinimize: (id) => set(/_ toggle state _/)
}
}));

5. Backend Services
   Service Architecture

sequenceDiagram
participant C as Client
participant G as API Gateway
participant A as Auth Service
participant R as Rendering Service
participant D as Database

    C->>G: POST /render (JWT)
    G->>A: Validate token
    A-->>G: User roles
    G->>R: Forward request
    R->>D: Get floorplan data
    D-->>R: JSON data
    R->>R: Generate 8K render
    R->>S3: Store output
    R-->>G: Presigned URL
    G-->>C: Download link

### Key Endpoints

| Service        | Endpoint            | Method | Description                   |
| -------------- | ------------------- | ------ | ----------------------------- |
| Auth           | /auth/token         | POST   | JWT token generation          |
| Collaboration  | /collab/{plan_id}   | WS     | WebSocket connection          |
| CAD Processing | /cad/import         | POST   | Process CAD files             |
| Rendering      | /render/image       | POST   | Generate 8K render            |
| Admin          | /admin/users        | GET    | List users (admin only)       |
| Storage        | /storage/signed-url | GET    | Generate upload/download URLs |

6. Data Models
   Core Entities

erDiagram
USER ||--o{ FLOORPLAN : owns
USER {
uuid id
string email
string hashed_password
string[] roles
datetime created_at
}

    FLOORPLAN {
        uuid id
        uuid owner_id
        jsonb design_data
        jsonb versions
        datetime last_modified
    }

    COLLABORATOR {
        uuid user_id
        uuid plan_id
        string access_level
    }

    RENDER_JOB {
        uuid id
        uuid plan_id
        string status
        string output_url
        datetime created_at
    }

7. Security Architecture
   Multi-Layer Protection
   graph LR
   A[Client] --> B[Cloudflare WAF]
   B --> C[API Gateway]
   C --> D[Rate Limiting]
   D --> E[JWT Validation]
   E --> F[RBAC Enforcement]
   F --> G[Service Layer]
   G --> H[SQL Injection Prevention]
   H --> I[Data Encryption]

Key Security Measures:
Authentication: JWT with OAuth2

Authorization: Role-Based Access Control (RBAC)

Data Protection: AES-256 encryption at rest

Network Security: VPC isolation + Security Groups

Auditing: Comprehensive activity logging

File Scanning: ClamAV for uploads

8. Admin System
   Admin Features:
   User Management:

Role assignment (Admin, Designer, Contractor, Client)

Storage quota configuration

Activity monitoring

Analytics Dashboard:

pie
title Feature Usage
"3D Preview" : 78
"PDF Export" : 62
"Collaboration" : 54
"CAD Import" : 42

Content Moderation:
Plan review system
Abuse reporting
Automated content scanning

Billing Integration:
Stripe subscription management
Usage-based billing
Invoice generation

9. Performance Optimization
   Frontend
   Canvas: Object pooling in Konva.js
   Panels: Virtualized scrolling for libraries
   3D: Level-of-detail adjustments in Three.js
   Assets: Dynamic import of heavy components

Backend
python

# Async CAD processing

@app.post("/cad/import")
async def import_cad(file: UploadFile = File(...)): # Quick validation
if not valid_cad_file(file.filename):
raise HTTPException(400, "Invalid file type")

    # Offload heavy processing
    task = process_cad.delay(await file.read())
    return {"task_id": task.id}

Infrastructure
Caching: Redis for frequent queries

CDN: Cloudflare for global assets

Auto-scaling: ECS Fargate based on load

Parallel Processing: Ray for rendering tasks

10. Deployment Architecture
    AWS Environment
    graph TB
    subgraph AWS
    subgraph VPC
    subgraph Public Subnet
    A[ALB]
    end
                subgraph Private Subnet
                    B[ECS Tasks]
                    C[RDS PostgreSQL]
                    D[ElastiCache Redis]
                end

                subgraph Services
                    E[S3]
                    F[Lambda]
                end
            end

            G[CloudFront]
            H[Cloudflare]
        end

        I[Users] --> H
        H --> G
        G --> A
        A --> B
        B <--> C
        B <--> D
        B <--> E
        B --> F

CI/CD Pipeline
Code Commit → 2. Linting/Type Checking → 3. Unit Tests → 4. Build Artifacts →

Security Scan → 6. Staging Deployment → 7. E2E Tests → 8. Production Canary Release

11. Error Handling
    Unified Error Responses
    json
    {
    "error": {
    "code": "CAD_CONVERSION_FAILED",
    "message": "DXF file contained unsupported entities",
    "details": {
    "file_id": "dxf_12345",
    "unsupported_entities": ["ACAD_PROXY_ENTITY"],
    "timestamp": "2023-11-15T12:34:56Z"
    }
    }
    }
    Monitoring Stack:
    Errors: Sentry + CloudWatch Logs

Performance: Prometheus metrics

Alerts: PagerDuty integration

Audit Trail: PostgreSQL audit table

12. Future Considerations
    Mobile Apps: React Native implementation

VR Integration: Oculus/Meta Quest support

AI Features:

Automated furniture arrangement

Material recommendation engine

BIM Export: IFC 4.3 compatibility

Desktop App: Electron wrapper for offline use

## 13. Appendix

### Key Performance Metrics

| Metric              | Target  |
| ------------------- | ------- |
| Canvas Render Time  | < 50ms  |
| 3D Sync Latency     | < 100ms |
| Panel Drag Response | < 16ms  |

8K Render Time (4K res) < 30s
CAD Import (100MB file) < 15s
API Response P99 < 300ms
Disaster Recovery Plan
Data: Daily S3 snapshots + Multi-region replication

Infrastructure: Terraform-managed infrastructure

Failover: Multi-AZ RDS + Route53 health checks

Backup Verification: Weekly recovery drills
