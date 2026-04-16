require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 6000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI environment variable is required');
    process.exit(1);
}

const maxRequestBodySize = '25mb';

app.use(express.json({ limit: maxRequestBodySize, extended: true }));
app.use(express.urlencoded({ limit: maxRequestBodySize }));

app.use(express.static(path.join(__dirname, 'client/build')));

app.use('/api/auth', require('./routes/auth.route'))
app.use('/api/users', require('./routes/users.route'))
app.use('/api/salesforce', require('./routes/salesforce.route'))

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
})

const launch = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        app.listen(PORT, () => { console.log(`App listening on port ${PORT}`) })
    } catch (error) {
        console.error('Failed to start:', error);
        process.exit(1);
    }
}

launch()