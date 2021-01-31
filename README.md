# TP1DBS
## Utilisation
Création d'un utilisateur
POST localhost:4000/signup 
Passer dans le body account et password

Authentification d'un utilisateur
POST localhost:4000/signin 
Passer dans le body account, password.

Renvoie un token à conserver.

Accès à la donnée
GET localhost:4000/read_data
Passer en Bearer le token d'authentification précédemment récupéré. Ce token donne accès à 10 requêtes sur une période de 10 min.
