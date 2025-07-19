// swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation for the Node.js app',
    },
    servers: [
      {
        url: 'http://localhost:3000', // or use process.env
      },
    ],
  },
  apis: ['./src/routes/*.{ts,js}'], // Adjust this to point to where you write route annotations
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
