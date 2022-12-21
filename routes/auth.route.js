const { Router } = require('express')
const router = Router()

const User = require('./../models/User')

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/registration', async (req, res) => {

    try {

        console.log(req.body)

        const { email, password } = req.body

        const isUsed = await User.findOne({ email })

        if(isUsed){ return res.status(300).json({ status: 'error', errors: [{ msg: 'Email is used already.' }], message: 'Email is used already.' }) }

        const hashedPassword = await bcrypt.hash(password, 12);

        await new User({ email, password: hashedPassword }).save()

        res.status(201).json({ status: 'success', message: 'User created succesfully!' })

    } catch(error){
        console.log('error', error)
        res.json({ status: 'error', errors: error })
    }
})

router.post('/login', async (req, res) => {
    try {

        const { email, password } = req.body

        console.log(req.body)

        const user = await User.findOne({ email })

        console.log('user : ', user)

        if(!user){ return res.status(300).json({ status: 'error', message: 'User not found!' }) }

        //if(!user.isActive){ return res.status(404).json({ status: 'error', message: 'User is inActive! Please contact your System Administrator!' }) }

        const isMatched = await bcrypt.compare(password, user.password);

        console.log('isMatched : ', isMatched)

        if(!isMatched){ return res.status(300).json({ status: 'error', message: 'Incorect password' }) } 

        const key = 'wuoehg79233gh782h723fhfoequhfuewfh732fh2873fhufwhufew'

        const session = jwt.sign( { userId: user.id }, key, { expiresIn: '1h'});

        res.status(200).json({ status: 'success', message: 'User is logged in!', session, userId: user.id, isAdmin: user.isAdmin, userName: user.driverName })

    } catch (error) {
        console.log('error', error)
        res.json({ status: 'error', errors: error })
    }
})

router.get('/user', async (req, res) => {

    try {

        const _id = req.query._id

        console.log('_id : ', _id)

        const user = await User.findOne({ _id })

        console.log('isUsed : ', user)

        res.status(200).json({ status: 'success', user: user,  message: 'User exist!' })

    } catch(error){
        console.log('error', error)
        res.json({ status: 'error', errors: error })
    }
})

router.post('/upsert', async (req, res) => {

    try {

        const user = req.body

        console.log('user upsert : ', user)

        await User.updateOne( { _id: user._id }, user)
        res.status(201).json({ user : user, message: 'The record has been updated successfully!' })

    } catch(error){
        console.log('error', error)
        res.json({ status: 'error', errors: error })
    }
})

module.exports = router