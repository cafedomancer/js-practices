import sqlite3 from "sqlite3";
import { setTimeout } from "timers/promises";

/* 関数の定義 */
function run(db, sql) {
  return new Promise((resolve, reject) => {
    db.run(sql, function (err) {
      if (!err) {
        resolve(this);
      } else {
        reject(err);
      }
    });
  });
}

function all(db, sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (!err) {
        resolve(rows);
      } else {
        reject(err);
      }
    });
  });
}

function close(db) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (!err) {
        resolve();
      } else {
        reject(err);
      }
    });
  });
}

/* 変数の定義 */
let db;

/* 1. コールバック (エラーなし) */
db = new sqlite3.Database(":memory:");

db.run(
  "CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE)",
  () => {
    db.run(
      "INSERT INTO books (title) VALUES ('The Hitchhiker''s Guide to the Galaxy')",
      function () {
        console.log(this.lastID);
        db.all("SELECT title FROM books", (_, rows) => {
          console.log(rows);
          db.run("DROP TABLE books", () => {
            db.close();
          });
        });
      }
    );
  }
);

await setTimeout(10);

/* 1. コールバック (エラーあり) */
db = new sqlite3.Database(":memory:");

db.run(
  "CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE)",
  () => {
    db.run("INSERT INTO books (title) VALUES (NULL)", function (err) {
      console.error(err.message);
      db.all("SELECT author FROM books", (err) => {
        console.error(err.message);
        db.run("DROP TABLE books", () => {
          db.close();
        });
      });
    });
  }
);

await setTimeout(10);

/* 2. Promise (エラーなし) */
db = new sqlite3.Database(":memory:");

run(
  db,
  "CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE)"
)
  .then(() => {
    return run(
      db,
      "INSERT INTO books (title) VALUES ('The Hitchhiker''s Guide to the Galaxy')"
    );
  })
  .then((that) => {
    console.log(that.lastID);
    return all(db, "SELECT title FROM books");
  })
  .then((rows) => {
    console.log(rows);
    return run(db, "DROP TABLE books");
  })
  .then(() => {
    return close(db);
  });

await setTimeout(10);

/* 2. Promise (エラーあり)*/
db = new sqlite3.Database(":memory:");

run(
  db,
  "CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE)"
)
  .then(() => {
    return run(db, "INSERT INTO books (title) VALUES (NULL)");
  })
  .catch((err) => {
    console.error(err.message);
    return all(db, "SELECT author FROM books");
  })
  .catch((err) => {
    console.error(err.message);
    return run(db, "DROP TABLE books");
  })
  .then(() => {
    return close(db);
  });

await setTimeout(10);

/* 3. async, await (エラーなし) */
db = new sqlite3.Database(":memory:");

await run(
  db,
  "CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE)"
);
const that = await run(
  db,
  "INSERT INTO books (title) VALUES ('The Hitchhiker''s Guide to the Galaxy')"
);
console.log(that.lastID);
const rows = await all(db, "SELECT title FROM books");
console.log(rows);
await run(db, "DROP TABLE books");
await close(db);

await setTimeout(10);

/* 3. async, await (エラーあり) */
db = new sqlite3.Database(":memory:");

await run(
  db,
  "CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE)"
);
try {
  await run(db, "INSERT INTO books (title) VALUES (NULL)");
} catch (err) {
  if (err instanceof Error) {
    console.log(err.message);
  } else {
    throw err;
  }
}
try {
  await all(db, "SELECT author FROM books");
} catch (err) {
  if (err instanceof Error) {
    console.log(err.message);
  } else {
    throw err;
  }
}
await run(db, "DROP TABLE books");
await close(db);

await setTimeout(10);
