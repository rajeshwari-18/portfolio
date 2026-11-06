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

// ==================== FLOATING AI CHATBOT ====================
let chatHistory = [];
let chatBusy = false;

const CHAT_GREETING = "Hi! 👋 I'm Paul's AI assistant. Ask me about his work at **Neeyamo**, his **MCP servers**, projects, skills, or how to reach him.";

// Actions the assistant can trigger with tags like [[open:rag-assistant]]
const CHAT_ACTIONS = {
  open: {
    'aria': 'Aria & MCP details',
    'smart-nav': 'Smart Navigation details',
    'ai-didi': 'AI-DIDI details',
    'handwritten': 'Answer Evaluation details',
    'rag-assistant': 'Enterprise RAG details',
    'maitsys': 'Maitsys internship details'
  },
  goto: {
    'projects': 'Go to Projects',
    'experience': 'Go to Experience',
    'skills': 'Go to Tech Stack',
    'contact': 'Go to Contact'
  }
};

function toggleChat(force) {
  const panel = document.getElementById('chat-panel');
  const launcher = document.getElementById('chat-launcher');
  if (!panel) return;
  const open = typeof force === 'boolean' ? force : panel.classList.contains('hidden');
  panel.classList.toggle('hidden', !open);
  document.body.classList.toggle('chat-open', open);
  launcher?.setAttribute('aria-expanded', String(open));
  document.getElementById('chat-icon-open')?.classList.toggle('hidden', open);
  document.getElementById('chat-icon-close')?.classList.toggle('hidden', !open);
  launcher?.setAttribute('aria-label', open ? 'Close AI assistant' : 'Open AI assistant');
  hideChatHint();
  if (open) {
    const container = document.getElementById('chat-messages');
    if (container && !container.children.length) resetChat();
    // Avoid popping the keyboard on phones; focus only on larger screens
    if (window.matchMedia('(min-width: 640px)').matches) {
      document.getElementById('chat-input')?.focus();
    }
  }
}

// Small one-time "Ask me" hint next to the button (desktop only)
function hideChatHint() {
  document.getElementById('chat-hint')?.classList.remove('show');
}
document.addEventListener('DOMContentLoaded', () => {
  const hint = document.getElementById('chat-hint');
  if (!hint) return;
  setTimeout(() => {
    if (!document.body.classList.contains('chat-open')) hint.classList.add('show');
    setTimeout(hideChatHint, 5000);
  }, 2500);
});

function handleChatSubmit(event) {
  event.preventDefault();
  const inputEl = document.getElementById('chat-input');
  if (!inputEl) return;
  const message = inputEl.value.trim();
  if (!message || chatBusy) return;
  inputEl.value = '';
  executeChatTurn(message);
}

function sendQuickPrompt(promptText) {
  if (chatBusy) return;
  toggleChat(true);
  executeChatTurn(promptText);
}

// Pull [[type:value]] tags out of a reply and return clean text + actions
function extractActions(text) {
  const actions = [];
  const clean = String(text).replace(/\[\[\s*(open|goto|copy-email)\s*(?::\s*([\w-]+))?\s*\]\]/gi, (_, type, value) => {
    type = type.toLowerCase();
    if (type === 'copy-email') actions.push({ type, label: 'Copy email' });
    else if (CHAT_ACTIONS[type] && CHAT_ACTIONS[type][value]) actions.push({ type, value, label: CHAT_ACTIONS[type][value] });
    return '';
  }).trim();
  const seen = new Set();
  return { clean, actions: actions.filter(a => { const k = a.type + (a.value || ''); if (seen.has(k)) return false; seen.add(k); return true; }) };
}

