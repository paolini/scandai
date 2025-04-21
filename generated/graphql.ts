import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from '../pages/api/graphql/types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSON: { input: any; output: any; }
  ObjectId: { input: any; output: any; }
  Timestamp: { input: any; output: any; }
};

export type Account = {
  __typename?: 'Account';
  provider: Maybe<Scalars['String']['output']>;
};

export type Config = {
  __typename?: 'Config';
  siteTitle: Maybe<LocalizedString>;
};

export type LocalizedString = {
  __typename?: 'LocalizedString';
  en: Maybe<Scalars['String']['output']>;
  fu: Maybe<Scalars['String']['output']>;
  it: Maybe<Scalars['String']['output']>;
};

export type LocalizedStringInput = {
  en: InputMaybe<Scalars['String']['input']>;
  fu: InputMaybe<Scalars['String']['input']>;
  it: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  closePoll: Maybe<Scalars['Boolean']['output']>;
  deletePoll: Maybe<Scalars['Boolean']['output']>;
  newPoll: Maybe<Scalars['ObjectId']['output']>;
  openPoll: Maybe<Scalars['Boolean']['output']>;
  pollCreateAdminSecret: Maybe<Scalars['Boolean']['output']>;
  pollRemoveAdminSecret: Maybe<Scalars['Boolean']['output']>;
  postTranslation: Maybe<Translation>;
  setProfile: Maybe<User>;
};


