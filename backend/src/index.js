require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');

const server = createServer();

server.start({
    cors: {
        credentials: true,
        origin: process.env.FRONTEND_URL,
    }
}, (deeds) => {
    console.log(`Server is now running on http://localhost:${deeds.port}`);
});
