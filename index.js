const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const { restart } = require('nodemon');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 5000;

const maxRequestBodySize = '1mb';

//app.use(express.json({ extended: true} ))
app.use(express.json({limit: maxRequestBodySize, extended: true }));
app.use(express.urlencoded({limit: maxRequestBodySize}));
//app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
//app.use(bodyParser.json({limit: '50mb', extended: true}));

app.use(express.static(path.join(__dirname, 'client/build')));

app.use('/api/auth', require('./routes/auth.route'))
app.use('/api/users', require('./routes/users.route'))
app.use('/api/salesforce', require('./routes/salesforce.route'))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
})

const launch = async () => {
    try {
        //mongodb+srv://gstarroutes:xnuHZq2bHEX@cluster0.t8er0.mongodb.net/gsroutes?retryWrites=true&w=majority
        //mongodb+srv://orest:<password>@uco.ilxo1ct.mongodb.net/test
        await mongoose.connect('mongodb+srv://orest:1q2w3e4r@uco.ilxo1ct.mongodb.net/test?retryWrites=true&w=majority', {
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        }, error => { 
            if(error) throw error
            console.log('Connected to MongoDB')
        })

        app.listen(PORT, () => { console.log(`Example app listening on port ${PORT}`) })
    } catch(error){
        console.log(error)
    }
}

launch()