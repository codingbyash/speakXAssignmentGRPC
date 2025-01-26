const PROTO_PATH = "../questions.proto";
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});
const questionsProto = grpc.loadPackageDefinition(packageDefinition);

const MAX_MESSAGE_SIZE = 1024 * 1024 * 50; // Set limit to 50 MB

const client = new questionsProto.QuestionService(
    "127.0.0.1:30043",
    grpc.credentials.createInsecure(),
    {
        'grpc.max_receive_message_length': MAX_MESSAGE_SIZE,
        'grpc.max_send_message_length': MAX_MESSAGE_SIZE,
    }
);

module.exports = {
    getAll: (page, pageSize, callback) => {
        client.getAll({ page, pageSize }, (err, response) => {
            callback(err, response ? response.questions : null);
        });
    },

    search: (query, page, pageSize, callback) => {
        client.search({ query, page, pageSize }, (err, response) => {
            callback(err, response ? response.questions : null);
        });
    },

    insert: (data, callback) => {
        client.createQuestion(data, (err, response) => {
            callback(err, response);
        });
    },



    update: (id, data, callback) => {
        client.updateQuestion({ id, data }, (err, response) => {
            callback(err, response ? response.question : null);
        });
    },

    delete: (id, callback) => {
        client.deleteQuestion({ id }, (err, response) => {
            callback(err, response ? response.message : null);
        });
    },
};
