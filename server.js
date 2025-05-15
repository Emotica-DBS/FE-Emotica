const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the pages directory
app.use(express.static(path.join(__dirname, 'pages')));

// Redirect root to landing page
app.get('/', (req, res) => {
    res.redirect('/landing.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 