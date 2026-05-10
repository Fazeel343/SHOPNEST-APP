# Project Report

# SHOPNEST - E-commerce Platform

```text
SHOPNEST
├── backend
│   ├── config
│   │   └── db.js
│   ├── middleware
│   │   └── auth.js
```

## Course
CS-3001 Database Management Systems (Spring-2026)

## Group Members
- Fazeel Muhammad (24K-1020)
- Adeel Rehman (24K-0910)

## Project Type
DBMS Semester Project

## Deliverable
Functional Web App & SQL Database Scripts

---

# 1. Introduction

ShopNest is a comprehensive e-commerce platform developed to demonstrate the practical application of database design principles. The system facilitates a complete shopping lifecycle, from product discovery to order fulfillment, powered by a structured SQL backend.

# 2. System Architecture

The system follows a modular architecture where the backend interacts with the SQL database via an abstraction layer, ensuring that business logic is decoupled from data storage.

# 3. File Structure Overview

The following directory structure represents the implemented ShopNest project:

```text
│   ├── routes
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   ├── products.js
│   │   └── reviews.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend
│   ├── css
│   │   └── style.css
│   ├── js
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── cart.js
│   │   └── products.js
│   ├── admin.html
│   ├── cart.html
│   ├── checkout.html
│   ├── index.html
│   ├── login.html
│   ├── orders.html
│   ├── product.html
│   └── register.html
└── sql
    ├── 01_tables.sql
    ├── 02_triggers.sql
    ├── 03_procedures.sql
    ├── 04_views_indexes.sql
    └── 05_sample_data.sql
```

# 4. Database Design & Modules

| Module / File | Description | DBMS Concepts Applied |
|---|---|---|
| `01_tables.sql` | Schema definition for Users, Products, Orders | DDL, Primary/Foreign Keys |
| `02_triggers.sql` | Automatic stock reduction on order placement | Database Triggers, Automation |
| `03_procedures.sql` | Complex transaction handling for checkouts | Stored Procedures, ACID |
| `04_views_indexes.sql` | High-performance queries and virtual tables | Indexing, Data Abstraction |
| `db.js` | Connection pooling and query execution | Database Connectivity |

# 5. Implementation Details

## 5.1 Data Integrity

Strict constraints were applied to ensure that no order can be placed for out-of-stock items and that every review is linked to a valid user and product.

## 5.2 Transaction Management

Stored procedures were used to handle the checkout process, ensuring that the creation of an order and the update of inventory occur as a single atomic unit.

# 6. Conclusion

The ShopNest project successfully demonstrates how a relational database can efficiently power a dynamic web application. Through normalization, indexing, and server-side logic, the platform provides a scalable and reliable user experience.
