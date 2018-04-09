const config = { db: null, port: null };

if (process.env.NODE_ENV === 'test') {
  config.db = process.env.DB_URL_TEST;
  config.port = process.env.PORT_TEST;
} else if (process.env.NODE_ENV === 'development') {
  config.db = process.env.DB_URL_DEV;
  config.port = process.env.PORT_DEV;
} else {
  config.db = process.env.DB_URL;
  config.port = process.env.PORT;
}

module.exports = config;
