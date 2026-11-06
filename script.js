// JavaScript for Paul Jacksen B — Portfolio

document.addEventListener('DOMContentLoaded', () => {
  // Set Current Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Initialize Clock
  updateISTTime();
  setInterval(updateISTTime, 1000);

  // Handle Projects Nav Click
  document.querySelectorAll('a[href="#projects"]').forEach(link => {
    link.addEventListener('click', () => {
      const activeFilter = document.querySelector('.filter-btn.active');
      if (activeFilter && activeFilter.getAttribute('data-filter') === 'exp') {
        filterCategory('all');
      }
    });
  });
});

// Update IST Clock
function updateISTTime() {
  const timeEl = document.getElementById('local-time');
  if (!timeEl) return;
  const now = new Date();
  const options = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  const istTimeStr = new Intl.DateTimeFormat('en-US', options).format(now);
  timeEl.textContent = `${istTimeStr} IST (UTC+5:30)`;
}

// Copy Email Functionality
function copyEmail() {
  const email = 'pauljacksenb@gmail.com';
  navigator.clipboard.writeText(email).then(() => {
    const copyText = document.getElementById('copy-text');
    const copyBtn = document.getElementById('copy-email-btn');
    if (copyText) {
      const orig = copyText.textContent;
      copyText.textContent = 'Copied to Clipboard!';
      copyBtn.classList.add('bg-emerald-400');
      setTimeout(() => {
        copyText.textContent = orig;
        copyBtn.classList.remove('bg-emerald-400');
      }, 2500);
    }
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

// Showcase Filter Functionality
function filterCategory(category) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-filter') === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const cards = document.querySelectorAll('.card-item');
  cards.forEach(card => {
    const catAttr = card.getAttribute('data-category') || '';
    if (category === 'all' || catAttr.includes(category)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// Interactive MCP Console Simulation
const mcpOutputs = {
  status: `
<span class="text-neutral-500">// Calling jsonrpc method: tools/list</span>
{
  <span class="text-cyan-400">"tools"</span>: [
    {
      <span class="text-cyan-300">"name"</span>: "manage_leave",
      <span class="text-cyan-300">"description"</span>: "Approve or create employee leave workflow in HRMS",
      <span class="text-cyan-300">"inputSchema"</span>: { "type": "object", "properties": { "empId": "string", "days": "number" } }
    },
    {
      <span class="text-cyan-300">"name"</span>: "query_business_records",
      <span class="text-cyan-300">"description"</span>: "Fetch enterprise data from MySQL through Spring Boot JPA"
    },
    {
      <span class="text-cyan-300">"name"</span>: "bedrock_intent_dispatcher",
      <span class="text-cyan-300">"description"</span>: "Route multi-turn prompt context to foundation models"
    }
  ]
}
`,
  leave: `
<span class="text-neutral-500">// Invoking MCP tool: manage_leave</span>
<span class="text-yellow-400">POST</span> /mcp/tools/call
{
  <span class="text-cyan-400">"tool"</span>: "manage_leave",
  <span class="text-cyan-400">"arguments"</span>: { "empId": "EMP-8492", "type": "Casual", "days": 2 }
}
<span class="text-teal-400">&larr; MCP Response (200 OK):</span>
{
  <span class="text-cyan-300">"status"</span>: "SUCCESS",
  <span class="text-cyan-300">"confirmationCode"</span>: "LV-2026-X9A",
  <span class="text-cyan-300">"remainingBalance"</span>: 14,
  <span class="text-cyan-300">"message"</span>: "Leave request logged and confirmation delivered to Aria frontend."
}
`,
  bedrock: `
<span class="text-neutral-500">// Amazon Bedrock Model Invocation via Spring Boot</span>
<span class="text-indigo-400">Model:</span> amazon.titan-text-express / claude-3-sonnet
<span class="text-indigo-400">Prompt:</span> "Summarize leave policy and trigger approval workflow."
<span class="text-teal-400">&larr; Foundation Model Payload:</span>
{
  <span class="text-cyan-300">"intent"</span>: "LEAVE_APPROVAL",
  <span class="text-cyan-300">"confidence"</span>: 0.984,
  <span class="text-cyan-300">"actionInvoked"</span>: "mcp://aria-server/tools/manage_leave",
  <span class="text-cyan-300">"uiWorkflow"</span>: "Triggered interactive confirmation dialog in Angular."
}
`,
  rag: `
<span class="text-neutral-500">// Enterprise RAG Assistant: Hybrid Vector + BM25 & Cross-Encoder</span>
<span class="text-yellow-400">POST</span> /ask
{
  <span class="text-cyan-400">"question"</span>: "How many days of annual leave do full-time employees get?"
}
<span class="text-teal-400">&larr; Grounded Answer & Citations (200 OK):</span>
{
  <span class="text-cyan-300">"answer"</span>: "Full-time employees receive 20 days of paid annual leave per calendar year [1, p.4].",
  <span class="text-cyan-300">"citations"</span>: [
    { <span class="text-cyan-400">"marker"</span>: 1, <span class="text-cyan-400">"doc"</span>: "acme-leave-policy.md", <span class="text-cyan-400">"page"</span>: 4, <span class="text-cyan-400">"rerank_score"</span>: 0.942 }
  ],
  <span class="text-cyan-300">"refusalTriggered"</span>: false,
  <span class="text-cyan-300">"pipeline"</span>: "PyMuPDF -> bge-small + BM25 -> RRF Fusion -> bge-reranker-base -> Groq/Ollama",
  <span class="text-cyan-300">"latency_ms"</span>: 148
}
`
};

function runMcpDemo(type) {
  const consoleEl = document.getElementById('mcp-console-output');
  if (!consoleEl) return;
  consoleEl.innerHTML = mcpOutputs[type] || '<p class="text-red-400">Command not recognized.</p>';
}

// Modal Data
const projectDetails = {
  aria: {
    title: 'Enterprise AI Chatbot "Aria" & MCP Architecture',
    subtitle: 'Associate Product Developer @ Neeyamo • May 2026 – Present',
    tech: ['Model Context Protocol (MCP)', 'Java', 'Spring Boot', 'Amazon Bedrock', 'Angular', 'MySQL', 'REST APIs'],
    content: `
      <div class="space-y-4 text-neutral-300 text-sm leading-relaxed">
        <p>
          At <strong>Neeyamo</strong>, I contribute to the core engineering of <strong>Aria</strong>, an AI-driven enterprise chatbot system built to automate enterprise employee workflows, HR inquiries, and backend task orchestrations.
        </p>

        <h4 class="text-white font-bold text-base mt-4">Key Responsibilities & Engineering Milestones:</h4>
        <ul class="list-disc list-inside space-y-2 text-neutral-300">
          <li><strong>MCP Server Engineering:</strong> Designed and implemented custom <em>Model Context Protocol (MCP)</em> servers and tools in Java & Spring Boot, providing structured tool interfaces so AI models can securely interact with enterprise microservices.</li>
          <li><strong>Amazon Bedrock Foundation Models:</strong> Integrated foundation models with enterprise chatbot pipelines, giving the system the ability to trigger real-time backend API invocations with strict access controls.</li>
          <li><strong>End-to-End Full Stack Integration:</strong> Developed responsive Angular frontend components with interactive confirmation mechanisms and leave management workflows, coupled with Spring Boot and MySQL database transactions.</li>
          <li><strong>Secure REST APIs:</strong> Built robust REST APIs facilitating bi-directional communication between AI agent runtime environments and core enterprise services.</li>
        </ul>
      </div>
    `
  },
  'rag-assistant': {
    title: 'Enterprise RAG Assistant (Document Grounded QA & Evals)',
    subtitle: 'Production RAG System • Zero-Hallucination Gates • 24-Sweep Empirical Benchmark',
    tech: ['FastAPI', 'Qdrant (Vector DB)', 'BAAI bge-small', 'BM25 Lexical', 'bge-reranker-base', 'Streamlit', 'Docker', 'Pytest', 'Python'],
    content: `
      <div class="space-y-4 text-neutral-300 text-sm leading-relaxed">
        <p>
          A production-grade, document-grounded question answering engine designed for enterprise compliance and high-precision document interrogation. Employs a hybrid retrieval architecture backed by strict mathematical and linguistic anti-hallucination gates.
        </p>

        <h4 class="text-white font-bold text-base mt-4">Key Engineering Highlights:</h4>
        <ul class="list-disc list-inside space-y-2 text-neutral-300">
          <li><strong>Hybrid Retrieval & Reciprocal Rank Fusion (RRF):</strong> Combines BM25 lexical keyword scoring with BAAI <code>bge-small-en-v1.5</code> dense embeddings in Qdrant, mitigating failure modes where semantic search misses exact product codes or keywords.</li>
          <li><strong>Cross-Encoder Reranking:</strong> Refines top candidate pools through <code>BAAI/bge-reranker-base</code> cross-encoder scoring prior to LLM context construction.</li>
          <li><strong>Triple Anti-Hallucination Gates:</strong>
            <ul class="list-disc list-inside pl-4 mt-1 space-y-1 text-neutral-400">
              <li><strong class="text-neutral-300">Score Floor:</strong> Explicitly refuses to generate an answer if top-ranked passage relevance falls below <code>MIN_SCORE</code> threshold.</li>
              <li><strong class="text-neutral-300">Mandatory Citations:</strong> Enforces traceable <code>[n]</code> page-level citation markers; un-cited answers are automatically converted into refusals.</li>
              <li><strong class="text-neutral-300">Marker Validation:</strong> Strips phantom citation indices outside retrieved context ranges.</li>
            </ul>
          </li>
          <li><strong>Automated 24-Configuration Empirical Evaluation:</strong> Built an automated evaluation sweep framework testing 24 retrieval permutations (chunk size 256/512/1024, hybrid on/off, rerank on/off) tracking Recall@k, Precision@k, nDCG, MRR, groundedness, refusal accuracy, and p50 latency on gold test sets.</li>
          <li><strong>Data-Layer Access Control:</strong> Enforces document access lists (ACLs) directly at the retrieval/vector database layer rather than brittle route-level filters.</li>
          <li><strong>Production Serving & Stack:</strong> Deployed via FastAPI REST endpoints, Streamlit visual UI, SQLite metadata store, and Docker Compose orchestration with 100% offline Pytest test suites.</li>
        </ul>
      </div>
    `
  },
  'smart-nav': {
    title: 'Smart Indoor Navigation & Heatmap System',
    subtitle: 'Funded Research Project • Awarded ₹18,000 CSRC Funding • Top 20 of 100+',
    tech: ['YOLO Object Detection', 'A* Algorithm', 'Computer Vision', 'Edge AI', 'Voice Assistance', 'Python'],
    content: `
      <div class="space-y-4 text-neutral-300 text-sm leading-relaxed">
        <p>
          Navigating complex, crowded indoor environments like railway junctions and transit terminals poses major challenges for commuters and visually impaired individuals. This system provides real-time pathfinding, obstacle avoidance, and congestion mitigation.
        </p>

        <h4 class="text-white font-bold text-base mt-4">Key Achievements & Technical Details:</h4>
        <ul class="list-disc list-inside space-y-2 text-neutral-300">
          <li><strong>CSRC Funding Award:</strong> Selected among the <strong>Top 20 of 100+ competing engineering projects</strong> and awarded <strong>₹18,000 CSRC funding</strong>.</li>
          <li><strong>Computer Vision & Pathfinding:</strong> Trained and deployed a YOLO object detection pipeline on edge devices for real-time corridor landmark recognition, integrated with an A* algorithm for optimal indoor shortest-path calculation.</li>
          <li><strong>Crowd Heatmap & Voice Guidance:</strong> Generated real-time spatial heatmaps to route passengers away from bottlenecks while delivering turn-by-turn voice prompts.</li>
        </ul>
      </div>
    `
  },
  'ai-didi': {
    title: 'AI-DIDI: Indian Sign Language (ISL) Translation',
    subtitle: 'AI Research Intern @ SSN College of Engineering • May 2025 – Jul 2025',
    tech: ['Natural Language Processing (NLP)', 'spaCy', 'Deep Learning', 'Unreal Engine', 'Blender', 'Move AI'],
    content: `
      <div class="space-y-4 text-neutral-300 text-sm leading-relaxed">
        <p>
          <strong>AI-DIDI</strong> is an assistive AI system designed to bridge communication barriers for the deaf community in India by translating spoken/written language into accurate Indian Sign Language gestures demonstrated by an interactive 3D avatar.
        </p>

        <h4 class="text-white font-bold text-base mt-4">Validation & Implementation:</h4>
        <ul class="list-disc list-inside space-y-2 text-neutral-300">
          <li><strong>Field-Tested with 30+ Deaf Students:</strong> Validated in physical user testing sessions with 30+ deaf students, achieving an outstanding <strong>&gt;90% comprehension accuracy</strong>.</li>
          <li><strong>NLP Linguistic Pipeline:</strong> Engineered grammar transformation and token parsing using spaCy and deep learning models to convert English/regional text into ISL syntactic structures.</li>
          <li><strong>3D Motion Capture & Synthesis:</strong> Preprocessed motion capture datasets using Move AI, modeled avatars in Blender, and rendered high-fidelity real-time gesture animations in Unreal Engine.</li>
        </ul>
      </div>
    `
  },
  handwritten: {
    title: 'AI Handwritten Answer Evaluation System',
    subtitle: 'Automated Grading Pipeline using OCR, NLP & LLMs',
    tech: ['Optical Character Recognition (OCR)', 'NLP', 'LLM APIs', 'Semantic Similarity', 'Python'],
    content: `
      <div class="space-y-4 text-neutral-300 text-sm leading-relaxed">
        <p>
          An automated answer grading pipeline built to relieve educators from repetitive manual evaluation while providing transparent, rubric-aligned feedback to students.
        </p>

        <h4 class="text-white font-bold text-base mt-4">Core Pipeline:</h4>
        <ul class="list-disc list-inside space-y-2 text-neutral-300">
          <li><strong>OCR Text Extraction:</strong> Transcribes handwritten answer sheets into clean text tokens.</li>
          <li><strong>Semantic Similarity Matching:</strong> Evaluates conceptual alignment against model answers using vector embeddings and cosine similarity rather than brittle keyword matching.</li>
          <li><strong>LLM Grammar & Feedback Synthesis:</strong> Employs LLM APIs to score clarity, relevance, and grammar while automatically generating personalized constructive feedback for students.</li>
        </ul>
      </div>
    `
  },
  maitsys: {
    title: 'SAP ABAP & Artificial Intelligence Internship',
    subtitle: 'Maitsys, Madurai • Jan 2026 – Apr 2026',
    tech: ['Qwen Model Family', 'RAG Pipelines', 'Vector Embeddings', 'Model Fine-Tuning', 'SAP ABAP', 'OData Services'],
    content: `
      <div class="space-y-4 text-neutral-300 text-sm leading-relaxed">
        <p>
          Explored the convergence of enterprise ERP architectures and cutting-edge open-weights AI model families at <strong>Maitsys</strong>.
        </p>

        <h4 class="text-white font-bold text-base mt-4">Key Work:</h4>
        <ul class="list-disc list-inside space-y-2 text-neutral-300">
          <li><strong>LLM / SLM Research & Qwen:</strong> Conducted practical experimentation with the <em>Qwen</em> model family (small language models and vision-language models), evaluating performance on domain-specific enterprise prompts.</li>
          <li><strong>RAG Pipeline Development:</strong> Built end-to-end Retrieval-Augmented Generation workflows consisting of document chunking strategies, dense vector embeddings, and semantic similarity search.</li>
          <li><strong>SAP ABAP Backend:</strong> Implemented OData services, custom database tables, and CRUD operations to connect SAP enterprise data with external applications.</li>
        </ul>
      </div>
    `
  }
};

// Open Project Details Modal
function openModal(id) {
  const modal = document.getElementById('project-modal');
  const contentEl = document.getElementById('modal-content');
  const data = projectDetails[id];
  if (!modal || !contentEl || !data) return;

  const techBadges = data.tech.map(t => `<span class="tech-tag text-xs">${t}</span>`).join(' ');

  contentEl.innerHTML = `
    <div class="space-y-3">
      <div class="pr-6">
        <h3 class="text-xl sm:text-2xl font-bold text-white">${data.title}</h3>
        <p class="text-xs font-mono text-teal-400 mt-1">${data.subtitle}</p>
      </div>

      <div class="flex flex-wrap gap-1.5 pt-2 pb-3 border-b border-neutral-800">
        ${techBadges}
      </div>

      <div class="pt-2">
        ${data.content}
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

// Close Modal
function closeModal() {
  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const hamburger = document.getElementById('hamburger-icon');
  const close = document.getElementById('close-icon');
  if (!menu) return;

  const isHidden = menu.classList.contains('hidden');
  if (isHidden) {
    menu.classList.remove('hidden');
    hamburger?.classList.add('hidden');
    close?.classList.remove('hidden');
  } else {
    menu.classList.add('hidden');
    hamburger?.classList.remove('hidden');
    close?.classList.add('hidden');
  }
}

function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const hamburger = document.getElementById('hamburger-icon');
  const close = document.getElementById('close-icon');
  if (menu) menu.classList.add('hidden');
  hamburger?.classList.remove('hidden');
  close?.classList.add('hidden');
}

// Close mobile menu on click outside
document.addEventListener('click', (e) => {
  const header = document.querySelector('header');
  const menu = document.getElementById('mobile-menu');
  if (menu && !menu.classList.contains('hidden') && header && !header.contains(e.target)) {
    closeMobileMenu();
  }
});

// Close on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeMobileMenu();
  }
});

// Close when clicking modal backdrop
document.getElementById('project-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'project-modal') closeModal();
});
