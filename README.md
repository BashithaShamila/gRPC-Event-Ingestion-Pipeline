# gRPC Event Ingestion Pipeline

A high-performance event ingestion system that uses gRPC for fast data transmission and Redis for reliable queuing. This project demonstrates a decoupled architecture where event ingestion is separated from processing for better scalability and reliability.

## 🏗️ System Architecture

### High-Level Flow
```
┌──────────┐    gRPC Stream    ┌───────────┐    Redis Queue    ┌────────┐
│ Producer │ =================>│ Collector │ ================>│ Worker │
└──────────┘                   └───────────┘                   └────────┘
                                      │                              │
                                      ▼                              ▼
                               ┌─────────────┐                ┌──────────────┐
                               │    Redis    │                │  Processing  │
                               │   Message   │ <==============│  & Business  │
                               │    Queue    │                │    Logic     │
                               └─────────────┘                └──────────────┘
```

### Detailed Architecture Diagram
```
                    EVENT INGESTION PIPELINE
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                                                                         │
    │  ┌─────────────┐                                                        │
    │  │  Producer   │  Generates events (UUID, type, timestamp)              │
    │  │   Service   │  • Creates 10,000 events                               │
    │  │             │  • Streams via gRPC                                    │
    │  └─────────────┘                                                        │
    │         │                                                               │
    │         │ gRPC Client-to-Server Streaming                               │
    │         │ (High-performance binary protocol)                            │
    │         ▼                                                               │
    │  ┌─────────────┐                                                        │
    │  │  Collector  │  Fast event receiver                                   │
    │  │   Service   │  • gRPC server (port 50051)                            │
    │  │             │  • Immediately queues to Redis                         │
    │  │             │  • No processing delays                                │
    │  └─────────────┘                                                        │
    │         │                                                               │
    │         │ LPUSH to Redis Queue                                          │
    │         │ (JSON serialization)                                          │
    │         ▼                                                               │
    │  ┌─────────────┐                                                        │
    │  │    Redis    │  Message Queue                                         │
    │  │   Database  │  • List-based queue (event_queue)                      │
    │  │             │  • Persistent storage                                  │
    │  │             │  • FIFO processing                                     │
    │  └─────────────┘                                                        │
    │         │                                                               │
    │         │ BLPOP (Blocking pop)                                          │
    │         │ (Waits for new events)                                        │
    │         ▼                                                               │
    │  ┌─────────────┐                                                        │
    │  │   Worker    │  Background processor                                  │
    │  │   Service   │  • Continuous polling                                  │
    │  │             │  • Simulates heavy processing                          │
    │  │             │  • Scalable (multiple workers possible)                │
    │  └─────────────┘                                                        │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘
```

## 🔧 Component Details

### Producer Service
- **Role**: Event generator and gRPC client
- **Technology**: Node.js, @grpc/grpc-js
- **Function**: Creates and streams events to the Collector
- **Event Structure**: 
  ```javascript
  {
    eventId: "UUID",
    type: "user_login" | "page_view", 
    timestamp: 1692025200000
  }
  ```

### Collector Service  
- **Role**: High-speed event ingestion server
- **Technology**: Node.js, gRPC server, Redis client
- **Function**: Receives gRPC streams and queues events
- **Performance**: Optimized for maximum throughput

### Worker Service
- **Role**: Background event processor  
- **Technology**: Node.js, Redis client
- **Function**: Processes queued events with business logic
- **Scalability**: Multiple workers can run in parallel

### Redis Database
- **Role**: Message queue and temporary storage
- **Technology**: Redis with JSON serialization
- **Function**: Decouples ingestion from processing
- **Queue**: List-based FIFO queue (`event_queue`)

## 📁 Project Structure

```
gRPC-Event-Ingestion-Pipeline/
├── 📂 collector/              # Fast gRPC Event Receiver
│   ├── 📄 collector.js        # Main server implementation
│   ├── 📄 package.json        # Dependencies (@grpc/grpc-js, redis)
│   └── 🐳 Dockerfile          # Container configuration
├── 📂 producer/               # Event Generator & gRPC Client  
│   ├── 📄 producer.js         # Event streaming client
│   ├── 📄 package.json        # Dependencies (@grpc/grpc-js, uuid)
│   └── 🐳 Dockerfile          # Container configuration
├── 📂 worker/                 # Background Event Processor
│   ├── 📄 worker.js           # Redis queue consumer
│   ├── 📄 package.json        # Dependencies (redis)
│   └── 🐳 Dockerfile          # Container configuration
├── 📂 proto/                  # Protocol Buffer Definitions
│   └── 📄 event.proto         # gRPC service & message contracts
├── 🐳 docker-compose.yml      # Multi-service orchestration
└── 📖 README.md               # This documentation
```

## ⚡ Data Flow Sequence

