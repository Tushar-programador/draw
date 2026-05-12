# Product Requirements Document (PRD) v2.0: Project "Zenith Canvas"

## 1. Executive Summary
**Project Name:** Zenith Canvas  
**Objective:** A high-performance, AI-native collaborative whiteboard designed for engineers and production environments.  
**Version:** 2.0 (Updated to Node.js & Advanced Sync Stack)

---

## 2. Updated Technology Stack (Node.js Centric)
Based on the pivot to a unified JavaScript/TypeScript ecosystem for faster development and easier maintenance.

* **Backend:** Node.js with **Fastify** (Performance-focused API)
* **Real-time Logic:** **Socket.io** + **Hocuspocus** (Yjs backend provider)
* **Database:** * **PostgreSQL + Prisma:** For User accounts, Team structures, and Permissions.
    * **MongoDB:** For persistent storage of the collaborative document JSON state.
* **Frontend:** React + TypeScript + Vite.
* **Canvas Engine:** **tldraw SDK** (Customized for high performance).
* **Desktop Shell:** **Tauri** (Leveraging existing experience in low-resource development).

---

## 3. Key Feature Enhancements (The Commercial Moat)

### 3.1. Advanced Collaboration
* **Sub-50ms Sync:** Using Yjs CRDTs to prevent data loss or "cursor jumping" during multi-user sessions.
* **Granular Persistence:** Real-time saving to MongoDB via Hocuspocus, ensuring zero data loss if a browser crashes.

### 3.2. Engineering-First AI (Gemini + Local AI)
* **Hybrid AI Mode:** * Cloud-based **Gemini API** for heavy tasks (Sketch-to-React component, Infrastructure generation).
    * **Local AI (Ollama/WebGPU):** For privacy-sensitive technical brainstorming and OCR.
* **Diagram-to-Code:** Direct export paths to Mermaid.js, Terraform, and CSS.

### 3.3. Commercial-Grade Security
* **End-to-End Encryption (E2EE):** Optional encrypted rooms where the server never stores raw drawing data.
* **Role-Based Access Control (RBAC):** Hierarchical permissions (Owner > Admin > Editor > Viewer) at the workspace and folder levels.

---

## 4. User Experience (UX) & Performance
* **Resource Efficiency:** Leveraging **Tauri** to ensure the desktop app uses < 200MB of RAM (significantly better than Miro/Electron).
* **Offline Mode:** Users can work locally in Tauri; changes sync to the Node.js server automatically once an internet connection is restored.
* **Unified Validation:** Using **Zod** to ensure data shapes are identical across Frontend, Backend, and Database.

---

## 5. Comparison: Zenith Canvas vs. Competitors

| Feature | Zenith Canvas | Excalidraw Plus | Miro |
| :--- | :--- | :--- | :--- |
| **Language Stack** | Node.js / TS / Tauri | JS / Web | Heavy Enterprise Web |
| **Data Sync** | Yjs + Hocuspocus | Custom Sync | Proprietary |
| **Primary Moat** | Engineering AI + Speed | Hand- drawn Style | Enterprise Features |
| **Memory Usage** | Very Low (Tauri) | Medium (Web) | High (Browser/Electron) |

---

## 6. Development Roadmap
* **Milestone 1:** Fastify backend + Socket.io + basic tldraw canvas.
* **Milestone 2:** Hocuspocus implementation for MongoDB persistence and Yjs sync.
* **Milestone 3:** Tauri desktop wrapper integration.
* **Milestone 4:** Gemini-powered "Sketch-to-Code" feature launch.
