<p align="center">
    <img src="logo.png" width="200" />
</p>

# a University Management (GraphQL) API

This is a standalone API application that allows you to manage the organizational structure of any educational institution. I am creating this mostly to get familiar with my new team's tech stack, and as a practical project for my thesis.

## Tech Stack

I am not planning on expanding this project with any frontend implementations. It is supposed to be open for adaptation of users.

|      Function       | Framework  |
| :-----------------: | :--------: |
|     GQL engine      | Mercurius  |
|     HTTP server     |  Fastify   |
|   Authentication    |    JWT     |
| Runtime Environment |   NodeJS   |
|      Language       | TypeScript |
|      Database       |  MongoDB   |

## How To

Using PNPM is recommended with this project. Make sure you edit the `.env` file, **especially the session secret,** and you have a MongoDB instance you can connect to.

```bash
pnpm i
pnpm start
```

The `start` script runs the TypeScript compiler and then runs the project with NodeJS. I do not run this project using `ts-node`.

## Endpoints

As usual, querying GraphQL is possible at `/graphql`. To try and design queries and mutations, `/graphiql` is also enabled by default.

The GQL schema is located in `./schema/` directory.

## Authentication & Authorization

Registering accounts which are able to receive JWT tokens from the API is done within the GQL paradigm. `Account`s are able to be created only for `UUID`s which already have a `Person`. Check out `./schema/accounts.gql` for more detail.

### Persons and Accounts

`Person` objects contain personal and organizational data on persons (students, professors, employees etc.) while `Account` contains the shared `UUID`, `passwordHash` which only appears on root document in Mongo but cannot be returned by GQL, and later will contain access groups and other authorization data (when authorization is implemented).

### Authentication

Logging in is currently done outside of GQL, on the `/login` endpoint.
Here is an example of authentication using the JavaScript Fetch API:

```typescript
const res = await fetch(
    "http://localhost:8001/login",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // Make sure that the headers are correct. Powershell's Invoke-WebRequest for example,
            // uses "Content-Type": "application/x-www-form-urlencoded" by default
        },
        body. JSON.stringify({
            UUID: "D9SJ2A",
            password: "zaq1@WSX",
            // Passwords have to be between 7-20 characters, have to include: a special character,
            // a letter and a number. They cannot include emojis!
        })
    }
);

type AuthResponse = { token: string } | string;
const dataBody: AuthResponse = await res.json();
```

It is up to the client to store the token, and add it to the `headers` of subsequent GQL requests.

```typescript
headers: {
    "Authorization": "Bearer <token>"
},
```
