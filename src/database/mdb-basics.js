require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

module.exports = {
  createConnection: (createConnection = async () => {
    try {
      const client = new MongoClient(process.env.MONGODB_URI, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });
      await client.connect();

      await client.db().admin().command({ ping: 1 });
      console.log("Connected to MongoDB!\n");

      return client;
    } catch (e) {
      console.log(e);
    }
  }),

  closeConnection: (closeConnection = async (client) => {
    await client.close();
    console.log("Connection closed");
  }),

  getDB: (getDB = async (client, db_name) => {
    const databases = await client.db().admin().listDatabases();

    const databaseExists = databases.databases.some(
      (db) => db.name === db_name
    );

    if (databaseExists) return client.db(db_name);
    else console.log(`The database '${db_name}' does not exists.`);
  }),

  addCollection: (addCollection = async (db, collection_name) => {
    try {
      await db.createCollection(collection_name);
      console.log("Collection created successfully.");
    } catch (err) {
      console.error(err);
    }
  }),

  listAllCollections: (listAllCollections = async (db) => {
    try {
      const collections = [];
      const cursor = db.listCollections();

      await cursor.forEach((collection) => {
        collections.push(collection.name);
      });

      return collections;
    } catch (err) {
      console.error(err);
    }
  }),

  insertData: (insertData = async (db, cl, data) => {
    try {
      const collection = db.collection(cl);

      data.timestamp = new Date();

      const result = Array.isArray(data)
        ? await collection.insertMany(data)
        : await collection.insertOne(data);

      const insertedData = Array.isArray(data)
        ? result.insertedIds.map((e) => String(e))
        : String(result.insertedId);

      console.log("Data inserted successfully:", insertedData);
      return insertedData;
    } catch (err) {
      if (err.code === 11000) {
        console.error("Unique key constraint violation:", err.message);
      } else {
        console.error("Error occurred while inserting data:", err);
      }
    }
  }),

  updateData: async (db, cl, objectId, data) => {
    try {
      const collection = db.collection(cl);

      data.timestamp = new Date();

      const filter = { _id: new ObjectId(objectId) };
      const update = { $set: data };

      const result = await collection.updateOne(filter, update);

      console.log(`${result.modifiedCount} document(s) updated.`);
    } catch (error) {
      console.error("Error updating document:", error);
    }
  },

  countObjectInCollection: (countObjectInCollection = async (db, cl) => {
    const collection = db.collection(cl);

    const count = await collection.countDocuments({});

    if (count === 0) {
      console.log(`The collection ${cl} is empty.`);
    }

    return count;
  }),

  getDocumentById: async (db, cl, id) => {
    try {
      const collection = db.collection(cl);

      const query = { _id: new ObjectId(id) };
      const document = await collection.findOne(query);

      if (document) {
        console.log("Found document:", document);
        return document;
      } else {
        console.log("Document not found");
      }
    } catch (err) {
      console.log("Error occured while extracting record:", err);
    }
  },

  listRecordForAttribute: async (db, cl, { filters, fields, limit }) => {
    const objectsCount = await countObjectInCollection(db, cl);
    if (objectsCount === 0) return null;

    try {
      const formattedFields = {};
      const formattedFilters = [];

      /*
       * initializing the collection
       */
      const collection = db.collection(cl);

      if (filters) {
        if (!Array.isArray(filters)) filters = [filters];

        filters.forEach((filter) => {
          if (filter.hasOwnProperty("_id")) {
            formattedFilters.push({
              [Object.keys(filter)[0]]: new ObjectId(Object.values(filter)[0]),
            });
          } else if (filter.hasOwnProperty("operator")) {
            formattedFilters.push({
              [Object.keys(filter)[0]]: {
                [filter.operator]: Object.values(filter)[0],
              },
            });
          } else {
            formattedFilters.push(filter);
          }
        });
      }

      /*
       * example of fields retrieving
       *
       * { name: 1, email: 1, _id: 0 }
       *
       * 1 means include
       * 0 means exclude
       */

      if (fields) {
        if (!Array.isArray(fields)) fields = [fields];

        /*
         * not a fancy way to get all the fields in a collection but it works
         */
        const collection_fields = await collection
          .aggregate([
            { $project: { fields: { $objectToArray: "$$ROOT" } } },
            { $unwind: "$fields" },
            { $group: { _id: null, fields: { $addToSet: "$fields.k" } } },
            { $project: { _id: 0, fields: 1 } },
          ])
          .next();

        fields.forEach((field) => {
          /*
           * checking if field passed exists in the required collection
           */
          const check_field_existance = collection_fields.fields.find(
            (present_field) => present_field === field
          );
          /*
           * adding the existing fields to the formattedFields object
           */
          if (check_field_existance) {
            formattedFields[field] = 1;
          } else {
            console.log(
              `The field ${field} is not present in the querying collection.`
            );
          }
        });
      }

      /*
       * if filters parameter is provided, passing it to the query
       * if it's not, passing an empty curly braces
       */
      const query = filters ? { $and: formattedFilters } : {};

      const document = await collection
        .find(query, { projection: fields ? fields : {} })
        .limit(limit ? limit : 0)
        .toArray();

      return document;
    } catch (e) {
      console.log(e);
    }
  },
};
