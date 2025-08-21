import { describe, it, expect } from '@jest/globals';
import { detectIntent, Intent } from './intents';

describe('detectIntent', () => {
  it('detects client address', () => {
    expect(detectIntent("what is abbas client address? ")).toBe(Intent.CLIENT_ADDRESS);
    expect(detectIntent("client abbas location? ")).toBe(Intent.CLIENT_ADDRESS);
  });
  it('detects project today', () => {
    expect(detectIntent("what's the project today? ")).toBe(Intent.PROJECT_TODAY);
  });
  it('detects leads this week', () => {
    expect(detectIntent("how many leads in the past 7 days? ")).toBe(Intent.LEADS_THIS_WEEK);
  });
  it('detects lead status', () => {
    expect(detectIntent("what is the status of lead by email? ")).toBe(Intent.LEAD_STATUS);
  });
  it('falls back to general', () => {
    expect(detectIntent("hello world")).toBe(Intent.GENERAL);
  });
});


