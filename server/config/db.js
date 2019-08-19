/* eslint-disable no-console */
import mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose';

process.env.NODE_ENV = 'test';

//const DB_URI = 'mongodb://localhost:27017/tipTopTutr';
const DB_URI = '`mongodb://nodeTut:${process.env.MONGO_PASS}@meetupme-shard-00-00-5nald.mongodb.net:27017,meetupme-shard-00-01-5nald.mongodb.net:27017,meetupme-shard-00-02-5nald.mongodb.net:27017/test?ssl=true&replicaSet=meetupME-shard-0&authSource=admin&retryWrites=true`';

const createConnect = async () => {
  mongoose.Promise = global.Promise;
  const options = {
    useNewUrlParser: true,
  };
  if (process.env.NODE_ENV === 'test') {
    try {
      const mockgoose = new Mockgoose(mongoose);
      await mockgoose.prepareStorage()
        .then(() => {
          mongoose.connect(DB_URI, options);
        });
    } catch (err) {
      console.log('err', err);
    }
  } else {
    mongoose.connect(DB_URI, options);
  }
    
  mongoose.connection
    .once('open', () => console.log('MongoDb running'))
    .on('error', err => console.log(err));
  mongoose.set('debug', true);
};

const close = () => mongoose.disconnect();

module.exports = { createConnect, close };
