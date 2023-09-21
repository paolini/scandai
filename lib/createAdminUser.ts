import { Connection } from 'mongoose'
import { hash, compare } from 'bcrypt'

export default async function createAdminUser(db: Connection) {
    const username = process.env.ADMIN_USERNAME
    const password = process.env.ADMIN_PASSWORD
    if (!username) {
        console.log("no ADMIN_USERNAME set")
        return
    }
    if (!password) {
        console.log("no ADMIN_PASSWORD set")
        return
    }
    const encryptedPassword = await hash(password, 12)
    const users = db.collection('users')

    const user = await users.findOne({ username })
    if (user) {
        console.log(`admin user "${username}" already exists.`)
        if (await compare(password, user.password)) {
            console.log(`admin user "${username}" password already matches env variable ADMIN_PASSWORD.`)
        } else {
            await users.updateOne(
                { _id: user._id }, 
                { $set: {password: encryptedPassword }})
            console.log(`admin user "${username}" password updated to match ADMIN_PASSWORD env variable.`)
        }
        if (user.isAdmin && user.isSuper) {
            console.log(`admin user "${username}" already has admin role.`)
        } else {
            await users.updateOne(
                { _id: user._id }, 
                { $set: {
                    isAdmin: true,
                    isSuper: true,
                }})
            console.log(`set admin role to admin user "${username}".`)
        }
    } else {
        console.log(`creating admin user ${username}`)
        const user = {
            username,
            password: encryptedPassword,
            isAdmin: true,
            isSuper: true,
        }
        await users.insertOne(user)
        console.log(`admin user ${username} created.`)
    } 
}
  
