import type { GeneratedSubtask, Priority } from '../types';

// ============================================================
// OpenRouter AI Service
// ============================================================

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

// ============================================================
// Prompt Engineering
// ============================================================

function buildPrompt(projectTitle: string, projectDescription?: string | null): string {
  const context = projectDescription
    ? `Project title: "${projectTitle}"\nProject description: "${projectDescription}"`
    : `Project title: "${projectTitle}"`;

  return `You are a senior project manager and software architect helping to break down a project into actionable tasks.

${context}

Generate exactly 5 specific, actionable subtasks for this project. Each subtask should be concrete and implementable.

Respond ONLY with a valid JSON array. No markdown, no explanation, no code fences — just raw JSON.

Format:
[
  {
    "category": "One of: Planning, Design, Development, Testing, Deployment, Research, Marketing, Operations, Analytics, Content",
    "task": "Short, action-oriented task title"
  }
]

Rules:
- Vary categories across the 5 tasks
- Tasks must be specific to the project, not generic
- Return exactly 5 items in the array`;
}

// ============================================================
// Response Parser
// ============================================================

function parseSubtasks(content: string): GeneratedSubtask[] {
  // Strip any markdown code fences if present
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  // Extract JSON array
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array found in AI response');

  const parsed = JSON.parse(match[0]) as unknown[];

  if (!Array.isArray(parsed)) throw new Error('AI response is not an array');

  const validPriorities: Priority[] = ['low', 'medium', 'high'];

  return parsed.slice(0, 5).map((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`Invalid subtask at index ${index}`);
    }
    const obj = item as Record<string, unknown>;
    return {
      title: String(obj.task ?? obj.title ?? `Subtask ${index + 1}`),
      description: '',
      category: String(obj.category ?? 'Development'),
      priority: 'medium',
    };
  });
}

// ============================================================
// Main Export
// ============================================================

export async function generateSubtasks(
  projectTitle: string,
  projectDescription?: string | null
): Promise<GeneratedSubtask[]> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY as string;

  if (!apiKey) {
    throw new Error('VITE_OPENROUTER_API_KEY is not configured in your .env file.');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Intelligent Task Orchestrator',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: buildPrompt(projectTitle, projectDescription),
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${error}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (data.error?.message) {
    throw new Error(`OpenRouter error: ${data.error.message}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from OpenRouter API');
  }

  return parseSubtasks(content);
}
