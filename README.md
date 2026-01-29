# 🚗 CarLocation
### Plateforme Web de Location de Voitures – Full Stack
**CarLocation** est une application web complète dédiée à la gestion de location de voitures.
Elle permet aux utilisateurs de consulter les véhicules disponibles, de créer un compte et d’effectuer des demandes de réservation via une interface moderne, sécurisée et responsive.

## 🎯 Objectifs du Projet
- Centraliser la gestion des véhicules de location
- Offrir une API REST sécurisée et évolutive
- Appliquer une architecture logicielle claire et maintenable
- Proposer une expérience utilisateur fluide côté client

## 🛠️ Technologies Utilisées

### 🔹 Backend – Spring Boot
- **Java 21**
- **Spring Boot 3**
- **Spring Data JPA** – Persistance des données
- **Spring Security** – Sécurisation de l’API et gestion des rôles
- **PostgreSQL** – Base de données relationnelle
- **Lombok** – Réduction du code boilerplate
- **Spring Validation** – Validation des données (DTO)
- **MapStruct / Mappers personnalisés** – Conversion Entités ↔ DTO

### 🔹 Frontend – Angular
- **Angular 21**
- **TypeScript** – Typage fort et modélisation des données
- **RxJS** – Gestion des flux asynchrones
- **HttpClient** – Communication avec l’API REST
- **Bootstrap / CSS** – Interface responsive et moderne

- **Configuration** : CORS, sécurité et autorisations  
- **Entities & DTOs** : Modélisation des données  
- **Repositories** : Accès PostgreSQL via JPA  
- **Services** : Logique métier et injection de dépendances  
- **Controllers** : Exposition des endpoints REST  
- **Exception Handler** : Gestion centralisée des erreurs  

---
### 🌐 Frontend – Architecture Angular
- **Models** : Interfaces TypeScript
- **Services** : Appels API Spring Boot
- **Components** : UI modulaire et réutilisable

🧪 Tests API – Postman
Endpoints testés :
POST /api/cars/add → Ajouter un véhicule
POST /api/cars/bulk → Importation massive
GET /api/cars → Liste des voitures

