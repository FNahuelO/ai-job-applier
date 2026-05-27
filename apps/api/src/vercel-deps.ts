/**
 * Requires explícitos para que el bundler de Vercel incluya dependencias
 * que Sequelize carga con require() dinámico.
 */
require('pg');
require('pg-hstore');
require('bcrypt');
