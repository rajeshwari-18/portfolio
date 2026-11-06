# Paul Jacksen B — AI/ML Engineer Bento Portfolio

A modern, high-performance personal portfolio inspired by the signature **Bento-grid design style** (similar to [jestsee.com/#bento](https://www.jestsee.com/#bento)), custom-tailored for **Paul Jacksen B** based on your resume and projects.

---

## 🌟 Key Features & Highlights

1. **Bento Grid Architecture:**
   - **Spotlight Role Card:** Highlights your work at **Neeyamo** on **Aria** (Enterprise AI Chatbot, Model Context Protocol servers in Java, Amazon Bedrock, Spring Boot, Angular).
   - **Interactive MCP Console Simulator:** Recruiters and engineers can click live tool buttons (`list_tools()`, `invoke("manage_leave")`, `rag.ask()`, `bedrock.query()`) to see simulated JSON-RPC MCP calls and foundation model outputs in real time.
   - **Featured Projects:**
     - ⚡ **Enterprise RAG Assistant:** Document-grounded QA engine with BM25 + dense vector hybrid retrieval, Reciprocal Rank Fusion (RRF), cross-encoder reranking, anti-hallucination gates, and a 24-configuration automated empirical evaluation sweep.
     - 🏆 **Smart Navigation System:** Indoor railway guidance with YOLO & A* pathfinding (Selected Top 20 of 100+ & awarded ₹18,000 CSRC funding).
     - 🤟 **AI-DIDI (Sign Language Translator):** 90%+ comprehension accuracy tested with 30+ deaf students, using spaCy, Blender, Unreal Engine, and Move AI.
     - 📝 **Handwritten Answer Evaluation:** Automated grading pipeline using OCR, NLP, and LLM APIs.
   - **Internship Milestone:** **Maitsys** (Qwen model family fine-tuning, RAG pipelines, SAP ABAP OData).
   - **Education & Honors:** Anna University Regional Campus Madurai (B.E. CSE Honours, 8.43 CGPA).
   - **Leadership:** Secretary of ICONICS Association (Coordinating 4 clubs & campus events).
   - **Categorized Tech Arsenal:** Structured badges for AI/GenAI (Bedrock, MCP, Qdrant, RAG), Computer Vision, Backend/Enterprise (Spring Boot, FastAPI), and Frontend/Tools (Angular, Streamlit, Python).

2. **Interactive Polish:**
   - **Live IST Clock:** Displays real-time local time (`IST UTC+5:30`) with a pulsating availability beacon.
   - **One-Click Email Copy:** Copies `pauljacksenb@gmail.com` with animated feedback.
   - **Filter Tabs:** Filter bento cards by `All`, `AI / GenAI`, `Projects`, or `Experience`.
   - **Deep-Dive Case Study Modals:** Click "Details &rarr;" on any card to read full architecture, challenges, and metrics.
   - **Zero Build Friction:** No complex build chains required — fully compatible with direct browser preview or static hosting.

---

## 🚀 How to View & Run

### Option 1: Instant Browser View (Zero Setup)
Simply navigate to your `portfo` folder and **double-click** `index.html` to open it in your browser (Chrome, Edge, Firefox, Brave, etc.).

### Option 2: Run a Local Dev Server
Open PowerShell in this folder and run:
```bash
npx serve .
```
Then visit `http://localhost:3000`.

---

## 🌐 Free 1-Click Deployment Options

### GitHub Pages:
1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Bento Portfolio"
   git branch -M main
   git remote add origin https://github.com/Faactos/portfolio.git
   git push -u origin main
   ```
2. In your GitHub repo, go to **Settings &rarr; Pages** &rarr; Select `main` branch root (`/`) &rarr; **Save**. Your site will be live at `https://faactos.github.io/portfolio`.

### Vercel / Netlify:
* Drag and drop this folder directly into the [Vercel Dashboard](https://vercel.com) or [Netlify Drop](https://app.netlify.com/drop) for instant deployment with SSL and custom domain support.
