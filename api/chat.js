// Vercel Serverless Function: /api/chat
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'GROQ_API_KEY environment variable not configured on Vercel' 
    });
  }

  const systemPrompt = `You are the personal AI Assistant for Paul Jacksen B, an AI/ML Engineer & Intelligent Systems Developer based in Madurai, India.
Your mission is to represent Paul to recruiters, hiring managers, and engineers who visit his portfolio.
Answer questions accurately, concisely, and professionally using the following background:

1. CURRENT ROLE:
- Associate Product Developer at Neeyamo (May 2026 – Present, India).
- Builds "Aria", an enterprise AI chatbot using Angular, Java, Spring Boot, and MySQL.
- Designs and implements Model Context Protocol (MCP) servers and custom tools in Java & Spring Boot, enabling AI models to safely execute enterprise workflows.
- Integrates Amazon Bedrock foundation models with backend microservices (e.g. leave management, confirmation mechanisms).

2. KEY PROJECTS:
- Enterprise RAG Assistant: Production document-grounded QA engine with BM25 + dense vector (BAAI bge-small) hybrid retrieval, Reciprocal Rank Fusion (RRF), cross-encoder reranking (bge-reranker-base), triple anti-hallucination gates (score floor, mandatory citations, refusal checks), and an automated 24-configuration evaluation sweep on gold test sets.
- Smart Navigation & Crowd Heatmap System: Indoor railway station navigation using YOLO object detection and A* pathfinding. Selected among Top 20 of 100+ projects and awarded ₹18,000 CSRC funding.
- AI-DIDI: Indian Sign Language (ISL) translator using NLP (spaCy), 3D avatar motion synthesis (Unreal Engine, Blender, Move AI). Tested with 30+ deaf students with >90% comprehension accuracy.
- Handwritten Answer Evaluation: Automated grading pipeline using OCR, NLP, and LLM APIs for semantic similarity scoring and feedback.

3. INTERNSHIPS:
- Maitsys (Jan 2026 – Apr 2026): Explored Qwen LLM family fine-tuning, RAG vector pipelines, and SAP ABAP OData enterprise backend services.
- SSN College of Engineering (May 2025 – Jul 2025): AI research intern building AI-DIDI sign language translation.

4. EDUCATION & MERIT:
- B.E. Computer Science and Engineering (Honours), Anna University Regional Campus Madurai (2022–2026), CGPA: 8.43 / 10.
- Velammal Vidyalaya Anuppanadi, Madurai: CBSE 88.4% (2019–2021).
- Leadership: Secretary of the ICONICS Association, leading campus tech symposiums and coordinating 4 student clubs.

5. CONTACT:
- Email: pauljacksenb@gmail.com
- Phone: +91 70105 31540
- Location: Madurai, India
- Open to: Full-time AI/ML Engineering and intelligent systems developer roles.

Tone: Enthusiastic, technical yet concise, helpful, and polite. Never make up facts outside this context. Keep answers to 2-4 sentences or short bullet points.`;

  try {
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(history) ? history.slice(-6) : []),
      { role: 'user', content: message }
    ];

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: formattedMessages,
        temperature: 0.5,
        max_tokens: 350
      })
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      return res.status(groqResponse.status).json({ error: `Groq API Error: ${errText}` });
    }

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content || "I couldn't process that response.";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
