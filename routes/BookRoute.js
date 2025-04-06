import express from 'express';
import BookController from '../controllers/BookController.js';


const BookRoute = express.Router();

// Define routes for booke operations
BookRoute.get('/livres', BookController.getBooks);
BookRoute.get('/livre/:id', BookController.getBookById);
BookRoute.post('/livre', BookController.createBook);
BookRoute.put('/livre/:id', BookController.updateBook);
BookRoute.delete('/livre/:id', BookController.deleteBook);

export default BookRoute;