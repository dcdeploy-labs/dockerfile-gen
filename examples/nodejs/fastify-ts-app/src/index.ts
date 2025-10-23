import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

const fastify = Fastify({
  logger: true
});

// Register plugins
fastify.register(helmet);
fastify.register(cors, {
  origin: true
});
fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// Routes
fastify.get('/', async (request, reply) => {
  return {
    message: 'Hello from Fastify TypeScript app!',
    status: 'running',
    framework: 'Fastify',
    language: 'TypeScript',
    generated_by: 'Dockerfile Generator'
  };
});

fastify.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString()
  };
});

fastify.get('/api/users', async (request, reply) => {
  return {
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ]
  };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Fastify server is running on port 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

