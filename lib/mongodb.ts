// lib/mongodb.ts
import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://Susnata_Maiti:Shadow246642@cluster-vikas.qzy0wbn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-Vikas";

let clientPromise: Promise<MongoClient>;

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (!globalWithMongo._mongoClientPromise) {
  const client = new MongoClient(uri);
  globalWithMongo._mongoClientPromise = client.connect();
}

clientPromise = globalWithMongo._mongoClientPromise;

export default clientPromise;
