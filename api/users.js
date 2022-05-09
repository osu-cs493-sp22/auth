/*
* API routes for 'users' collection.
*/

const bcrypt = require('bcryptjs')
const router = require('express').Router()

const { validateAgainstSchema } = require('../lib/validation')
const { UserSchema, insertNewUser, getUserById } = require('../models/user')
const { generateAuthToken, requireAuthentication } = require('../lib/auth')

router.post('/', async function (req, res) {
    if (validateAgainstSchema(req.body, UserSchema)) {
        const id = await insertNewUser(req.body)
        res.status(201).send({
            _id: id
        })
    } else {
        res.status(400).send({
            error: "Request body does not contain a valid User."
        })
    }
})

router.post('/login', async function (req, res) {
    if (req.body && req.body.id && req.body.password) {
        const user = await getUserById(req.body.id, true)
        const authenticated = user && await bcrypt.compare(
            req.body.password,
            user.password
        )
        if (authenticated) {
            const token = generateAuthToken(req.body.id)
            res.status(200).send({ token: token })
        } else {
            res.status(401).send({
                error: "Invalid credentials"
            })
        }
    } else {
        res.status(400).send({
            error: "Request needs user ID and password."
        })
    }
})

router.get('/:id', requireAuthentication, async function (req, res, next) {
    console.log("== req.user:", req.user)
    if (req.user !== req.params.id) {
        // res.status(403).send({
        //     err: "Unauthorized to access the specified resource"
        // })
        next()
    } else {
        const user = await getUserById(req.params.id)
        console.log("== req.headers:", req.headers)
        if (user) {
            res.status(200).send(user)
        } else {
            next()
        }
    }
})

module.exports = router
