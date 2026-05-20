# 🌍 GeoIA - Self-Hosted Intelligent RAG System

**GeoIA** est une plateforme d'intelligence artificielle auto-hébergée conçue pour l'ingestion, l'analyse et l'interrogation intelligente de documents complexes. Ce projet a été développé dans le cadre d'un Projet de Fin d'Études (PFE) pour démontrer la puissance des outils Open Source dans la création de systèmes RAG (Retrieval-Augmented Generation) souverains.

---
## noter bien le fichier Projetn8nworkflow.json contient les workflows 

## 🚀 Vue d'ensemble de l'Architecture

GeoIA orchestre plusieurs services de pointe via Docker pour offrir une solution complète :

- **n8n** : Cerveau de l'orchestration (Workflows et Agents IA).
- **Ollama** : Moteur d'exécution local pour les modèles de langage (LLM).
- **Qdrant** : Base de données vectorielle pour la recherche sémantique.
- **Docling** : Service haute performance pour le parsing et l'extraction de documents (PDF, Docx, etc.).
- **PostgreSQL** : Stockage persistant des données et des workflows.
- **Adminer** : Interface web pour la gestion de la base de données.

---

## 🛠️ Installation et Démarrage

### Prérequis
- Docker Desktop installé et fonctionnel.
- GPU Nvidia (recommandé) ou processeur performant.

### Lancement rapide
1.  **Configurer l'environnement** :
    Copiez le fichier d'exemple et personnalisez vos secrets :
    ```powershell
    cp .env.example .env
    ```
2.  **Démarrer les services** :
    Utilisez le profil adapté à votre matériel :
    
    *Pour GPU Nvidia :*
    ```powershell
    docker compose --profile gpu-nvidia up -d
    ```
    *Pour CPU uniquement :*
    ```powershell
    docker compose pull
    docker compose --profile cpu up -d
    ```

---

## 📁 Structure du Projet

- `/n8n` : Contient les workflows pré-configurés et les identifiants de démo.
- `/shared` : Dossier partagé pour l'ingestion des fichiers RAG et les exports de Docling.
- `pfeproject.json` : Sauvegarde principale du workflow GeoIA.

---

## 💡 Fonctionnalités Clés

- **Ingestion Automatisée** : Traitement par lots de documents via Docling.
- **Mémoire Vectorielle** : Recherche ultra-rapide dans les documents grâce à Qdrant.
- **IA Conversationnelle** : Chatbot intelligent capable de citer ses sources.
- **Souveraineté des Données** : 100% local, aucune donnée n'est envoyée vers le cloud.

---

## 🎓 Cadre du Projet (PFE)
Ce projet illustre l'implémentation d'une chaîne de traitement IA moderne, allant de l'ingestion de données non structurées à la génération de réponses augmentées.

**GeoIA - Intelligence Artificielle Géolocalisée & Documentaire.**
