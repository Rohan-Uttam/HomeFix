// backend/scripts/backupDB.js
import { exec } from "child_process";
import dotenv from "dotenv";
dotenv.config();

const dbName = process.env.MONGO_URI.split("/").pop().split("?")[0];
const backupDir = "./backups";

exec(`mongodump --uri="${process.env.MONGO_URI}" --out=${backupDir}`, (err, stdout, stderr) => {
  if (err) {
    console.error(" Backup failed:", err.message);
    return;
  }
  console.log(" Database backup completed:", backupDir);
});
