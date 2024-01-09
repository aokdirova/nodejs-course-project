const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(process.env.MONGO_DB_URL)
    .then((client) => {
      console.log("Connected to MongoDB");
      _db = client.db();
      callback(client);
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found";
};

// const Sequelize = require("sequelize");

// const sequelize = new Sequelize(
//   "node-complete",
//   "root",
//   process.env.MYSQL_PASSWORD,
//   {
//     dialect: "mysql",
//     host: "localhost",
//   }
// );

// module.exports = sequelize;

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
