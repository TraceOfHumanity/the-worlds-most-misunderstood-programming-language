// Dependency Inversion Principle
interface Database {
  save(data: any): void;
}

class MySQLDatabase implements Database {
  save(data: any): void {
    console.log("Saving data to MySQL");
  }
}

class MongoDBDatabase implements Database {
  save(data: any): void {
    console.log("Saving data to MongoDB");
  }
}


class UserService {
  constructor(private database: Database) {}

  saveUser(user: any): void {
    this.database.save(user);
  }
}

const mysqlDatabase: MySQLDatabase = new MySQLDatabase();
const mongoDBDatabase: MongoDBDatabase = new MongoDBDatabase();

const userService: UserService = new UserService(mysqlDatabase);
userService.saveUser({ name: "John", email: "john@example.com" });

const userService2: UserService = new UserService(mongoDBDatabase);
userService2.saveUser({ name: "John", email: "john@example.com" });





