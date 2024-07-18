

import mongodb from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const MongoClient = mongodb.MongoClient;

let _db;


const mongoConnect = callback => {
    MongoClient.connect(process.env.MONGODB_URI)
        .then(client => {
            console.log('Connected!');
            _db = client.db();
            callback(client);
        })
        .catch(err => {
            console.log(err);
            throw err;
        })
};


const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database found!';
}

export { mongoConnect, getDb };