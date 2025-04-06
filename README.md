# Endpoints obligatoires
## GET /livres
- [x] Récupérer tous les livres
- [x] Permettre les filtres :
  - [x] par auteur (?auteur=Khalil)
  - [x] par disponibilité (?disponible=true)
  - [x] par genre (?genre=Philosophie)
  - [x] par note minimum (?minNote=4)
- [x] Support du tri par note ou année (?tri=note, ?ordre=desc)

## POST /livres
- [x] Ajouter un nouveau livre
- [x] Valider que :
  - [x] titre, auteur sont obligatoires
  - [x] annee est un nombre ≥ 1800
  - [x] note est entre 0 et 5
  - [x] genres est un tableau

## PUT /livres/:id
- [x] Modifier un livre
- [x] Ne pas autoriser la modification du champ _id

## DELETE /livres/:id
- [x] Supprimer un livre par son identifiant

## GET /livres/:id
- [x] Récupérer un livre précis par son _id