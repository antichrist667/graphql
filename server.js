const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { pool } = require('./db');

// Define el esquema de GraphQL
const schema = buildSchema(`
  type Query {
    hello: String
    user(id: Int!): User
    users: [User]
  }

  type Mutation {
    addUser(name: String!, age: Int!): User
    updateUser(id: Int!, name: String, age: Int): User
    deleteUser(id: Int!): User
  }

  type User {
    id: Int
    name: String
    age: Int
  }
`);

// Funciones resolutoras
const root = {
  hello: () => 'Hello, world!',
  user: async ({ id }) => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  users: async () => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users');
      return result.rows;
    } finally {
      client.release();
    }
  },
  addUser: async ({ name, age }) => {
    const client = await pool.connect();
    try {
      const result = await client.query('INSERT INTO users (name, age) VALUES ($1, $2) RETURNING *', [name, age]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  updateUser: async ({ id, name, age }) => {
    const client = await pool.connect();
    try {
      const result = await client.query('UPDATE users SET name = $1, age = $2 WHERE id = $3 RETURNING *', [name, age, id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  deleteUser: async ({ id }) => {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },
};

// Configurar el servidor Express
const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true, // Habilita la interfaz GraphiQL
}));

app.listen(4000, () => console.log('Servidor GraphQL corriendo en http://localhost:4000/graphql'));
                