function runChatAction(type, value) {
  if (type === 'open') {
    openModal(value);
  } else if (type === 'goto') {
    if (window.matchMedia('(max-width: 639px)').matches) toggleChat(false);
    if (value === 'projects') filterCategory('all');
    document.getElementById(value)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (type === 'copy-email') {
    copyEmail();
  }
}

function appendMessage(role, text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const msgDiv = document.createElement('div');

  if (role === 'user') {
    msgDiv.className = 'flex justify-end';
    msgDiv.innerHTML = `<div class="px-3 py-2 rounded-2xl rounded-tr-sm bg-teal-500 text-black font-medium leading-relaxed max-w-[85%] break-words">${escapeHtml(text)}</div>`;
  } else {
    const { clean, actions } = extractActions(text);
    msgDiv.className = 'flex items-start gap-2';
    const actionHtml = actions.length
      ? `<div class="flex flex-wrap gap-1.5 mt-2">${actions.map(a =>
          `<button class="chat-action" data-type="${a.type}" data-value="${a.value || ''}">${escapeHtml(a.label)} &rarr;</button>`).join('')}</div>`
      : '';
    msgDiv.innerHTML = `
      <div class="w-6 h-6 rounded-md bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-mono">AI</div>
      <div class="px-3 py-2 rounded-2xl rounded-tl-sm bg-neutral-900 border border-neutral-800 text-neutral-300 leading-relaxed max-w-[88%] break-words">
        ${formatMarkdown(clean)}${actionHtml}
      </div>`;
    msgDiv.querySelectorAll('.chat-action').forEach(btn => {
      btn.addEventListener('click', () => runChatAction(btn.dataset.type, btn.dataset.value));
    });
  }
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function appendTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typing-indicator';
  typingDiv.className = 'flex items-start gap-2';
  typingDiv.innerHTML = `
    <div class="w-6 h-6 rounded-md bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-mono">AI</div>
    <div class="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-neutral-900 border border-neutral-800 flex items-center gap-1.5">
      <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style="animation-delay:.2s"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style="animation-delay:.4s"></span>
    </div>`;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  document.getElementById('typing-indicator')?.remove();
}

function resetChat() {
  chatHistory = [];
  const container = document.getElementById('chat-messages');
  if (!container) return;
  container.innerHTML = '';
  appendMessage('assistant', CHAT_GREETING);
}

function setChatBusy(busy) {
  chatBusy = busy;
  const send = document.getElementById('chat-send');
  if (send) send.disabled = busy;
}

async function executeChatTurn(userText) {
  appendMessage('user', userText);
  appendTypingIndicator();
  setChatBusy(true);

  let reply = null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText, history: chatHistory.slice(-8) }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) reply = data.reply;
    } else if (res.status === 429) {
      reply = "You're sending messages a bit fast — please wait a few seconds and try again. ⏳";
    }
  } catch (err) {
    // Network error / timeout / opened as a local file → use built-in answers
  }

  if (!reply) reply = generateLocalPortfolioResponse(userText);

  removeTypingIndicator();
  appendMessage('assistant', reply);
  chatHistory.push({ role: 'user', content: userText });
  chatHistory.push({ role: 'assistant', content: extractActions(reply).clean });
  setChatBusy(false);
}

