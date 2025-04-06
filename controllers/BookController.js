import { ObjectId } from 'mongodb';
import MongoConfig from '../database/db.js';
import Logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();
const dbName = process.env.DB_NAME;
const appConfig = new MongoConfig();
const db = await appConfig.getDb(dbName);
const books = db.collection('books');

/** ## Contrôleur pour la gestion des livres.
 * Ce contrôleur contient les méthodes pour effectuer les opérations CRUD sur les livres.
 *
 * ### Méthodes disponibles :
 * - `getBooks` : Récupère tous les livres avec des options de filtrage et de tri.
 * - `getBookById` : Récupère un livre spécifique par son ID.
 * - `createBook` : Crée un nouveau livre.
 * - `updateBook` : Met à jour un livre existant.
 * - `deleteBook` : Supprime un livre par son ID.
 *
 * @module BookController
 */
const BookController = {
	/** ## Récupère tous les livres.
	 * @async
	 * @function getAllbooks
	 * @param {Object} req - L'objet de requête HTTP.
	 * @param {Object} res - L'objet de réponse HTTP.
	 * @returns {Promise<void>} Renvoie une réponse JSON contenant tous les livres ou une erreur.
	 */
	getBooks: async (req, res) => {
		// ## GET /livres
		// - [x] Récupérer tous les livres
		// - [x] Permettre les filtres :
		//   - [x] par auteur (?auteur=Khalil)
		//   - [x] par disponibilité (?disponible=true)
		//   - [x] par genre (?genre=Philosophie)
		//   - [x] par note minimum (?minNote=4)
		// - [x] Support du tri par note ou année (?tri=note, ?ordre=desc)

		Logger.info('Récupération de tous les livres');
		try {
			const filters = req.query;
			const query = {};
			const sort = {};

			if (filters.auteur) {
				query.auteur = filters.auteur;
			}
			if (filters.disponible) {
				query.disponible = filters.disponible === 'true';
			}
			if (filters.genre) {
				query.genre = filters.genre;
			}
			if (filters.minNote) {
				query.note = { $gte: parseFloat(filters.minNote) };
			}
			if (filters.tri) {
				if (filters.tri === 'note' || filters.tri === 'annee') {
					sort[filters.tri] = filters.ordre === 'desc' ? -1 : 1;
				}
			}

			Logger.info(`Filtres appliqués: ${JSON.stringify(filters)}`);
			const booksList = await books.find(query).sort(sort).toArray();
			if (booksList.length === 0) {
				Logger.warn('Aucun livre trouvé avec les filtres spécifiés');
				return res.status(404).json({ message: 'No books found with the specified filters' });
			}
			res.status(200).json(booksList);
		} catch (error) {
			Logger.error(`Error fetching books - ${error}`);
			res.status(500).json({ message: `Error fetching books`, error });
		}
	},

	/** ## Récupère un livre par son ID.
	 * @async
	 * @function getbookbyid
	 * @param {Object} req - L'objet de requête HTTP contenant l'ID de le livre dans les paramètres.
	 * @param {Object} res - L'objet de réponse HTTP.
	 * @returns {Promise<void>} Renvoie une réponse JSON contenant le livre ou une erreur.
	 */
	getBookById: async (req, res) => {
		Logger.info(`Récupération du livre avec l'ID: ${req.params.id}`);
		try {
			const bookId = req.params.id;
			if (!ObjectId.isValid(bookId)) {
				Logger.warn('ID de livre invalide');
				return res.status(400).json({ message: 'Invalid book ID' });
			}
			const book = await books.findOne({ _id: ObjectId.createFromHexString(bookId) });
			if (!book) {
				Logger.warn(`Livre non trouvé avec l'ID: ${bookId}`);
				return res.status(404).json({ message: 'Book not found' });
			}
			res.status(200).json(book);
		} catch (error) {
			Logger.error(`Error fetching book - ${error}`);
			res.status(500).json({ message: 'Error fetching book', error });
		}
	},

	/** ## Crée un nouveau livre.
	 * @async
	 * @function createbook
	 * @param {Object} req - L'objet de requête HTTP contenant les données de le livre dans le corps.
	 * @param {Object} res - L'objet de réponse HTTP.
	 * @returns {Promise<void>} Renvoie une réponse JSON contenant le livre créé ou une erreur.
	 */
	createBook: async (req, res) => {
		Logger.info("Création d'un nouveau livre");
		try {
			const { titre, auteur, annee, note, genres } = req.body;

			// Validation des champs obligatoires
			if (!titre || !auteur) {
				Logger.warn('Titre et auteur sont obligatoires');
				return res.status(400).json({ message: 'Titre et auteur sont obligatoires' });
			}

			// Validation de l'année
			if (annee && (typeof annee !== 'number' || annee < 1800)) {
				Logger.warn("L'année doit être un nombre supérieur ou égal à 1800");
				return res
					.status(400)
					.json({ message: "L'année doit être un nombre supérieur ou égal à 1800" });
			}

			// Validation de la note
			if (note && (typeof note !== 'number' || note < 0 || note > 5)) {
				Logger.warn('La note doit être un nombre entre 0 et 5');
				return res.status(400).json({ message: 'La note doit être un nombre entre 0 et 5' });
			}

			// Validation des genres
			if (genres && !Array.isArray(genres)) {
				Logger.warn('Genres doit être un tableau');
				return res.status(400).json({ message: 'Genres doit être un tableau' });
			}

			// Création du livre
			const newBook = { titre, auteur, annee, note, genres };
			const result = await books.insertOne(newBook);

			Logger.info('Livre créé avec succès');
			res.status(201).json({ message: 'Livre créé avec succès', newBook: result });
		} catch (error) {
			Logger.error(`Error creating book - ${error}`);
			res.status(500).json({ message: 'Error creating book', error });
		}
	},

	/** ## Met à jour un livre existant.
	 * @async
	 * @function updatebook
	 * @param {Object} req - L'objet de requête HTTP contenant l'ID de le livre dans les paramètres et les données à mettre à jour dans le corps.
	 * @param {Object} res - L'objet de réponse HTTP.
	 * @returns {Promise<void>} Renvoie une réponse JSON contenant le livre mis à jour ou une erreur.
	 */

	updateBook: async (req, res) => {
		Logger.info(`Mise à jour du livre avec l'ID: ${req.params.id}`);
		try {
			const { id } = req.params;
			const updates = req.body;

			// Ne pas autoriser la modification du champ _id
			if (updates._id) {
				Logger.warn('Modification du champ _id non autorisée');
				return res.status(400).json({ message: 'Modification du champ _id non autorisée' });
			}

			// Validation des champs à mettre à jour
			if (updates.annee && (typeof updates.annee !== 'number' || updates.annee < 1800)) {
				Logger.warn("L'année doit être un nombre supérieur ou égal à 1800");
				return res
					.status(400)
					.json({ message: "L'année doit être un nombre supérieur ou égal à 1800" });
			}

			if (
				updates.note &&
				(typeof updates.note !== 'number' || updates.note < 0 || updates.note > 5)
			) {
				Logger.warn('La note doit être un nombre entre 0 et 5');
				return res.status(400).json({ message: 'La note doit être un nombre entre 0 et 5' });
			}

			if (updates.genres && !Array.isArray(updates.genres)) {
				Logger.warn('Genres doit être un tableau');
				return res.status(400).json({ message: 'Genres doit être un tableau' });
			}

			// Mise à jour du livre
			const result = await books.findOneAndUpdate(
				{ _id: ObjectId.createFromHexString(id) },
				{ $set: updates },
				{ returnDocument: 'after' }
			);

			console.log(result);

			if (!result) {
				Logger.warn(`Livre non trouvé avec l'ID: ${id}`);
				return res.status(404).json({ message: 'Livre non trouvé' });
			}

			Logger.info('Livre mis à jour avec succès');
			res.status(200).json({ message: 'Livre mis à jour avec succès', updatedBook: result.value });
		} catch (error) {
			Logger.error(`Error updating book - ${error}`);
			res.status(500).json({ message: 'Error updating book', error });
		}
	},

	/** ## Supprime un livre par son ID.
	 * @async
	 * @function deletebook
	 * @param {Object} req - L'objet de requête HTTP contenant l'ID de le livre dans les paramètres.
	 * @param {Object} res - L'objet de réponse HTTP.
	 * @returns {Promise<void>} Renvoie une réponse JSON confirmant la suppression ou une erreur.
	 */
	deleteBook: async (req, res) => {
		Logger.info(`Suppression de le livre avec l'ID: ${req.params.id}`);
		try {
			const result = await books.deleteOne({
				_id: ObjectId.createFromHexString(req.params.id),
			});
			if (result.deletedCount === 0) {
				Logger.warn(`livre non trouvé avec l\'ID: ${req.params.id}`);
				return res.status(404).json({ message: 'book not found' });
			}
			res.status(200).json({ message: 'book deleted successfully' });
		} catch (error) {
			Logger.error(`Error deleting book - ${error}`);
			res.status(500).json(`Error deleting book`, error);
		}
	},
};

export default BookController;
