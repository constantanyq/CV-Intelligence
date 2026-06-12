/* Career OS — Anthropic API integration */

const AIService = (() => {
  const API_KEY_STORAGE = 'careeros_anthropic_key';
  const MODEL = 'claude-sonnet-4-20250514';
  const API_URL = 'https://api.anthropic.com/v1/messages';

  function getApiKey() {
    return sessionStorage.getItem(API_KEY_STORAGE) || '';
  }

  function setApiKey(key) {
    if (key) sessionStorage.setItem(API_KEY_STORAGE, key.trim());
    else sessionStorage.removeItem(API_KEY_STORAGE);
  }

  function hasApiKey() {
    return !!getApiKey();
  }

  async function callAnthropic(systemPrompt, userMessage, maxTokens = 2048) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('NO_API_KEY');
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    const text = data.content?.find(c => c.type === 'text')?.text || '';
    return text;
  }

  function parseJSON(text) {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) throw new Error('Could not parse AI response');
    return JSON.parse(match[0]);
  }

  async function parseCV(cvText) {
    const system = `You are a CV parser for Career OS, a career navigation tool (not a prediction tool).
Extract structured data from the CV text. Return ONLY valid JSON with this shape:
{
  "name": "string",
  "email": "string or empty",
  "skills": ["skill1", "skill2"],
  "experiences": [{"title": "role at company", "bullets": ["original bullet text"]}],
  "education": "string summary",
  "projects": ["project descriptions"],
  "summary": "2-sentence profile summary"
}
Do not invent information not present in the CV.`;

    const text = await callAnthropic(system, cvText, 3000);
    return parseJSON(text);
  }

  async function enhanceBullets(experiences) {
    const system = `You are a CV enhancement assistant for Career OS.
Rephrase bullet points to signal impact to ATS and hiring managers.
CRITICAL RULES:
- Do NOT invent facts, numbers, or accomplishments not implied by the original text
- Only rephrase and structure what the candidate actually wrote
- Use action verbs and quantify only if numbers were in the original
Return ONLY valid JSON:
{"enhanced": [{"title": "role title", "original": ["..."], "enhanced": ["..."]}]}`;

    const userMsg = JSON.stringify(experiences);
    const text = await callAnthropic(system, userMsg, 3000);
    return parseJSON(text);
  }

  async function generateCareerTimeline(cvData, targetField) {
    const system = `You are Career Path Navigator (C-01) for Career OS — a navigation tool, NOT a prediction tool.
Generate a realistic 5-year career trajectory for someone with a similar profile in Southeast Asia.
Explain WHY each step makes sense based on their current skills and market patterns.
Return ONLY valid JSON:
{
  "targetRole": "string",
  "confidence": "high|medium|exploratory",
  "whyThisPath": "2-3 sentences explaining the reasoning",
  "milestones": [
    {"year": 0, "title": "Current state", "role": "...", "salary": "MYR X–Y/mo", "focus": "...", "why": "..."},
    {"year": 1, "title": "...", "role": "...", "salary": "...", "focus": "...", "why": "..."},
    {"year": 2, "title": "...", "role": "...", "salary": "...", "focus": "...", "why": "..."},
    {"year": 3, "title": "...", "role": "...", "salary": "...", "focus": "...", "why": "..."},
    {"year": 5, "title": "...", "role": "...", "salary": "...", "focus": "...", "why": "..."}
  ],
  "similarProfiles": "1 sentence about comparable profiles in SEA"
}
Use realistic SEA salary ranges. Be honest about gaps.`;

    const userMsg = `Target field: ${targetField || 'best fit based on profile'}\n\nCV data:\n${JSON.stringify(cvData, null, 2)}`;
    const text = await callAnthropic(system, userMsg, 3000);
    return parseJSON(text);
  }

  async function careerCoachChat(messages, cvContext) {
    const system = `You are the AI Career Coach in Career OS (C-01 Career Path Navigator).
You are a navigation tool — you help candidates understand their realistic career landscape.
Rules:
- Explain WHY recommendations make sense, citing skills and market patterns
- Never guarantee outcomes or predict the future with certainty
- Be honest about gaps and what it takes to close them
- Reference the candidate's CV when relevant
- Keep responses concise (2-4 short paragraphs max)

Candidate CV context:
${cvContext || 'No CV uploaded yet.'}`;

    const conversation = messages.map(m => `${m.role === 'user' ? 'Candidate' : 'Coach'}: ${m.content}`).join('\n\n');
    return callAnthropic(system, conversation, 1024);
  }

  return {
    getApiKey, setApiKey, hasApiKey,
    parseCV, enhanceBullets, generateCareerTimeline, careerCoachChat
  };
})();