// Built-in answers used when the Groq API is unavailable.
// Each intent has keywords with weights; the best-scoring intent wins.
const LOCAL_INTENTS = [
  {
    id: 'greeting',
    words: { hi: 3, hii: 3, hello: 3, hey: 3, hola: 3, 'good morning': 3, 'good evening': 3, namaste: 3, vanakkam: 3 },
    exact: true,
    reply: "Hi! 👋 Nice to meet you. I can tell you about Paul's **projects**, his current role at **Neeyamo**, his **skills**, or how to **contact** him. What would you like to know?"
  },
  {
    id: 'thanks',
    words: { thanks: 3, thank: 3, thx: 3, great: 1, awesome: 1, cool: 1 },
    exact: true,
    reply: "You're welcome! 😊 If you'd like to talk to Paul directly, his email is **pauljacksenb@gmail.com**.\n[[copy-email]]"
  },
  {
    id: 'projects',
    words: { project: 4, projects: 4, built: 2, build: 2, portfolio: 2, works: 2, 'side project': 3, showcase: 2 },
    reply: "Here are Paul's main projects:\n• **Smart Navigation & Crowd Heatmap** — indoor railway navigation with YOLO + A* pathfinding. Top 20 of 100+, ₹18,000 CSRC grant.\n• **AI-DIDI** — Indian Sign Language translator with 3D avatars, >90% comprehension with 30+ deaf students.\n• **Handwritten Answer Evaluation** — OCR + NLP + LLM grading pipeline with semantic scoring.\n• **Enterprise RAG Assistant** — hybrid BM25 + vector retrieval, reranking and anti-hallucination gates.\nAsk me about any one for details!\n[[goto:projects]]"
  },
  {
    id: 'neeyamo',
    words: { neeyamo: 5, aria: 5, work: 3, working: 3, employed: 3, now: 1, mcp: 4, bedrock: 4, 'current role': 5, 'current job': 5, currently: 2, job: 2, company: 2, role: 2, 'model context': 4 },
    reply: "Paul is an **Associate Product Developer at Neeyamo** (May 2026 – Present), working on **Aria**, an enterprise AI chatbot.\n• Builds **MCP (Model Context Protocol) servers** in Java & Spring Boot so AI models can safely call enterprise APIs.\n• Integrates **Amazon Bedrock** foundation models into workflows like leave management and confirmations.\n• Works across the Angular chat UI and Spring Boot / MySQL backend.\n[[open:aria]]"
  },
  {
    id: 'experience',
    words: { experience: 4, internship: 4, intern: 4, worked: 2, maitsys: 5, career: 3, background: 2, timeline: 3 },
    reply: "Paul's experience:\n• **Neeyamo** — Associate Product Developer (May 2026 – Present): Aria chatbot, MCP servers, Amazon Bedrock.\n• **Maitsys** — SAP ABAP & AI Intern (Jan – Apr 2026): Qwen fine-tuning, RAG pipelines, SAP OData services.\n• **SSN College of Engineering** — AI Research Intern (May – Jul 2025): built the AI-DIDI sign language translator.\n[[goto:experience]]"
  },
  {
    id: 'rag',
    words: { rag: 5, retrieval: 4, 'enterprise rag': 6, hallucination: 4, rerank: 4, reranking: 4, qdrant: 4, bm25: 5 },
    reply: "The **Enterprise RAG Assistant** is a document-grounded Q&A system:\n• **Hybrid search** — BM25 + bge-small vectors fused with Reciprocal Rank Fusion.\n• **Cross-encoder reranking** with bge-reranker-base.\n• **3 anti-hallucination gates** — score floor, mandatory citations, refusal checks.\n• **24-configuration evaluation sweep** on a gold test set.\n[[open:rag-assistant]]"
  },
  {
    id: 'smartnav',
    words: { navigation: 5, 'smart navigation': 6, yolo: 5, heatmap: 5, railway: 4, csrc: 5, funded: 3, grant: 3, 'a*': 4, pathfinding: 4 },
    reply: "The **Smart Navigation & Crowd Heatmap System** guides people through crowded railway stations:\n• **YOLO** object detection for real-time crowd sensing.\n• **A* pathfinding** for routing, with voice-assisted guidance.\n• Selected **Top 20 of 100+ projects** and awarded a **₹18,000 CSRC grant**.\n[[open:smart-nav]]"
  },
  {
    id: 'didi',
    words: { didi: 6, 'ai-didi': 6, sign: 4, 'sign language': 6, deaf: 5, avatar: 4, ssn: 4, unreal: 3, blender: 3 },
    reply: "**AI-DIDI** translates text into **Indian Sign Language** with a 3D avatar:\n• NLP pipeline with **spaCy** to convert text to ISL grammar.\n• Avatar motion built with **Unreal Engine, Blender and Move AI**.\n• Tested with **30+ deaf students** — **>90% comprehension accuracy**.\n[[open:ai-didi]]"
  },
  {
    id: 'handwritten',
    words: { handwritten: 6, ocr: 5, grading: 4, evaluation: 3, answer: 2, exam: 3 },
    reply: "The **Handwritten Answer Evaluation System** grades student answer sheets automatically:\n• **OCR** reads the handwriting.\n• **NLP + LLM APIs** score concept coverage with semantic similarity, not just keywords.\n• Generates feedback on grammar, clarity and missing concepts.\n[[open:handwritten]]"
  },
  {
    id: 'skills',
    words: { skill: 4, skills: 4, stack: 4, tech: 3, technologies: 4, language: 3, languages: 3, tools: 3, framework: 3, know: 1 },
    reply: "Paul's main skills:\n• **AI & GenAI:** MCP, Amazon Bedrock, LLMs/SLMs/VLMs, RAG, Qdrant, Qwen fine-tuning\n• **ML & Vision:** PyTorch, TensorFlow, Scikit-learn, YOLO, spaCy\n• **Backend:** Java, Spring Boot, FastAPI, MySQL, REST APIs, SAP ABAP, Docker\n• **Frontend & tools:** Angular, Streamlit, Python, Power BI, Git\n[[goto:skills]]"
  },
  {
    id: 'hire',
    words: { hire: 5, 'why should': 5, strengths: 4, strength: 4, fit: 3, good: 1, best: 2, recommend: 3, choose: 3 },
    reply: "Why Paul is a strong AI/ML hire:\n• **Ships production AI** — builds MCP servers and Bedrock integrations for an enterprise chatbot today.\n• **Full-stack range** — from model work (RAG, YOLO, fine-tuning) to Java/Spring Boot backends and Angular UIs.\n• **Proven results** — Top 20 of 100+ with a CSRC grant, >90% accuracy in user testing with deaf students.\n• **Leadership** — Secretary of the ICONICS Association, coordinating 4 student clubs.\n[[goto:contact]]"
  },
  {
    id: 'education',
    words: { education: 5, cgpa: 5, gpa: 5, college: 4, university: 4, degree: 4, study: 3, studied: 3, school: 3, anna: 4 },
    reply: "Paul's education:\n• **B.E. Computer Science & Engineering (Honours)**, Anna University Regional Campus Madurai (2022–2026) — **CGPA 8.43 / 10**.\n• **CBSE Higher Secondary**, Velammal Vidyalaya — **88.4%**."
  },
  {
    id: 'leadership',
    words: { leadership: 5, leader: 4, club: 4, clubs: 4, iconics: 6, secretary: 5, symposium: 4 },
    reply: "Paul was **Secretary of the ICONICS Association** — he led campus technical symposiums and coordinated **4 student clubs**."
  },
  {
    id: 'contact',
    words: { contact: 5, email: 5, mail: 4, phone: 5, call: 3, reach: 4, linkedin: 5, github: 5, connect: 3, resume: 3, cv: 3, interview: 3 },
    reply: "You can reach Paul here:\n• **Email:** pauljacksenb@gmail.com\n• **Phone:** +91 70105 31540\n• **LinkedIn:** linkedin.com/in/paul-jacksen\n• **GitHub:** github.com/Faactos\nHe's open to full-time AI/ML engineering roles.\n[[copy-email]] [[goto:contact]]"
  },
  {
    id: 'about',
    words: { about: 2, who: 3, paul: 1, yourself: 3, summary: 3, introduce: 3, overview: 3 },
    reply: "**Paul Jacksen B** is an AI/ML Engineer from Madurai, India. He currently builds the **Aria** enterprise chatbot at **Neeyamo** using MCP servers and Amazon Bedrock, and has shipped projects in computer vision (Smart Navigation), accessibility AI (AI-DIDI) and RAG systems. He holds a B.E. CSE (Honours) with an 8.43 CGPA."
  }
];

