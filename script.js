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

// ==================== AI CHATBOT SYSTEM ====================
let chatHistory = [];

function handleChatSubmit(event) {
  event.preventDefault();
  const inputEl = document.getElementById('chat-input');
  if (!inputEl) return;
  const message = inputEl.value.trim();
  if (!message) return;

  inputEl.value = '';
  executeChatTurn(message);
}

function sendQuickPrompt(promptText) {
  executeChatTurn(promptText);
}

function appendMessage(role, text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'flex items-start gap-2';

  if (role === 'user') {
    msgDiv.innerHTML = `
      <div class="ml-auto p-2.5 rounded-2xl rounded-tr-sm bg-teal-500 text-black font-medium leading-relaxed max-w-[85%] text-xs shadow-md">
        ${escapeHtml(text)}
      </div>
    `;
  } else {
    msgDiv.innerHTML = `
      <div class="w-5 h-5 rounded-md bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-mono">
        AI
      </div>
      <div class="p-2.5 rounded-2xl rounded-tl-sm bg-neutral-900/90 border border-neutral-800 text-neutral-300 leading-relaxed max-w-[90%] text-xs">
        ${formatMarkdown(text)}
      </div>
    `;
  }

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function appendTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return null;

  const typingDiv = document.createElement('div');
  typingDiv.id = 'typing-indicator';
  typingDiv.className = 'flex items-start gap-2';
  typingDiv.innerHTML = `
    <div class="w-5 h-5 rounded-md bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-mono">
      AI
    </div>
    <div class="p-2.5 rounded-2xl rounded-tl-sm bg-neutral-900/90 border border-neutral-800 text-neutral-400 text-xs flex items-center gap-1.5">
      <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style="animation-delay: 0.2s"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style="animation-delay: 0.4s"></span>
      <span class="text-[10px] font-mono text-neutral-500 ml-1">Thinking...</span>
    </div>
  `;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;
  return typingDiv;
}

function removeTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function resetChat() {
  chatHistory = [];
  const container = document.getElementById('chat-messages');
  if (!container) return;
  container.innerHTML = `
    <div class="flex items-start gap-2">
      <div class="w-5 h-5 rounded-md bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-mono">
        AI
      </div>
      <div class="p-2.5 rounded-2xl rounded-tl-sm bg-neutral-900/90 border border-neutral-800 text-neutral-300 leading-relaxed max-w-[90%]">
        Hi there! 👋 I am Paul's AI Assistant. Ask me anything about Paul's experience at <span class="text-white font-medium">Neeyamo</span>, his <span class="text-teal-300">MCP servers</span>, projects, or technical skills!
      </div>
    </div>
  `;
}

async function executeChatTurn(userText) {
  appendMessage('user', userText);
  chatHistory.push({ role: 'user', content: userText });

  appendTypingIndicator();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText, history: chatHistory }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      removeTypingIndicator();
      if (data && data.reply) {
        appendMessage('assistant', data.reply);
        chatHistory.push({ role: 'assistant', content: data.reply });
        return;
      }
    }
  } catch (err) {
    // Falls through to built-in knowledge matcher
  }

  // Built-in intelligent response engine (instant & offline-resilient)
  removeTypingIndicator();
  const fallbackReply = generateLocalPortfolioResponse(userText);
  appendMessage('assistant', fallbackReply);
  chatHistory.push({ role: 'assistant', content: fallbackReply });
}

