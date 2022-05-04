/*
 * User schema and data accessor methods.
 */

const { ObjectId } = require('mongodb')
const bcrypt = require('bcryptjs')

const { extractValidFields } = require('../lib/validation')
const { getDBReference } = require('../lib/mongo')

/*
 * Schema for a User.
 */
const UserSchema = {
    name: { required: true },
    email: { required: true },
    password: { required: true }
}
exports.UserSchema = UserSchema


/*
 * Insert a new User into the DB.
 */
exports.insertNewUser = async function (user) {
    const userToInsert = extractValidFields(user, UserSchema)
    userToInsert.password = await bcrypt.hash(userToInsert.password, 8)
    console.log("== Hashed, salted password:", userToInsert.password)
    const db = getDBReference()
    const collection = db.collection('users')
    const result = await collection.insertOne(userToInsert)
    return result.insertedId
}


/*
 * Fetch a user from the DB based on user ID.
 */
exports.getUserById = async function (id, includePassword) {
    const db = getDBReference()
    const collection = db.collection('users')
    if (!ObjectId.isValid(id)) {
        return null
    } else {
        const results = await collection
            .find({ _id: new ObjectId(id) })
            .project(includePassword ? {} : { password: 0 })
            .toArray()
        return results[0]
    }
}
