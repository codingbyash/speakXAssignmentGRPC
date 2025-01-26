const client = require("./client");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(express.static('public'));


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/questions', (req, res) => {
    const categoryFilter = req.query.category || ''; // Get category filter from query params or default to an empty string
    const searchQuery = req.query.search || ''; // Get search query from params if needed
    console.log("Category Filter:", categoryFilter);  // Log the value of categoryFilter
    res.render('questions', { categoryFilter });
    // Fetch questions from the database or gRPC service
    getAllQuestions({ category: categoryFilter, search: searchQuery }, (err, questions) => {
        if (err) {
            return res.status(500).send('Error fetching questions');
        }

        res.render('questions', {
            results: questions,
            categoryFilter: categoryFilter, // Pass categoryFilter to the template
            searchQuery: searchQuery,
            page: 1, // Provide other necessary data like pagination if needed
            totalPages: 1
        });
    });
});


// Route to get all questions with pagination
app.get("/", (req, res) => {
    const searchQuery = req.query.search || '';  // Default to an empty string if not provided
    const page = parseInt(req.query.page) || 1; 
    const pageSize = 10;

    client.getAll(page, pageSize, (err, questions) => {
        if (err) {
            console.error("Error fetching questions:", err);
            res.status(500).send("Error fetching questions");
        } else {
            // Filter questions based on the search query (if provided)
            const filteredQuestions = questions.filter(question =>
                question.title.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // Pagination logic
            const totalCount = filteredQuestions.length;
            const totalPages = Math.ceil(totalCount / pageSize);
            const startIndex = (page - 1) * pageSize;
            const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + pageSize);

            // Pass searchQuery and pagination data to the view
            res.render("questions", {
                results: paginatedQuestions,
                page: page,
                totalPages: totalPages,
                searchQuery: searchQuery,  // Make sure to pass this variable here
            });
        }
    });
});





// Route to save a new question
app.post("/save", (req, res) => {
    const newQuestion = {
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags ? req.body.tags.split(",") : [],
    };

    client.insert(newQuestion, (err) => {
        if (err) {
            console.error("Error saving question:", err);
            res.status(500).send("Error saving question");
        } else {
            res.redirect("/");
        }
    });
});

// Route to update a question
app.post("/update", (req, res) => {
    const { id, title, description, tags } = req.body;

    client.update({ id, title, description, tags }, (err) => {
        if (err) {
            console.error("Error updating question:", err);
            res.status(500).send("Error updating question");
        } else {
            res.redirect("/");
        }
    });
});

// Route to remove a question
app.post("/remove", (req, res) => {
    client.remove(req.body.question_id, (err) => {
        if (err) {
            console.error("Error removing question:", err);
            res.status(500).send("Error removing question");
        } else {
            res.redirect("/");
        }
    });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Express server running on port %d", PORT);
});
