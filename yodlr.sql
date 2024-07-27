\echo 'Delete and recreate yodlr db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS yodlr;
CREATE DATABASE yodlr;
\connect yodlr

\i yodlr-schema.sql
\i yodlr-seed.sql

\echo 'Delete and recreate yodlrtest db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS yodlr_test;
CREATE DATABASE yodlr_test;
\connect yodlr_test

\i yodlr-schema.sql
