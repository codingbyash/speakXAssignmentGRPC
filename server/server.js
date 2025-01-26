require("dotenv").config(); // Load environment variables
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const mongoose = require("mongoose");
const Question = require("./Question");

const PROTO_PATH = "../questions.proto";
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 30043;
console.log('Mongo URI:', process.env.MONGO_URI);


// Load gRPC definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});
const questionsProto = grpc.loadPackageDefinition(packageDefinition);

// MongoDB Connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// gRPC Server
const server = new grpc.Server({
  "grpc.max_receive_message_length": 1024 * 1024 * 50, // 50 MB
  "grpc.max_send_message_length": 1024 * 1024 * 50,
});

server.addService(questionsProto.QuestionService.service, {
  getAll: async (call, callback) => {
    const { page = 1, pageSize = 10 } = call.request;
    const skip = (page - 1) * pageSize;

    try {
      const [questions, totalCount] = await Promise.all([
        Question.find({}).skip(skip).limit(pageSize),
        Question.countDocuments(),
      ]);

      callback(null, { questions, totalCount });
    } catch (err) {
      callback(err, null);
    }
  },

  get: async (call, callback) => {
    try {
      const question = await Question.findById(call.request.id);
      if (question) callback(null, question);
      else callback({ code: grpc.status.NOT_FOUND, details: "Not found" });
    } catch (err) {
      callback(err, null);
    }
  },

  insert: async (call, callback) => {
    try {
      const question = new Question(call.request);
      const savedQuestion = await question.save();
      callback(null, savedQuestion);
    } catch (err) {
      callback(err, null);
    }
  },

  update: async (call, callback) => {
    try {
      const updatedQuestion = await Question.findByIdAndUpdate(
        call.request.id,
        { ...call.request },
        { new: true }
      );
      if (updatedQuestion) callback(null, updatedQuestion);
      else callback({ code: grpc.status.NOT_FOUND, details: "Not found" });
    } catch (err) {
      callback(err, null);
    }
  },

  remove: async (call, callback) => {
    try {
      const deletedQuestion = await Question.findByIdAndDelete(call.request.id);
      if (deletedQuestion) callback(null, {});
      else callback({ code: grpc.status.NOT_FOUND, details: "Not found" });
    } catch (err) {
      callback(err, null);
    }
  },
});

// Start Server
server.bindAsync(
  `127.0.0.1:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error("Failed to start gRPC server:", err);
    } else {
      console.log(`gRPC server running on port ${port}`);
      server.start();
    }
  }
);

// Graceful Shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await mongoose.connection.close();
  server.forceShutdown();
  process.exit(0);
});