function generateLocalPortfolioResponse(query) {
  const q = ' ' + query.toLowerCase().replace(/[^a-z0-9*\-\s]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  const wordCount = q.trim().split(' ').filter(Boolean).length;
  let best = null, bestScore = 0;
  for (const intent of LOCAL_INTENTS) {
    // Greeting/thanks only win for short messages like "hi" or "thanks!"
    if (intent.exact && wordCount > 4) continue;
    let score = 0;
    for (const [word, weight] of Object.entries(intent.words)) {
      if (q.includes(' ' + word + ' ') || (word.length > 4 && q.includes(word))) score += weight;
    }
    if (score > bestScore) { best = intent; bestScore = score; }
  }
  if (best) return best.reply;
  return "I'm not sure about that one — I can only answer questions about Paul. Try asking about his **projects**, **experience at Neeyamo**, **skills**, or **how to contact** him. For anything else, email **pauljacksenb@gmail.com**.\n[[copy-email]]";
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatMarkdown(str) {
  return escapeHtml(str)
    .replace(/^\s*[-•*]\s+/gm, '&bull; ')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-medium">$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em class="text-neutral-200">$2</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-black/60 border border-neutral-800 text-teal-300 font-mono text-[11px]">$1</code>')
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
    toggleChat(false);
  }
});

// Close when clicking modal backdrop
document.getElementById('project-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'project-modal') closeModal();
});
