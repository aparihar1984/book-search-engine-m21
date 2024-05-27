const express = require('express');
// - Importing the ApolloServer and Middleware
const { ApolloServer } = require("apollo-server-express");
const { authMiddleware } = require("./utils/auth");

const path = require('path');
const db = require('./config/connection');
// - Commenting out the routes require
// const routes = require('./routes');

// - Importing the typeDefs and resolvers
const { typeDefs, resolvers } = require("./schemas");

const app = express();
const PORT = process.env.PORT || 3001;
// - Defining the ApolloServer as a const
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// - Creating an instance of an Apollo server with the GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();

  // - Integrating the ApolloServer with the Express application as middleware
  server.applyMiddleware({ app });

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  // - Adding the build line
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });

  // - Commenting out the app.use(routes); for the sandbox to load
  // app.use(routes);

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      // - Adding the console.log for the GraphQL link
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });  
  });
};

// - Calling the async function to start the server
startApolloServer(typeDefs, resolvers);

