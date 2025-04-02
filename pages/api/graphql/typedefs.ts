import { gql } from 'graphql-tag'

export const typeDefs = gql`
  scalar ObjectId

  scalar Timestamp

  type LocalizedString {
    en: String
    fu: String
    it: String
  }

  type Config {
    siteTitle: LocalizedString
  }

  type Account {
    provider: String
  }

  type School {
    _id: ObjectId
    name: String
    city: String
    city_fu: String
  }

  type User {
    _id: ObjectId
    name: String
    username: String
    email: String
    image: String
  }

  type Profile {
      _id: ObjectId
      name: String
      username: String
      email: String
      isTeacher: Boolean
      isStudent: Boolean
      isAdmin: Boolean
      isSuper: Boolean
      isViewer: Boolean
      image: String
      accounts: [Account],
  } 

  type Poll {
    _id: ObjectId
    secret: String
    adminSecret: String
    entriesCount: Int
    date: Timestamp
    school: School
    class: String
    year: String
    form: String
    closed: Boolean
    createdBy: User
    createdAt: Timestamp,
  }

  type Query {
    hello: String
    config: Config
    profile: Profile
    polls(year: Int, _id: ObjectId, adminSecret: String): [Poll]
  }

  type Mutation {
    setProfile(name: String, isTeacher: Boolean, isStudent: Boolean): User
    newPoll(school: ObjectId, class: String, year: String, form: String): ObjectId
    patchPoll(_id: ObjectId!, secret: String, school_id: ObjectId, form: String, type: String, class: String, year: String, adminSecret: Boolean, closed: Boolean): Poll
    deletePoll(_id: ObjectId!): Boolean
  }
  `
