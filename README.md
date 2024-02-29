<p align="center">
    <img src="logo.png" width="350" />
</p>

# a University Management (GraphQL) API

This is a standalone API application that allows you to manage the organizational structure of any educational institution. I am creating this mostly to get familiar with my new team's tech stack, and as a practical project for my thesis.

## Tech Stack

I am not planning on expanding this project with any frontend implementations. It is supposed to be open for adaptation of users.

|      Function       |                 Framework                 |
| :-----------------: | :---------------------------------------: |
|     GQL engine      |    [Mercurius](https://mercurius.dev/)    |
|     HTTP server     |      [Fastify](https://fastify.dev/)      |
|   Authentication    |          [JWT](https://jwt.io/)           |
| Runtime Environment |       [NodeJS](https://nodejs.org/)       |
|      Language       | [TypeScript](https://typescriptlang.org/) |
|      Database       |      [MongoDB](https://mongodb.com/)      |

## How To

Using PNPM is recommended with this project. Make sure you edit the `.env` file, **especially the session secret,** and you have a MongoDB instance you can connect to.

```bash
pnpm i
pnpm start
```

The `start` script runs the TypeScript compiler and then runs the project with NodeJS. I do not run this project using `ts-node`.

## Containerization

To create a standalone container for the API service, use this command

```bash
docker build -t uni-mgr-api .
docker run -p 8001:8001 -d uni-mgr-api
```

Alternatively, create a stack with `docker-compose`

```bash
docker compose up 
```

As of right now, the image ignores the `pnpm-lock.yaml` and uses `npm` instead of `pnpm`. This will get changed in the future.

## Endpoints

As usual, querying GraphQL is possible at `/graphql`. To try and design queries and mutations, `/graphiql` is also enabled by default.

The GQL schema is located in `./schema/` directory.

## Authentication & Authorization

Registering accounts which are able to receive JWT tokens from the API is done within the GQL paradigm. `Account`s are able to be created only for `UUID`s which already have a `Person`. Check out `./schema/accounts.gql` for more detail.
The expected course of behavior is to create `Person` objects for each new student/professor/hire and then issue accounts to them by the administrator.

### Persons and Accounts

`Person` objects contain personal and organizational data on persons (students, professors, employees etc.) while `Account` contains the shared `UUID`, `passwordHash` which only appears on root document in Mongo but cannot be returned by GQL, and later will contain access groups and other authorization data (when authorization is implemented).

### Authentication

Authenticating and obtaining the JWT is possible via `login` query. The user provides the `Credentials` input object as a parameter, and is returned `LoginStatus` which either consists of an error string, or a `Token` which is structured exactly like the expected idiomatic authorization header.

It is up to the client to store the token, and add it to the `headers` of subsequent GQL requests. The structure of the `TokenHeader` makes it easy to retrieve and inject the header if authentication was successful;

```typescript
export type TokenHeader = {
  Authorization: `Bearer ${string}`;
};

export type LoginStatus = { token: TokenHeader } | { error: string };
```

Authorization is not yet implemented. Currently the only use of the context obtained from decoding JWT from header is in the `self` query, which returns `Account` if a user is authenticated

## Wishlist

- Testing
- Linting
- Generate TS to other folder
- Add authorization logic:
  - Allow customization of permissions for all queries
  - Add built-in admin credentials to .env to avoid the need to create the first admin in the database directly
- Adding and removing students to and from existing courses
- Timestamps (createdAt, updatedAt)