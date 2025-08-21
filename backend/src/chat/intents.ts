export enum Intent {
  CLIENT_ADDRESS = 'CLIENT_ADDRESS',
  PROJECT_TODAY = 'PROJECT_TODAY',
  LEADS_THIS_WEEK = 'LEADS_THIS_WEEK',
  LEAD_STATUS = 'LEAD_STATUS',
  GENERAL = 'GENERAL',
}

// Optional helper to extract a potential client name (very naive): last word after 'client'
export function extractClientName(message: string): string | null {
  const lower = (message || '').toLowerCase();
  // example: "what is abbas client address" or "client abbas address"
  const match = lower.match(/client\s+([a-z\s\.'-]{1,60})/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  // fallback: specific name mentioned directly like 'abbas'
  const direct = lower.match(/\b(abbas)\b/i);
  if (direct) return direct[1];
  return null;
}

export function detectIntent(message: string): Intent {
  const text = (message || '').toLowerCase().trim();
  if (!text) return Intent.GENERAL;

  // (client).*(address|location).*(abbas)
  if (/(client).*(address|location).*(abbas)/i.test(text) || /(abbas).*(client).*(address|location)/i.test(text)) {
    return Intent.CLIENT_ADDRESS;
  }

  // (today|current).*(project)
  if (/(today|current).*(project)/i.test(text)) {
    return Intent.PROJECT_TODAY;
  }

  // (how many|count).*(leads).*(this week|past 7 days)
  if (/(how many|count).*(leads).*(this week|past 7 days)/i.test(text)) {
    return Intent.LEADS_THIS_WEEK;
  }

  // (status).*(lead|leads).*(name|email)?
  if (/(status).*(lead|leads).*(name|email)?/i.test(text)) {
    return Intent.LEAD_STATUS;
  }

  return Intent.GENERAL;
}


