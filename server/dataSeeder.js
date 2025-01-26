require('dotenv').config();
const mongoose = require("mongoose");
const fs = require("fs/promises");
const path = require("path");
const Question = require("./Question.js");


const BATCH_LIMIT = 1000;

async function insertQuestionsInChunks(questions) {
  console.log(
    `Starting to insert ${questions.length} questions in chunks of ${BATCH_LIMIT}...`
  );
  let successfulInserts = 0;
  let failedInserts = 0;

  // Insert questions in chunks
  for (let i = 0; i < questions.length; i += BATCH_LIMIT) {
    const chunk = questions.slice(i, i + BATCH_LIMIT);

    try {
      // Prepare data for batch
      const preparedBatch = chunk.map((question) => ({
        ...question,
        _id: new mongoose.Types.ObjectId(question._id["$oid"]),
        relatedQuestionId: question.relatedQuestionId
          ? new mongoose.Types.ObjectId(question.relatedQuestionId["$oid"])
          : null,
      }));

      // Insert data in batch
      await Question.insertMany(preparedBatch, { ordered: false });
      successfulInserts += chunk.length;

      // Log progress
      const progressPercentage = Math.round(
        ((i + chunk.length) / questions.length) * 100
      );
      console.log(
        `Progress: ${progressPercentage}% (${successfulInserts}/${questions.length} questions inserted)`
      );console.log(questions[0]); 

    } catch (error) {
      failedInserts += chunk.length;
      console.error(
        `Error inserting batch starting at index ${i}:`,
        error.message
      );
    }
  }

  return { successfulInserts, failedInserts };
}

const populateDatabase = async () => {
  try {
    // Connect to MongoDB with optimized settings
    await mongoose.connect(process.env.MONGO_URI, {
      writeConcern: { w: 1, j: false },
      maxPoolSize: 10,
      socketTimeoutMS: 30000,
    });
    console.log("Connected to MongoDB");

    // Read questions from JSON file
    const data = await fs.readFile(
      path.join(__dirname, "./speakx_questions.json"),
      "utf-8"
    );
    const questions = JSON.parse(data);

    // Create necessary indexes
    await Question.createIndexes();

    // Clean existing records
    console.log("Clearing previous questions...");
    await Question.deleteMany({});

    // Seed the questions in chunks
    const { successfulInserts, failedInserts } = await insertQuestionsInChunks(
      questions
    );

    console.log("\nSeeding completed:");
    console.log(`Successfully inserted: ${successfulInserts} questions`);
    console.log(`Failed to insert: ${failedInserts} questions`);

    process.exit(0);
  } catch (error) {
    console.error("Error during seeding process:", error);
    process.exit(1);
  }
};


// Export functions for flexibility
module.exports = { populateDatabase, insertQuestionsInChunks };

// Run the seeding process if executed directly
if (require.main === module) {
  populateDatabase();
}
