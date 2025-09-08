// server.js - Starter Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// TODO: Implement the following routes:
// GET /api/products - Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id - Get a specific product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

// POST /api/products - Create a new product
app.post('/api/products', (req, res) => {
  const { name, category, price } = req.body;
  if (!name || !category || !price) {
    return res.status(400).json({ error: "Name, category, and price are required" });
  }

  const newProduct = {
    id: uuidv4(),
    name,
    category,
    price
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update a product
app.put('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const { name, category, price } = req.body;
  if (name) product.name = name;
  if (category) product.category = category;
  if (price) product.price = price;

  res.json(product);
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const deleted = products.splice(index, 1);
  res.json({ message: "Product deleted", product: deleted[0] });
});


// Example route implementation for GET /api/products
app.get('/api/products', (req, res) => {
  res.json(products);
});
app.get('/api/products', (req, res) => {
  let filteredProducts = products;

  const { category, minPrice, maxPrice, name } = req.query;

  // Filter by category
  if (category) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Filter by minimum price
  if (minPrice) {
    filteredProducts = filteredProducts.filter(
      (p) => p.price >= parseFloat(minPrice)
    );
  }

  // Filter by maximum price
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(
      (p) => p.price <= parseFloat(maxPrice)
    );
  }

  // Search by name (case insensitive)
  if (name) {
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  res.json(filteredProducts);
}); 

// TODO: Implement custom middleware for:
// - Request logging

const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next(); // pass control to next middleware/route
};

app.use(logger);

// - Authentication
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  // Example: hardcoded key for assignment purposes
  if (apiKey && apiKey === "mysecretkey123") {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized. API key missing or invalid." });
  }
};

// Apply only to /api routes
app.use('/api', authenticate);

// -validatiion
const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;

  if (!name || !description || !price || !category || inStock === undefined) {
    return res.status(400).json({ error: "All product fields are required." });
  }

  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: "Price must be a positive number." });
  }

  next();
};

// Example usage in routes
app.post('/api/products', validateProduct, (req, res) => {
  // create product logic here
});


// - Error handling

// errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });
};

// Register after all routes
app.use(errorHandler);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app; 