export type MutationClosePollArgs = {
  _id: Scalars['ObjectId']['input'];
  secret: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeletePollArgs = {
  _id: Scalars['ObjectId']['input'];
};


export type MutationNewPollArgs = {
  class: InputMaybe<Scalars['String']['input']>;
  form: InputMaybe<Scalars['String']['input']>;
  school: InputMaybe<Scalars['ObjectId']['input']>;
  year: InputMaybe<Scalars['String']['input']>;
};


export type MutationOpenPollArgs = {
  _id: Scalars['ObjectId']['input'];
  secret: InputMaybe<Scalars['String']['input']>;
};


export type MutationPollCreateAdminSecretArgs = {
  _id: Scalars['ObjectId']['input'];
  secret: InputMaybe<Scalars['String']['input']>;
};


export type MutationPollRemoveAdminSecretArgs = {
  _id: Scalars['ObjectId']['input'];
  secret: InputMaybe<Scalars['String']['input']>;
};


export type MutationPostTranslationArgs = {
  map: LocalizedStringInput;
  source: Scalars['String']['input'];
};


export type MutationSetProfileArgs = {
  isStudent: InputMaybe<Scalars['Boolean']['input']>;
  isTeacher: InputMaybe<Scalars['Boolean']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
};

export type Poll = {
  __typename?: 'Poll';
  _id: Maybe<Scalars['ObjectId']['output']>;
  adminSecret: Maybe<Scalars['String']['output']>;
  class: Maybe<Scalars['String']['output']>;
  closed: Maybe<Scalars['Boolean']['output']>;
  createdAt: Maybe<Scalars['Timestamp']['output']>;
  createdBy: Maybe<User>;
  date: Maybe<Scalars['Timestamp']['output']>;
  entriesCount: Maybe<Scalars['Int']['output']>;
  form: Maybe<Scalars['String']['output']>;
  school: Maybe<School>;
  secret: Maybe<Scalars['String']['output']>;
  year: Maybe<Scalars['String']['output']>;
};

export type Profile = {
  __typename?: 'Profile';
  _id: Maybe<Scalars['ObjectId']['output']>;
  accounts: Maybe<Array<Maybe<Account>>>;
  email: Maybe<Scalars['String']['output']>;
  image: Maybe<Scalars['String']['output']>;
  isAdmin: Maybe<Scalars['Boolean']['output']>;
  isStudent: Maybe<Scalars['Boolean']['output']>;
  isSuper: Maybe<Scalars['Boolean']['output']>;
  isTeacher: Maybe<Scalars['Boolean']['output']>;
  isViewer: Maybe<Scalars['Boolean']['output']>;
  name: Maybe<Scalars['String']['output']>;
  username: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  config: Config;
  hello: Maybe<Scalars['String']['output']>;
  poll: Maybe<Poll>;
  polls: Maybe<Array<Maybe<Poll>>>;
  profile: Maybe<Profile>;
  schools: Maybe<Scalars['JSON']['output']>;
  stats: Maybe<Scalars['JSON']['output']>;
  translations: Maybe<Scalars['JSON']['output']>;
};


export type QueryPollArgs = {
  _id: InputMaybe<Scalars['ObjectId']['input']>;
  adminSecret: InputMaybe<Scalars['String']['input']>;
  secret: InputMaybe<Scalars['String']['input']>;
};


export type QueryPollsArgs = {
  _id: InputMaybe<Scalars['ObjectId']['input']>;
  adminSecret: InputMaybe<Scalars['String']['input']>;
  secret: InputMaybe<Scalars['String']['input']>;
  year: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySchoolsArgs = {
  year: InputMaybe<Scalars['Int']['input']>;
};


export type QueryStatsArgs = {
  adminSecret: InputMaybe<Scalars['String']['input']>;
  city: InputMaybe<Scalars['String']['input']>;
  class: InputMaybe<Scalars['String']['input']>;
  form: InputMaybe<Scalars['String']['input']>;
  poll: InputMaybe<Scalars['ObjectId']['input']>;
  polls: InputMaybe<Array<InputMaybe<Scalars['ObjectId']['input']>>>;
  schoolId: InputMaybe<Scalars['ObjectId']['input']>;
  schoolSecret: InputMaybe<Scalars['String']['input']>;
  year: InputMaybe<Scalars['Int']['input']>;
};

export type School = {
  __typename?: 'School';
  _id: Maybe<Scalars['ObjectId']['output']>;
  city: Maybe<Scalars['String']['output']>;
  city_fu: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
};

export type Translation = {
  __typename?: 'Translation';
  map: Maybe<LocalizedString>;
  source: Maybe<Scalars['String']['output']>;
};

export type User = {
  __typename?: 'User';
  _id: Maybe<Scalars['ObjectId']['output']>;
  email: Maybe<Scalars['String']['output']>;
  image: Maybe<Scalars['String']['output']>;
  isAdmin: Maybe<Scalars['Boolean']['output']>;
  isStudent: Maybe<Scalars['Boolean']['output']>;
  isSuper: Maybe<Scalars['Boolean']['output']>;
  isTeacher: Maybe<Scalars['Boolean']['output']>;
  isViewer: Maybe<Scalars['Boolean']['output']>;
  name: Maybe<Scalars['String']['output']>;
  username: Maybe<Scalars['String']['output']>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Account: ResolverTypeWrapper<Account>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Config: ResolverTypeWrapper<Config>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  LocalizedString: ResolverTypeWrapper<LocalizedString>;
  LocalizedStringInput: LocalizedStringInput;
  Mutation: ResolverTypeWrapper<{}>;
  ObjectId: ResolverTypeWrapper<Scalars['ObjectId']['output']>;
  Poll: ResolverTypeWrapper<Poll>;
  Profile: ResolverTypeWrapper<Profile>;
  Query: ResolverTypeWrapper<{}>;
  School: ResolverTypeWrapper<School>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Timestamp: ResolverTypeWrapper<Scalars['Timestamp']['output']>;
  Translation: ResolverTypeWrapper<Translation>;
  User: ResolverTypeWrapper<User>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Account: Account;
  Boolean: Scalars['Boolean']['output'];
  Config: Config;
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  LocalizedString: LocalizedString;
  LocalizedStringInput: LocalizedStringInput;
  Mutation: {};
  ObjectId: Scalars['ObjectId']['output'];
  Poll: Poll;
  Profile: Profile;
  Query: {};
  School: School;
  String: Scalars['String']['output'];
  Timestamp: Scalars['Timestamp']['output'];
  Translation: Translation;
  User: User;
}>;

export type AccountResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Account'] = ResolversParentTypes['Account']> = ResolversObject<{
  provider: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ConfigResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Config'] = ResolversParentTypes['Config']> = ResolversObject<{
  siteTitle: Resolver<Maybe<ResolversTypes['LocalizedString']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type LocalizedStringResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LocalizedString'] = ResolversParentTypes['LocalizedString']> = ResolversObject<{
  en: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fu: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  it: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  closePoll: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationClosePollArgs, '_id'>>;
  deletePoll: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationDeletePollArgs, '_id'>>;
  newPoll: Resolver<Maybe<ResolversTypes['ObjectId']>, ParentType, ContextType, MutationNewPollArgs>;
  openPoll: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationOpenPollArgs, '_id'>>;
  pollCreateAdminSecret: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationPollCreateAdminSecretArgs, '_id'>>;
  pollRemoveAdminSecret: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationPollRemoveAdminSecretArgs, '_id'>>;
  postTranslation: Resolver<Maybe<ResolversTypes['Translation']>, ParentType, ContextType, RequireFields<MutationPostTranslationArgs, 'map' | 'source'>>;
  setProfile: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, MutationSetProfileArgs>;
}>;

export interface ObjectIdScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ObjectId'], any> {
  name: 'ObjectId';
}

