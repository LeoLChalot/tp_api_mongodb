import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import dotenv from 'dotenv';
import MongoConfig from './database/db.js';
import bookRouter from './routes/BookRoute.js';
import Logger from './utils/logger.js';
dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT;

async function start() {
	try {
		app.use(bookRouter);

		app.listen(port, () => {
			Logger.success(`Serveur démarré sur le port ${port}`);
		});
	} catch (err) {
		Logger.error('Erreur de connexion à MongoDB:', err);
	}
}

start();
