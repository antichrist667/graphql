const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

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

// Datos simulados
let usersData = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
  { id: 3, name: 'Charlie', age: 35 },
];

// Funciones auxiliares para manejar los datos
const addUser = ({ name, age }) => {
  const newUser = {
    id: usersData.length + 1,
    name,
    age,
  };
  usersData.push(newUser);
  return newUser;
};

const updateUser = ({ id, name, age }) => {
  const userIndex = usersData.findIndex(user => user.id === id);
  if (userIndex === -1) {
    console.log(`User with id ${id} not found`);
    return null;
  }

  const updatedUser = {
    ...usersData[userIndex],
    name: name !== undefined ? name : usersData[userIndex].name,
    age: age !== undefined ? age : usersData[userIndex].age,
  };
  usersData[userIndex] = updatedUser;
  return updatedUser;
};

const deleteUser = ({ id }) => {
  const userIndex = usersData.findIndex(user => user.id === id);
  if (userIndex === -1) return null;

  const deletedUser = usersData[userIndex];
  usersData = usersData.filter(user => user.id !== id);
  return deletedUser;
};

// Define las funciones resolutoras
const root = {
  hello: () => 'Hello, world!',
  user: ({ id }) => usersData.find(user => user.id === id),
  users: () => usersData,
  addUser,
  updateUser,
  deleteUser,
};

// Configura el servidor Express
const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true, // Habilita la interfaz GraphiQL
}));

app.listen(4000, () => console.log('Servidor GraphQL corriendo en http://localhost:4000/graphql'));
