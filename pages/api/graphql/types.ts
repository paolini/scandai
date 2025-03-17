import { GraphQLScalarType, Kind, ValueNode } from "graphql"
import type { NextRequest } from "next/server"
import { ObjectId } from "mongodb"

export type Config = {
  siteTitle: {
    fu: string,
    it: string,
    en: string
  }
}

export type User = {
  _id: ObjectId,
  name: string,
  username: string,
  email: string,
  isAdmin: boolean,
  isSuper: boolean,
  isViewer: boolean,
  isTeacher: boolean,
  isStudent: boolean,
  image: string,
}
  
export type Context = {
    req: NextRequest
    res: Response|undefined
    user?: User
  }
  
export const ObjectIdType = new GraphQLScalarType({
  name: "ObjectId",
  description: "A custom scalar for MongoDB ObjectID",
  
  parseValue(value: unknown): ObjectId {
    switch(typeof value) {
      case "string":
      case "number":
        return new ObjectId(value); // Converte in ObjectId
      case "object":
        if (value instanceof ObjectId) return value; // Se è già un ObjectId, lo ritorna
      default:
        throw new Error("ObjectId must be a 24 digit hex string or a 12 byte Buffer");
    }
  },

  serialize(value: unknown): string {
    if (value instanceof ObjectId) return value.toString(); // Converte in stringa
    throw new Error("ObjectId expected");
  },

  parseLiteral(ast: ValueNode): ObjectId {
    if (ast.kind === Kind.STRING) {
      return new ObjectId(ast.value); // Converte in ObjectId
    }
    throw new Error("ObjectId must be a 24 digit hex string");
  }
});

  