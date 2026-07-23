/**
 * Lightweight, offline "AI-assisted" category suggestion.
 *
 * This scores the complaint description against a keyword bank for each
 * category and returns the best match plus a confidence score. It's not a
 * trained ML model, but it demonstrates the same UX: the student types a
 * description and the system nudges them toward the right category.
 *
 * Swap this module out later for a real LLM/NLP call without touching
 * any calling code, since it only exposes suggestCategory(text).
 */

const KEYWORD_BANK = {
  Electricity: [
    'electricity', 'power', 'powercut', 'power cut', 'voltage', 'socket',
    'switchboard', 'switch board', 'wire', 'wiring', 'short circuit',
    'fuse', 'mcb', 'light not working', 'bulb', 'tube light', 'fan not working',
    'no power', 'electric', 'current', 'transformer', 'generator',
  ],
  Water: [
    'water', 'tap', 'leakage', 'leak', 'pipe', 'pipeline', 'drainage',
    'drain', 'sewage', 'overflow', 'no water', 'water supply', 'tank',
    'motor not working', 'water pressure', 'flooding', 'flood', 'contaminated water',
  ],
  'Wi-Fi': [
    'wifi', 'wi-fi', 'internet', 'network', 'router', 'connection',
    'bandwidth', 'signal', 'lan', 'ethernet', 'wireless', 'broadband',
    'slow internet', 'no internet', 'disconnect',
  ],
  Hostel: [
    'hostel', 'room', 'roommate', 'warden', 'mess', 'food quality',
    'bed', 'mattress', 'cupboard', 'hostel gate', 'curfew', 'laundry',
    'washing machine', 'hostel room', 'dormitory', 'dorm',
  ],
  Cleanliness: [
    'cleanliness', 'clean', 'garbage', 'trash', 'waste', 'dirty', 'dustbin',
    'washroom', 'toilet', 'bathroom', 'hygiene', 'smell', 'stink', 'pest',
    'cockroach', 'mosquito', 'sweeping', 'sanitation',
  ],
  Infrastructure: [
    'infrastructure', 'building', 'wall', 'ceiling', 'roof', 'door', 'window',
    'furniture', 'chair', 'desk', 'bench', 'classroom', 'lab equipment',
    'elevator', 'lift', 'staircase', 'crack', 'broken', 'construction', 'paint',
    'projector', 'ac not working', 'air conditioner',
  ],
};

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
}

/**
 * @param {string} description - free text entered by the student
 * @returns {{ category: string, confidence: number, scores: Record<string, number> }}
 */
function suggestCategory(description = '') {
  const text = normalize(description);
  const scores = {};

  for (const [category, keywords] of Object.entries(KEYWORD_BANK)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) {
        // Longer/more specific phrases count for more than single words
        score += kw.includes(' ') ? 2 : 1;
      }
    }
    scores[category] = score;
  }

  const [bestCategory, bestScore] = Object.entries(scores).sort(
    (a, b) => b[1] - a[1]
  )[0];

  if (bestScore === 0) {
    return { category: 'Other', confidence: 0, scores };
  }

  const totalMatches = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = Math.min(1, bestScore / Math.max(totalMatches, 1) + bestScore * 0.1);

  return { category: bestCategory, confidence: Number(confidence.toFixed(2)), scores };
}

/**
 * Optional: suggest a priority based on urgency-signalling words.
 * Kept simple and separate so it can be toggled independently.
 */
function suggestPriority(description = '') {
  const text = normalize(description);
  const urgent = ['fire', 'shock', 'spark', 'exposed wire', 'flooding', 'gas leak', 'collapsed', 'injury', 'unsafe'];
  const moderate = ['not working', 'broken', 'leak', 'no water', 'no power', 'slow'];

  if (urgent.some((w) => text.includes(w))) return 'High';
  if (moderate.some((w) => text.includes(w))) return 'Medium';
  return 'Low';
}

module.exports = { suggestCategory, suggestPriority, KEYWORD_BANK };
