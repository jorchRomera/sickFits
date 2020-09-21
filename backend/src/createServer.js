const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const db = require('./db');
const { GraphQLServer } = require('graphql-yoga');

function createServer() {
    return new GraphQLServer({
        typeDefs: 'src/schema.graphql',
        resolvers: {
            Mutation: Mutation,
            Query: Query,

        },
        resolverValidationOptions: {
            requireResolversForResolveType: false,
        },
        context: req => ({ ...req, db }),
    });
}

module.exports = createServer;
