import { startOfDay, endOfDay, subDays } from 'date-fns';
import mongoose from 'mongoose';
import Lead from '../models/Lead';

const sanitize = (s?: string) => (s || '').toString().trim();
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function resolveClientAddress(nameRaw: string): Promise<string> {
  const name = sanitize(nameRaw);
  if (!name) return 'Please provide a client name.';
  const db = (mongoose.connection as any).db;
  const client = db ? await db.collection('clients').findOne({ name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' } }) : null;
  if (!client) return `No client named "${name}" was found.`;
  const addr = sanitize(client.address);
  return addr ? `Client ${client.name} address: ${addr}` : `Client ${client.name} has no address on file.`;
}

export async function resolveProjectToday(): Promise<string> {
  const now = new Date();
  const from = startOfDay(now);
  const to = endOfDay(now);
  const db2 = (mongoose.connection as any).db;
  const project = db2 ? await db2.collection('projects').findOne({ dueDate: { $gte: from, $lte: to } }) : null;
  if (!project) return 'No projects are due today.';
  let clientName = '';
  try {
    const id = (project as any).client_id || (project as any).clientId;
    if (id) {
      const db3 = (mongoose.connection as any).db;
      const clientDoc = db3 ? await db3.collection('clients').findOne({ _id: id }) : null;
      if (clientDoc?.name) clientName = ` for ${sanitize(clientDoc.name)}`;
    }
  } catch {}
  return `Today: ${sanitize((project as any).name)}${clientName}.`;
}

export async function resolveLeadsThisWeek(): Promise<string> {
  const end = new Date();
  const start = subDays(end, 7);
  const leads = await Lead.find({ createdAt: { $gte: start, $lte: end } }).lean();
  if (!leads.length) return 'No leads created in the last 7 days.';
  const total = leads.length;
  const bySource = leads.reduce<Record<string, number>>((acc, l: any) => {
    const key = sanitize(l.source) || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const parts = Object.entries(bySource)
    .sort((a, b) => b[1] - a[1])
    .map(([src, n]) => `${src}: ${n}`);
  return `Leads last 7 days: ${total}. By source: ${parts.join(', ')}.`;
}

export async function resolveLeadStatus(identifierRaw: string): Promise<string> {
  const ident = sanitize(identifierRaw).toLowerCase();
  if (!ident) return 'Please provide a lead email or name.';
  const lead = (await Lead.findOne({ email: new RegExp(`^${ident}$`, 'i') }).lean()) ||
    (await Lead.findOne({ fullName: { $regex: ident, $options: 'i' } }).lean());
  if (!lead) return `No lead found for "${identifierRaw}".`;
  const owner = (lead as any).ownerId?.toString ? (lead as any).ownerId.toString() : 'unassigned';
  return `Lead ${sanitize(lead.fullName || lead.email || '')}: status=${sanitize(lead.status)}, priority=${sanitize(lead.priority)}, owner=${owner}.`;
}


