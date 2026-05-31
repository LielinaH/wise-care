const CRISIS_KEYWORDS = [
  'suicide',
  'suicidal',
  'self-harm',
  'self harm',
  'harm myself',
  'harming myself',
  'kill myself',
  'kill my self',
  'end my life',
  'want to die',
  'better off dead',
  'cut myself',
  'cutting myself',
  'harm others',
  'harming others',
  'kill them',
  'hurt others',
  'abuse',
  'abusing',
  'abused',
  'overdose',
  'immediate danger',
  'emergency',
  'hang myself',
  'hanging myself',
  'shoot myself',
];

/**
 * Deterministically checks user concern inputs for immediate safety/crisis issues.
 * Returns true if a crisis keyword is found.
 */
export function hasImmediateCrisisSignal(concernText: string): boolean {
  if (!concernText) return false;
  
  const text = concernText.toLowerCase().trim();
  
  return CRISIS_KEYWORDS.some(keyword => {
    // Exact word boundaries or simple substring checks
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(text) || text.includes(keyword);
  });
}
