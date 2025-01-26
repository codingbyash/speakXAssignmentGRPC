const mongoose = require("mongoose");

// Enum for different question categories
const QuestionCategories = {
  ANAGRAM: "ANAGRAM",
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  READ_ALONG: "READ_ALONG",
  CONTENT_ONLY: "CONTENT_ONLY",
  CONVERSATION: "CONVERSATION",
};

// Enum for different anagram formats
const AnagramFormats = {
  WORD: "WORD",
  SENTENCE: "SENTENCE",
};

// Schema for individual anagram blocks
const anagramBlockSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  showInOption: {
    type: Boolean,
    required: true,
    default: true,
  },
  isAnswer: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// Schema for MCQ options
const mcqOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  isCorrectAnswer: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// Schema for questions
const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: Object.values(QuestionCategories),
    required: true,
  },
  solution: {
    type: String,
    required: false,
  },
  relatedQuestionId: {
    type: String, // Left as string for now due to unclear relation
    required: false,
  },
  anagramFormat: {
    type: String,
    enum: Object.values(AnagramFormats),
    required: function () {
      return this.category === QuestionCategories.ANAGRAM;
    },
  },
  blocks: {
    type: [anagramBlockSchema],
    required: function () {
      return this.category === QuestionCategories.ANAGRAM;
    },
  },
  mcqOptions: {
    type: [mcqOptionSchema],
    required: function () {
      return this.category === QuestionCategories.MULTIPLE_CHOICE;
    },
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Question", questionSchema);
