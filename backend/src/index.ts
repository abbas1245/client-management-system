import config from '../config/env';
import { connectToDatabase } from './db';
import { startServer } from './server';
// Register only necessary TS models to avoid duplicate compilation with legacy JS models
import './models/User';
import './models/Lead';
// Ensure fetch APIs exist for SDKs relying on fetch
import './lib/fetch-polyfill';

async function main() {
  await connectToDatabase();
  startServer(config.PORT);
}

// eslint-disable-next-line no-console
main().catch((err) => console.error('Startup failure:', err));


