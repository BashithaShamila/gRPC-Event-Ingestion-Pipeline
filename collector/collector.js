const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { createClient } = require('redis');

const PROTO_PATH = './proto/event.proto';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const eventProto = grpc.loadPackageDefinition(packageDefinition).event;

const redisClient = createClient({ url: `redis://${REDIS_HOST}:6379` });
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Logic for handling the event stream
function streamEvents(call, callback) {
  let eventCount = 0;

  call.on('data', async (event) => {
    eventCount++;
    console.log(`Received event: ${event.eventId}`);
    try {
      // Directly push to Redis queue. LPUSH adds to the head of the list.
      await redisClient.lPush('event_queue', JSON.stringify(event));
    } catch (err) {
      console.error('Redis Error:', err);
    }
  });

  call.on('end', () => {
    // Handle the end of the stream
    console.log(`Stream ended. Total events received: ${eventCount}`);
    callback(null, { success: true, events_received: eventCount });
  });

  call.on('error', (err) => {
    console.error('gRPC Error:', err);
  });
}

// Function to start the server
async function main() {
  await redisClient.connect();
  const server = new grpc.Server();
  server.addService(eventProto.EventService.service, { streamEvents });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Collector server running on port ${port}`);
    server.start();
  });
}

main();
