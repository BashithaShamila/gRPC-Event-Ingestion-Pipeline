const { createClient } = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';

async function main() {
  const redisClient = createClient({ url: `redis://${REDIS_HOST}:6379` });
  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  await redisClient.connect();

  console.log('Worker started. Waiting for events from the queue...');

  // Loop forever, waiting for events
  while (true) {
    try {
      // BLPOP is a blocking command. It waits until an element is available.
      // '0' means wait indefinitely.
      const result = await redisClient.blPop('event_queue', 0);
      
      const event = JSON.parse(result.element);
      console.log(`Processing event: ${event.eventId} of type ${event.type}`);
      
      // ----- IMAGINE HEAVY WORK HAPPENS HERE -----
      // For example, saving to a PostgreSQL database, calling another API, etc.
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate work
      // --------------------------------------------
      
    } catch (err) {
      console.error('Worker error:', err);
      // Wait a moment before retrying on error
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

main();
