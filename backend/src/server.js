require('dotenv/config');
const { createApp } = require('./app');
const { env } = require('./config/env');
const { connectDatabase } = require('./config/db');

async function bootstrap() {
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`ConveneHub backend running at http://localhost:${env.PORT}`);
  });

  connectDatabase(env.MONGODB_URI)
    .then(() => {
      console.log('MongoDB connected');
    })
    .catch((error) => {
      console.error('MongoDB connection failed; running API in degraded mode:', error?.message || error);
    });
}

bootstrap().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
