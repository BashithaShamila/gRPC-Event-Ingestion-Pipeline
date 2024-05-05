const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { v4: uuidv4 } = require('uuid');

const PROTO_PATH = './proto/event.proto';
const COLLECTOR_ADDRESS = process.env.COLLECTOR_ADDRESS || 'localhost:50051';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const eventProto = grpc.loadPackageDefinition(packageDefinition).event;

const client = new eventProto.EventService(COLLECTOR_ADDRESS, grpc.credentials.createInsecure());

function run() {
  const call = client.streamEvents((error, response) => {
    if (error) {
      console.error('Error:', error);
      return;
    }
    console.log('Server response:', response);
  });

  // Simulate sending 10,000 events
  console.log('Starting to stream 10,000 events...');
  for (let i = 0; i < 10000; i++) {
    const event = {
      eventId: uuidv4(),
      type: i % 2 === 0 ? 'page_view' : 'user_login',
      timestamp: Date.now(),
    };
    call.write(event);
  }

  // Signal the end of the stream
  call.end();
  console.log('Finished streaming events.');
}

run();
