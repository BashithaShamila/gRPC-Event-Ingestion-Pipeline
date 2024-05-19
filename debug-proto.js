const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = './proto/event.proto';

console.log('Loading protobuf definition from:', PROTO_PATH);

try {
  const packageDefinition = protoLoader.loadSync(PROTO_PATH);
  console.log('Package definition:', JSON.stringify(packageDefinition, null, 2));
  
  const eventProto = grpc.loadPackageDefinition(packageDefinition).event;
  console.log('Event proto:', eventProto);
  console.log('EventService:', eventProto.EventService);
  console.log('EventService.service:', eventProto.EventService.service);
} catch (error) {
  console.error('Error loading proto:', error);
}
