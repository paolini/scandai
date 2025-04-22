import bcrypt from 'bcrypt'

import { getUserCollection, trashDocument } from "@/lib/mongodb"
import {Context} from "../types"
import {MutationDeleteUserArgs, MutationNewUserArgs, MutationPatchUserArgs, MutationSetProfileArgs, Profile, User} from "@/generated/graphql"

export async function users(_parent:any, {}, {user}: Context) {
    if (!user) throw Error("not authenticated")
    if (!user.isAdmin) throw Error("not authorized")
    const collection = await getUserCollection()
    const users = await collection.aggregate([
        {$project: {
            password: 0,
        }},
        {$lookup: { 
            from: "accounts", 
            as: "accounts", 
            localField: "_id", 
            foreignField: "userId",
            pipeline:[{
                $project:{
                    provider:1,
                    _id:0
            }}]
        }}
    ]).toArray() as User[]
    return users
}

export async function profile(_parent: any, _args: any, {user}: Context): Promise<Profile|null> {
    if (!user) return null
    const collection = await getUserCollection()
    const profile = await collection.findOne({_id: user._id})
    if (!profile) return null
    return profile as Profile
}

export async function setProfile(_parent: any, {name, isTeacher, isStudent}: MutationSetProfileArgs, context: Context) {
    if (!context.user) throw new Error('not authenticated')
    const collection = await getUserCollection()
    let $set: any = {}
    if (name!==null) $set.name = name
    if (isTeacher!==null) $set.isTeacher = isTeacher
    if (isStudent!=null) $set.isStudent = isStudent
    const out = await collection.findOneAndUpdate({_id: context.user._id}, {$set})
    if (!out) throw new Error('user not found')
    return out.value as Profile
}

export async function newUser(_parent: any, {name,username,email}: MutationNewUserArgs, {user}: Context) {
    if (!user) throw Error("not authenticated")
    if (!user.isAdmin) throw Error("not authorized")
    const collection = await getUserCollection()
    const res = await collection.insertOne({
        name: name || '', 
        username: username || '', 
        email: email || '',
    })
    const _id = res.insertedId
    const out = await collection.findOne({_id})
    if (!out) throw Error("database error")
    return out as Profile
}

export async function patchUser(_parent: any, {_id, data}: MutationPatchUserArgs, {user}: Context): Promise<Profile> {
    if (!user) throw Error("not authenticated")
    if (!user.isAdmin) throw Error("not authorized")
        
    let $set: any = {}

    function valid(x: any) { return x!==null && x!==undefined}

    if (valid(data.isAdmin)) $set.isAdmin = data.isAdmin
    if (valid(data.isViewer)) $set.isViewer = data.isViewer
    if (valid(data.isTeacher)) $set.isTeacher = data.isTeacher
    if (valid(data.isStudent)) $set.isStudent = data.isStudent
    if (valid(data.isSuper)) {
        if (!user.isSuper) throw Error("not authorized")
        $set.isSuper = data.isSuper
    }
    if (valid(data.password)) {
        if (!user.isSuper) throw Error("not authorized")
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(data.password as string, saltRounds)
        $set.password = hashedPassword
    }

    const collection = await getUserCollection()
    await collection.updateOne({_id}, {$set})
    const out = await collection.findOne({_id})
    if (!out) throw Error("database error")
    return out as Profile
}

export async function deleteUser(_parent: any, {_id}: MutationDeleteUserArgs, {user}:Context) {
    if (!user) throw Error("not authenticated")
    if (!user.isAdmin) throw Error("not authorized")
    const collection = await getUserCollection()
    await trashDocument(collection,_id)
    return true
}