export type PollResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Poll'] = ResolversParentTypes['Poll']> = ResolversObject<{
  _id: Resolver<Maybe<ResolversTypes['ObjectId']>, ParentType, ContextType>;
  adminSecret: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  class: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  closed: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  createdBy: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  date: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  entriesCount: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  form: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  school: Resolver<Maybe<ResolversTypes['School']>, ParentType, ContextType>;
  secret: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  year: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProfileResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Profile'] = ResolversParentTypes['Profile']> = ResolversObject<{
  _id: Resolver<Maybe<ResolversTypes['ObjectId']>, ParentType, ContextType>;
  accounts: Resolver<Maybe<Array<Maybe<ResolversTypes['Account']>>>, ParentType, ContextType>;
  email: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  image: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isAdmin: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isStudent: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isSuper: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isTeacher: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isViewer: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  username: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  config: Resolver<ResolversTypes['Config'], ParentType, ContextType>;
  hello: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  poll: Resolver<Maybe<ResolversTypes['Poll']>, ParentType, ContextType, QueryPollArgs>;
  polls: Resolver<Maybe<Array<Maybe<ResolversTypes['Poll']>>>, ParentType, ContextType, QueryPollsArgs>;
  profile: Resolver<Maybe<ResolversTypes['Profile']>, ParentType, ContextType>;
  schools: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType, QuerySchoolsArgs>;
  stats: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType, QueryStatsArgs>;
  translations: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
}>;

export type SchoolResolvers<ContextType = Context, ParentType extends ResolversParentTypes['School'] = ResolversParentTypes['School']> = ResolversObject<{
  _id: Resolver<Maybe<ResolversTypes['ObjectId']>, ParentType, ContextType>;
  city: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  city_fu: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface TimestampScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Timestamp'], any> {
  name: 'Timestamp';
}

export type TranslationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Translation'] = ResolversParentTypes['Translation']> = ResolversObject<{
  map: Resolver<Maybe<ResolversTypes['LocalizedString']>, ParentType, ContextType>;
  source: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  _id: Resolver<Maybe<ResolversTypes['ObjectId']>, ParentType, ContextType>;
  email: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  image: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isAdmin: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isStudent: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isSuper: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isTeacher: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isViewer: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  username: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = Context> = ResolversObject<{
  Account: AccountResolvers<ContextType>;
  Config: ConfigResolvers<ContextType>;
  JSON: GraphQLScalarType;
  LocalizedString: LocalizedStringResolvers<ContextType>;
  Mutation: MutationResolvers<ContextType>;
  ObjectId: GraphQLScalarType;
  Poll: PollResolvers<ContextType>;
  Profile: ProfileResolvers<ContextType>;
  Query: QueryResolvers<ContextType>;
  School: SchoolResolvers<ContextType>;
  Timestamp: GraphQLScalarType;
  Translation: TranslationResolvers<ContextType>;
  User: UserResolvers<ContextType>;
}>;