```
   Producer              Collector              Redis               Worker
      │                     │                    │                   │
      │ 1. Generate Events  │                    │                   │
      │ ─────────────────── │                    │                   │
      │                     │                    │                   │
      │ 2. gRPC Stream      │                    │                   │
      │ ==================> │                    │                   │
      │                     │                    │                   │
      │                     │ 3. LPUSH events    │                   │
      │                     │ ─────────────────> │                   │
      │                     │                    │                   │
      │                     │                    │ 4. BLPOP (wait)   │
      │                     │                    │ <─────────────────│
      │                     │                    │                   │
      │                     │                    │ 5. Return event   │
      │                     │                    │─────────────────> │
      │                     │                    │                   │
      │                     │                    │                   │ 6. Process
      │                     │                    │                   │ ─────────
      │                     │                    │                   │
      │ 3. Response         │                    │                   │
      │ <================== │                    │                   │
      │                     │                    │                   │
```

### Step-by-Step Process:

1. **Event Generation**: Producer creates 10,000 events with unique IDs
2. **gRPC Streaming**: Events are sent via high-performance gRPC stream  
3. **Fast Ingestion**: Collector immediately pushes events to Redis queue
4. **Queue Storage**: Redis stores events in FIFO order
5. **Background Processing**: Worker polls queue and processes events
6. **Acknowledgment**: Producer receives success confirmation

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Prerequisites**: Ensure Docker and Docker Compose are installed
2. **Clone/Navigate** to the project directory
3. **Start the system**:

```bash
# Start all services in background
docker-compose up --build -d

# View logs from all services
docker-compose logs -f

# Run the producer to generate events
docker-compose run --rm producer
```

### Expected Output:
```
✅ Redis: Ready to accept connections
✅ Collector: Server running on port 50051  
✅ Worker: Waiting for events from the queue...
✅ Producer: Starting to stream 10,000 events...
✅ Collector: Received event: abc-123-def-456
✅ Worker: Processing event: abc-123-def-456 of type user_login
✅ Producer: Finished streaming events. Server response: { success: true }
```

### Docker Services Status:
```bash
# Check service status
docker-compose ps

# Expected output:
NAME                    IMAGE           STATUS          PORTS
pipeline-collector-1    collector       Up 2 minutes    0.0.0.0:50051->50051/tcp
pipeline-redis-1        redis:alpine    Up 2 minutes    0.0.0.0:6379->6379/tcp  
pipeline-worker-1       worker          Up 2 minutes    
```

### 🛠️ Manual Development Setup

For development and debugging:

#### 1. Start Infrastructure
```bash
# Start Redis container
docker run -d --name redis -p 6379:6379 redis:alpine
```

#### 2. Install Dependencies
```bash
# Install dependencies for all services
cd collector && npm install && cd ..
cd producer && npm install && cd ..  
cd worker && npm install && cd ..
```

#### 3. Run Services (in separate terminals)

**Terminal 1 - Collector Service:**
```bash
cd collector
node collector.js
# Output: Collector server running on port 50051
```

**Terminal 2 - Worker Service:**  
```bash
cd worker
node worker.js
# Output: Worker started. Waiting for events from the queue...
```

**Terminal 3 - Producer Service:**
```bash
cd producer  
node producer.js
# Output: Starting to stream 10,000 events...
```

## ⚙️ Configuration

### Environment Variables

| Variable | Service | Default | Description |
|----------|---------|---------|-------------|
| `REDIS_HOST` | Collector, Worker | `localhost` | Redis server hostname |
| `COLLECTOR_ADDRESS` | Producer | `localhost:50051` | gRPC collector endpoint |

### Docker Compose Configuration
```yaml
# docker-compose.yml highlights
services:
  collector:
    ports: ["50051:50051"]           # gRPC port
    environment: [REDIS_HOST=redis]  # Redis connection
  
  worker:  
    environment: [REDIS_HOST=redis]  # Redis connection
    
  producer:
    environment: [COLLECTOR_ADDRESS=collector:50051]  # gRPC endpoint
```

## 🔍 How It Works

### 1. Protocol Definition (event.proto)
```protobuf
syntax = "proto3";
package event;

service EventService {
  rpc StreamEvents(stream Event) returns (StreamSummary);
}

message Event {
  string eventId = 1;    // UUID identifier  
  string type = 2;       // "user_login" | "page_view"
  int64 timestamp = 3;   // Unix timestamp
}
```

### 2. Event Generation & Streaming
```javascript
// Producer creates events and streams via gRPC
const event = {
  eventId: uuidv4(),
  type: i % 2 === 0 ? 'page_view' : 'user_login',
  timestamp: Date.now()
};
call.write(event);  // Stream to collector
```

### 3. Fast Ingestion
```javascript  
// Collector immediately queues events
call.on('data', async (event) => {
  await redisClient.lPush('event_queue', JSON.stringify(event));
});
```

