import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function start(): Promise<void> {
  await connectDatabase();
  app.listen(env.PORT, () => {
    logger.info(`StayNear API started`);
    logger.info(`🌐 Web App is running at: http://localhost:${env.PORT}`);
  });
}

start().catch(error => {
  logger.fatal({ error }, 'Unable to start StayNear API');
  process.exit(1);
});