function generateLocalPortfolioResponse(query) {
  const q = query.toLowerCase();

  if (q.includes('skill') || q.includes('stack') || q.includes('tech') || q.includes('language') || q.includes('tool')) {
    return "Paul's core technical stack includes:\n• **AI & GenAI:** Model Context Protocol (MCP), Amazon Bedrock, LLMs/SLMs/VLMs, RAG Pipelines, Qwen fine-tuning, Qdrant\n• **ML & Vision:** PyTorch, TensorFlow, Scikit-learn, YOLO, spaCy\n• **Backend & Enterprise:** Java, Spring Boot, MySQL, REST APIs, SAP ABAP, Docker\n• **Frontend:** Angular, Streamlit, Python";
  }

  if (q.includes('neeyamo') || q.includes('aria') || q.includes('mcp') || q.includes('current role') || q.includes('job') || q.includes('work')) {
    return "Paul currently works as an **Associate Product Developer at Neeyamo** (May 2026 – Present). He is actively contributing to **Aria**, an enterprise AI chatbot. His work centers on engineering custom **Model Context Protocol (MCP)** servers in Java & Spring Boot to connect AI models with enterprise business APIs, and integrating **Amazon Bedrock** foundation models into automated workflows (like leave management and interactive confirmations).";
  }

  if (q.includes('rag') || q.includes('enterprise rag') || q.includes('retrieval') || q.includes('assistant')) {
    return "Paul built the **Enterprise RAG Assistant**, a production-grade document Q&A engine. Key highlights:\n• **Hybrid Search:** Fuses BM25 lexical search and BAAI bge-small vector embeddings using Reciprocal Rank Fusion (RRF).\n• **Cross-Encoder Reranking:** bge-reranker-base for precise passage scoring.\n• **Zero-Hallucination Triple Gate:** Enforces score floors, mandatory citations `[n]`, and strict refusal accuracy.\n• **24-Sweep Benchmark:** Automated evaluation sweep measuring Recall@k, nDCG, MRR, and p50 latency on gold datasets.";
  }

  if (q.includes('navigation') || q.includes('smart navigation') || q.includes('yolo') || q.includes('csrc') || q.includes('fund')) {
    return "The **Smart Navigation & Crowd Heatmap System** is an edge AI navigation solution for complex indoor railway stations. Paul trained a YOLO object detection pipeline combined with an A* pathfinding algorithm for real-time guidance and heatmap crowd routing. The project was selected among the **Top 20 of 100+ projects** and won a **₹18,000 CSRC research grant**!";
  }

  if (q.includes('didi') || q.includes('sign language') || q.includes('deaf') || q.includes('ssn') || q.includes('avatar')) {
    return "**AI-DIDI** is an Indian Sign Language (ISL) translator Paul built during his research internship at SSN College of Engineering. It converts text to syntactic ISL via spaCy and drives real-time 3D avatar motion synthesized with Unreal Engine, Blender, and Move AI. It was user-tested with **30+ deaf students**, achieving **>90% comprehension accuracy**!";
  }

  if (q.includes('handwritten') || q.includes('evaluation') || q.includes('ocr') || q.includes('score') || q.includes('grading')) {
    return "Paul developed the **Handwritten Answer Evaluation System**, an automated grading pipeline using OCR, NLP, and LLM APIs. It assesses student responses using cosine semantic similarity rather than brittle keyword matching, providing rubric-aligned conceptual scoring and actionable feedback.";
  }

  if (q.includes('education') || q.includes('cgpa') || q.includes('college') || q.includes('university') || q.includes('degree')) {
    return "Paul is pursuing his **B.E. in Computer Science and Engineering (Honours)** at **Anna University Regional Campus Madurai** (2022–2026) with an impressive **CGPA of 8.43 / 10**. He completed his higher secondary education at Velammal Vidyalaya with **88.4% (CBSE)**.";
  }

  if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('phone') || q.includes('reach') || q.includes('interview')) {
    return "You can get in touch with Paul directly:\n• **Email:** pauljacksenb@gmail.com\n• **Phone:** +91 70105 31540\n• **LinkedIn:** linkedin.com/in/paul-jacksen\n• **GitHub:** github.com/Faactos\nHe is actively open to full-time AI/ML Engineering and intelligent systems developer roles!";
  }

  if (q.includes('leadership') || q.includes('club') || q.includes('iconics')) {
    return "Paul served as **Secretary of the ICONICS Association**, where he led the planning and execution of campus technical symposiums, coordinated 4 student developer clubs, and fostered student open-source initiatives.";
  }

  return "Paul is an **AI/ML Engineer** specializing in Model Context Protocol (MCP), Amazon Bedrock, RAG pipelines, and full-stack systems engineering. Feel free to click one of the quick chips above or ask about his work at **Neeyamo**, **Enterprise RAG**, or **Smart Navigation**!";
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatMarkdown(str) {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-medium">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-neutral-200">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-black/60 border border-neutral-800 text-teal-300 font-mono text-[11px]">$1</code>')
    .replace(/\n• /g, '<br>&bull; ')
    .replace(/\n/g, '<br>');
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
