# 💪 Ironpump API

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

> **Status do Projeto:** 🚧 Em Desenvolvimento

O **Ironpump** é uma API RESTful desenvolvida para gerenciamento e rastreamento de treinos de musculação. O objetivo é permitir que usuários registrem seus exercícios, cargas, séries e acompanhem sua evolução física ao longo do tempo.

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** Java 24
* **Framework:** Spring Boot 4.0.0
* **Banco de Dados:** PostgreSQL 15
* **Containerização:** Docker & Docker Compose
* **ORM:** Hibernate / Spring Data JPA
* **Gerenciamento de Dependências:** Maven

---

## ⚙️ Arquitetura e Estrutura

O projeto segue a arquitetura em camadas do Spring Boot:

* **Model:** Entidades do banco de dados (`Usuario`, `Exercicio`, `TreinoLog`).
* **Repository:** Interface de comunicação com o banco de dados.
* **Service:** (Em breve) Regras de negócio.
* **Controller:** (Em breve) Pontos de extremidade da API (Endpoints).

### 🗄️ Modelagem de Dados

* **Usuario:** Credenciais e dados do perfil.
* **Exercicio:** Biblioteca de exercícios (ex: Supino, Agachamento) e grupos musculares.
* **TreinoLog:** Histórico de execução (Carga, Repetições, Séries, Data).

---

## 🚀 Como executar o projeto

### Pré-requisitos
* Java JDK 24 instalado.
* Docker e Docker Compose instalados.
* Maven instalado.

### 1. Clonar o repositório
```bash
git clone [https://github.com/CauePrad0/ironpump.git](https://github.com/CauePrad0/ironpump.git)
cd ironpump
