import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Client from '../models/Client';
import Project from '../models/Project';
import Lead from '../models/Lead';
import { resolveClientAddress, resolveLeadsThisWeek, resolveProjectToday, resolveLeadStatus } from './resolvers';

describe('resolvers', () => {
  let mongod: MongoMemoryServer;
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });
  beforeEach(async () => {
    await Promise.all([
      Client.deleteMany({}),
      Project.deleteMany({}),
      Lead.deleteMany({}),
    ]);
  });

  it('resolveClientAddress returns exact match only', async () => {
    await Client.create({ name: 'Abbas', address: '123 Street' });
    await Client.create({ name: 'Abbas Ali', address: '999 Wrong' });
    expect(await resolveClientAddress('Abbas')).toMatch('123 Street');
    expect(await resolveClientAddress('abbas')).toMatch('123 Street');
    expect(await resolveClientAddress('Not Found')).toMatch('No client');
  });

  it('resolveProjectToday returns today project', async () => {
    const today = new Date();
    await Project.create({ name: 'Today Project', dueDate: today });
    const msg = await resolveProjectToday();
    expect(msg.toLowerCase()).toContain('today');
  });

  it('resolveLeadsThisWeek counts', async () => {
    await Lead.create({ email: 'a@x.com', source: 'website' });
    await Lead.create({ email: 'b@x.com', source: 'referral' });
    const msg = await resolveLeadsThisWeek();
    expect(msg).toContain('Leads last 7 days: 2');
  });

  it('resolveLeadStatus by email or name', async () => {
    await Lead.create({ fullName: 'Jane Doe', email: 'jane@x.com', status: 'qualified', priority: 'high' });
    const byEmail = await resolveLeadStatus('jane@x.com');
    expect(byEmail).toContain('qualified');
    const byName = await resolveLeadStatus('Jane');
    expect(byName).toContain('qualified');
  });
});


