import { gql, TypedDocumentNode } from '@apollo/client'

import { User, Poll, Config, Translation } from '@/generated/graphql'

export const ConfigQuery: TypedDocumentNode<{ config: Config }> = gql`
    query ConfigQuery {
        config {
            siteTitle {
                fu
                it
                en
            }
        }
    }`

export const ProfileQuery: TypedDocumentNode<{ profile: User|null }> = gql`
    query ProfileQuery {
        profile {
            _id
            name
            username
            email
            isTeacher
            isStudent
            isAdmin
            isSuper
            isViewer
            image
        }
    }`

export const TranslationsQuery: TypedDocumentNode<{translations:Translation}> = gql`
    query TranslationsQuery {
        translations
    }`

export const PollsQuery: TypedDocumentNode<{ polls: Poll[] }, { year?: number, adminSecret?: string }> = gql`
    query PollsQuery($year: Int) {
        polls(year: $year) {
            _id,
            form,
            closed,
            secret,
            adminSecret,
            entriesCount,
            date,
            class,
            year,
            school {
                _id,
                name,
                city,
                city_fu,
            }
            createdBy {
                _id,
                name,
                email,
                image,
                username,
            }
            createdAt
        }
    }`

export const PollQuery = gql`query PollQuery($_id: ObjectId, $adminSecret: String, $secret: String) {
    poll(_id: $_id, adminSecret: $adminSecret, secret: $secret) {
        _id,
        form,
        closed,
        secret,
        adminSecret,
        entriesCount,
        date,
        class,
        year,
        school {
            _id,
            name,
            city,
            city_fu,
        }
        createdBy {
            _id,
            name,
            email,
            image,
            username,
        }
        createdAt
    }
}`
