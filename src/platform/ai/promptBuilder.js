import { MANIFESTATION_DESIGN_SYSTEM } from './designSystem'

export const HTML_KEYWORD = 'html'

const HTML_GENERATION_INSTRUCTIONS = [
  'Return ONLY a complete standalone HTML document.',
  'Requirements: valid HTML5, embedded CSS, embedded JavaScript, responsive layout, mobile-first design, touch friendly, dark mode compatible, self-contained, runnable offline, no markdown, no explanations, no code fences, no external dependencies unless explicitly requested, production-quality UI, clean modern design.',
  'Preferred technologies: HTML5, CSS3, JavaScript, Canvas 2D when appropriate, SVG when appropriate, WebGL when appropriate.',
  'Avoid unnecessary libraries, framework lock-in, CDN dependencies, remote assets.',
  'The response must contain HTML only.'
]

export function isHtmlGenerationRequest(input = '') {
  return input.trim().toLowerCase().startsWith(`${HTML_KEYWORD} `) || input.trim().toLowerCase() === HTML_KEYWORD
}

export function stripHtmlKeyword(input = '') {
  const trimmed = input.trim()
  return isHtmlGenerationRequest(trimmed) ? trimmed.replace(/^html\b/i, '').trim() : trimmed
}

export function buildHtmlApplicationPrompt(input, designSystem = MANIFESTATION_DESIGN_SYSTEM) {
  return [
    HTML_GENERATION_INSTRUCTIONS.join('\n'),
    '',
    'Manifestation Design System to inject visually into the generated application:',
    JSON.stringify(designSystem, null, 2),
    '',
    `User request: ${stripHtmlKeyword(input)}`
  ].join('\n')
}

export function buildAiPrompt({ input, rendererType, designSystem = MANIFESTATION_DESIGN_SYSTEM, systemInstructions = '' }) {
  if (rendererType === 'html' || isHtmlGenerationRequest(input)) {
    return {
      kind: 'html_app',
      prompt: buildHtmlApplicationPrompt(input, designSystem),
      metadata: { rendererType: 'html', designSystem }
    }
  }

  return {
    kind: rendererType || 'text',
    prompt: [systemInstructions, input.trim()].filter(Boolean).join('\n\n'),
    metadata: { rendererType: rendererType || 'text', designSystem }
  }
}