### 4. Background Processing
```javascript
// Worker continuously processes queue
const result = await redisClient.blPop('event_queue', 0);
const event = JSON.parse(result.element);
// Process event...
```

## 📊 Performance Benefits

### gRPC Advantages
- **Binary Protocol**: More efficient than JSON/HTTP
- **Streaming**: Continuous data flow without request overhead
- **Type Safety**: Protocol buffer schema validation
- **Cross-Language**: Works with multiple programming languages

### Redis Queue Benefits  
- **High Throughput**: Can handle millions of operations per second
- **Persistence**: Data survives service restarts
- **Atomic Operations**: LPUSH/BLPOP are thread-safe
- **Blocking Operations**: BLPOP waits for new events efficiently

### Architecture Benefits
```
Traditional Synchronous:
Producer → [Processing Time] → Response
(Slow processing blocks ingestion)

Decoupled Architecture:  
Producer → Queue → Response (Fast!)
Queue → Worker → Processing (Independent!)
```

### Performance Metrics
- **Ingestion Speed**: Limited only by network and Redis write speed
- **Processing Speed**: Independent workers can scale horizontally  
- **Memory Usage**: Events stored in Redis, not in application memory
- **Fault Tolerance**: Events persist even if services restart

## 🧪 Testing & Verification

### Test the Complete Pipeline
```bash
# 1. Start all services
docker-compose up --build -d

# 2. Generate and process events  
docker-compose run --rm producer

# 3. Monitor real-time logs
docker-compose logs -f collector worker

# 4. Check Redis queue status
docker-compose exec redis redis-cli LLEN event_queue
```

### Verify Each Component

#### Test Collector gRPC Endpoint
```bash
# Check if collector is responding
curl -v telnet://localhost:50051
# Should connect successfully
```

#### Test Redis Connection
```bash  
# Connect to Redis and check queue
docker-compose exec redis redis-cli
> LLEN event_queue    # Check queue length
> LPOP event_queue    # Get an event  
> KEYS *              # List all keys
```

#### Monitor Worker Processing
```bash
# Follow worker logs to see event processing
docker-compose logs -f worker
# Should show: "Processing event: [UUID] of type [user_login|page_view]"
```

## 🔧 Troubleshooting

### Common Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Connection refused** | Producer can't connect | Check if collector is running on port 50051 |
| **Redis errors** | Services can't connect to Redis | Verify Redis container is running |
| **"undefined" events** | Worker shows undefined values | Check protobuf field name mapping |
| **No event processing** | Worker idle | Check if events are in Redis queue |

### Debug Commands
```bash
# Check service status
docker-compose ps

# View service logs  
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]

# Enter service container for debugging
docker-compose exec [service-name] sh

# Clean restart everything
docker-compose down && docker-compose up --build
```

## 🚀 Next Steps & Extensions

### Production Readiness
- [ ] **Add authentication**: Implement gRPC security (TLS, tokens)
- [ ] **Error handling**: Dead letter queues, retry logic
- [ ] **Monitoring**: Prometheus metrics, health checks  
- [ ] **Logging**: Structured logging with correlation IDs
- [ ] **Configuration**: Environment-based config management

### Scalability Improvements  
- [ ] **Horizontal scaling**: Multiple collector/worker instances
- [ ] **Load balancing**: gRPC load balancer, Redis clustering
- [ ] **Database persistence**: Save processed events to PostgreSQL/MongoDB
- [ ] **Event schemas**: Schema registry for event evolution
- [ ] **Partitioning**: Distribute events across multiple queues

### Feature Extensions
- [ ] **Event filtering**: Route events based on type/content
- [ ] **Batch processing**: Process events in batches for efficiency  
- [ ] **Real-time analytics**: Stream processing with Apache Kafka
- [ ] **API Gateway**: REST API for event submission
- [ ] **Event replay**: Replay events from persistent storage

### Development Tools
- [ ] **Testing**: Unit tests, integration tests, load tests
- [ ] **CI/CD**: Automated builds and deployments
- [ ] **Documentation**: API docs, deployment guides
- [ ] **Monitoring dashboards**: Grafana dashboards for metrics
- [ ] **Development environment**: Hot reload, debugging tools

## 📚 Learning Resources

### gRPC & Protocol Buffers
- [gRPC Official Documentation](https://grpc.io/docs/)
- [Protocol Buffers Guide](https://developers.google.com/protocol-buffers)
- [gRPC Node.js Tutorial](https://grpc.io/docs/languages/node/)

### Redis & Message Queues  
- [Redis Documentation](https://redis.io/documentation)
- [Redis Lists for Queues](https://redis.io/docs/data-types/lists/)
- [Message Queue Patterns](https://www.enterpriseintegrationpatterns.com/patterns/messaging/)

### System Architecture
- [Microservices Patterns](https://microservices.io/patterns/)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [Docker & Container Orchestration](https://docs.docker.com/compose/)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
