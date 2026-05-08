# JDCOEM Student Portal — Setup & Deployment
This directory contains tools and documentation for setting up the portal on a new server.

## Folder Contents
- `README.md`: This file.
- `database_schema.sql`: Full database structure (Coming soon).
- `permissions_fix.php`: Script to check and fix storage permissions.

## Quick Start
1.  Copy all files to your web root.
2.  Import the database schema into PostgreSQL.
3.  Update the `.env` file with your credentials.
4.  Ensure the `public/` folder is set as the document root in Apache/Nginx.
