import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class MongoConfig {
	constructor() {
		this.dbDialect = process.env.DB_DIALECT;
		this.dbName = process.env.DB_NAME;
		this.dbHost = process.env.DB_HOST;
		this.dbUsername = process.env.DB_USERNAME;
		this.dbPassword = process.env.DB_PASSWORD;
		this.url = `${this.dbDialect}+srv://${this.dbUsername}:${this.dbPassword}@${this.dbHost}`;
		this.client = new MongoClient(this.url);
	}

	async clientConnect() {
		try {
			await this.client.connect();
			console.log('Connecté à MongoDB');
		} catch (error) {
			console.error('Erreur de connexion à MongoDB:', error);
		}
	}

	async getDb(databaseName) {
		try {
			if (!this.client) {
				await this.clientConnect();
			}
			if (databaseName) {
				return this.client.db(databaseName);
			}
		} catch (error) {
			console.error('Erreur lors de la récupération de la base de données:', error);
		}
	}
}

export default MongoConfig;
