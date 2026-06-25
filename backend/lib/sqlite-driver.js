// A small drop-in shim that gives the small slice of the better-sqlite3 API
// that db.js/server.js relies on (prepare/get/all/run/exec/pragma/transaction),
// backed by Node's own built-in `node:sqlite` instead of a native addon.
//
// Why: better-sqlite3 ships as a native addon and needs to either download a
// prebuilt binary for your exact OS/CPU/Node version or compile one locally
// with Python + a C++ toolchain. That step silently fails on a lot of
// machines (missing build tools, an unusual Node version, certain Windows/
// Apple Silicon/Linux setups) — `npm install` exits 0 looking fine in some
// setups, or the require() blows up at server start in others, and the
// frontend just sees every API call fail with no obvious cause.
//
// node:sqlite has shipped in Node since v22.5.0 (no install step, no
// compiler) and exposes practically the same prepared-statement shape, so
// swapping it in here removes that whole failure class without touching any
// of the SQL or route code in db.js/server.js.
let DatabaseSync;
try {
  ({ DatabaseSync } = require("node:sqlite"));
} catch (e) {
  console.error(
    "\n[FoundrAI] This Node.js version doesn't include the built-in SQLite module (node:sqlite).\n" +
    "node:sqlite ships in Node.js v22.5.0+. Please upgrade Node (https://nodejs.org) and try again.\n" +
    `Current Node version: ${process.version}\n`
  );
  process.exit(1);
}

class Statement {
  constructor(stmt) {
    this._stmt = stmt;
  }
  get(...params) {
    return this._stmt.get(...params);
  }
  all(...params) {
    return this._stmt.all(...params);
  }
  run(...params) {
    const info = this._stmt.run(...params);
    return { lastInsertRowid: info.lastInsertRowid, changes: info.changes };
  }
}

class Database {
  constructor(path) {
    this._db = new DatabaseSync(path);
  }
  exec(sql) {
    return this._db.exec(sql);
  }
  prepare(sql) {
    return new Statement(this._db.prepare(sql));
  }
  // better-sqlite3 uses db.pragma("journal_mode = WAL") for write-ahead
  // logging. node:sqlite enables WAL by default, so this is a safe no-op.
  pragma(_str) {
    return [];
  }
  transaction(fn) {
    const db = this;
    return function (items) {
      db._db.exec("BEGIN");
      try {
        const result = fn(items);
        db._db.exec("COMMIT");
        return result;
      } catch (e) {
        db._db.exec("ROLLBACK");
        throw e;
      }
    };
  }
  close() {
    this._db.close();
  }
}

module.exports = Database;
