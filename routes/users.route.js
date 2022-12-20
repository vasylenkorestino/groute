const { Router } = require('express')
const router = Router()
const bcrypt = require('bcryptjs')

const User = require('./../models/User')

router.get('/records', async (req, res) => {

    try {

        const name = req.query.name

        console.log('name : ', name)

        const filter = name ? { driverName : new RegExp(name, 'i') } : {}

        console.log('filter 1 ', filter)

        let users = await User.find(filter)

        console.log('users : ', users)

        if(Array.isArray(users) && !users.length){ 
            return res.status(400).json({ status: 'error', message: 'No users found', records: users }) 
        }

        res.status(200).json({ status: 'success', message: 'Users ready!', records: users })

    } catch(error){
        console.log('error', error)
        res.json({ status: 'error', errors: error })
    }
})

router.get('/record', async (req, res) => {

    try {
        const _id = req.query.productId

        const user = await User.findById({ _id })

        console.log('user 111 : ', user)

        res.status(200).json({ status: 'success', message: 'User ready!', record: user })

    } catch(error){
        console.log('error', error)
        res.json({ status: 'error', errors: error })
    }
})


router.post('/upsert', async (req, res) => {

    try {

        const user = req.body;

        console.log('user : ', user)

        if(user.hasOwnProperty('_id')){
            let ress = await User.updateOne( { _id: user._id }, user)
            console.log('ress : ', ress)
            res.status(201).json({ record : user, message: 'The record has been updated successfully!' })
        } else {

            
            const isUsed = await User.findOne({ email: user.email })

            if(isUsed){ return res.status(300).json({ status: 'error', errors: [{ msg: 'Email is used already.' }], message: 'Email is used already.' }) }

            const hashedPassword = await bcrypt.hash(user.password, 12);

            user.password = hashedPassword;

            await User.create(user, (error, response) => { 
                console.log('response : ', response)
                if(error){ res.status(400).json({ error: error })}
                res.status(201).json({ record: response, message: 'The record has been created successfully!' })
            })
        }
    } catch(error){
        console.log('error', error)
        res.json({ status: 'error', errors: error })
    }
})

router.post('/delete', async (req, res) => {
    const user = req.body;

    console.log('user delete : ', user)

    try {
        let ress = await User.findByIdAndDelete(user)
        console.log('res : ', ress)
        res.status(200).json({ message: 'The record has been deleted successfully!' })
    } catch(error){
        console.log('error ', error)
        res.status(400).json({ status: 'error', errors: error })
    }
})

router.post('/clone', async(req, res) => {
    const user = req.body;

    console.log('user clone : ', user)

    try {
        const doc = await User.findById(user);
        console.log('user clone : ', user)

        let obj = doc.toObject();
        delete obj._id;
        console.log('obj : ', obj)
        const docClone = new User(obj);
        await docClone.save();
        console.log('saved : ', docClone)
        res.status(201).json({ record: docClone, message: 'The record has been cloned successfully!' })

    } catch(error){
        console.log('error ', error)
        res.status(400).json({ status: 'error', errors: error })
    }
})

module.exports = router