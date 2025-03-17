import { gql } from 'graphql-tag'

export const typeDefs = gql`
  scalar ObjectId

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

  type User {
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

  type Query {
    hello: String
    config: Config
    profile: User
  }

  type Mutation {
    mutateProfile(name: String, isTeacher: Boolean, isStudent: Boolean): User
  }
  `
