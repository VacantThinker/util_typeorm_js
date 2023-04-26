

## how to use ?

#### sample: dir
```text
xxxx-project/
  server/
    db/
      entity/
        book.entity.js
      
      datasource.js         <== generate by xxx.js geneTypeormAll()
      util.datasource.js    <== generate by xxx.js geneTypeormAll()
      util.typeorm.js       <== generate by xxx.js geneTypeormAll()
  
  xxx.js  <== (node xxx.js)
```

#### book.entity.js
```javascript
module.exports = {
  name: 'book',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    bookName: {
      type: 'varchar', default: '',
    },
    author: {
      type: 'varchar', default: '',
    },
    publishYear: {
      type: 'int', default: 0,
    },
    pageNumber: {
      type: 'int', default: 0,
    },
  },
};
```

#### xxx.js
```javascript
// use default path
const {geneTypeormAll} = require('@vacantthinker/util_typeorm_js');
// pathDirEntity => default: yourproject/server/db/entity/
// pathDirGeneFile => default: yourproject/server/db/
// databaseName => default: {dirName: getRootDirName(), dbname: 'db.sqlite'}
geneTypeormAll();
```

```javascript
// use custom path
const path = require('path');
const {geneTypeormAll} = require('@vacantthinker/util_typeorm_js');

let pathDirEntity = path.join(__dirname, 'entity');
let pathDirGeneFile = path.join(__dirname, 'server', 'db');
geneTypeormAll(pathDirEntity, pathDirGeneFile, 
    {
      dirName: 'abc',
      dbname: 'def.sqlite',
    },
);
```

#### generate util.typeorm.js datasource.js util.datasource.js
```shell
node xxx.js
```

#### util.typeorm.js

```javascript
'use strict';
      
const {dataSource} = require('./datasource.js');

const table = {
  
  // book.entity.js
  // **************************************************************************
  /**
   * book repo
   * @returns {Promise<Repository>}
   */
  bookRepo: async () => {
    return await dataSource.getRepository('book');
  },
  /**
   * bookNew1 => insert bookNew1
   *
   * [bookNew1, bookNew2, ...] => insert bookNew1, bookNew2, ...
   * @param entityObj {[{bookName?: string, author?: string, publishYear?: number, pageNumber?: number, id?: number, }]|{bookName?: string, author?: string, publishYear?: number, pageNumber?: number, id?: number, }}
   * @returns {Promise<InsertResult>}
   */
  bookInsert: async (bookNew) => {
    return await dataSource.getRepository('book').insert(bookNew);
  },
  /**
   * {id: 1} => delete id=1
   *
   * {author: 'mary'} => delete all author='mary'
   * @param options {Object:{bookName?: string, author?: string, publishYear?: number, pageNumber?: number, id?: number, }}
   * @returns {Promise<DeleteResult>}
   */
  bookDelete: async (options) => {
    return await dataSource.getRepository('book').delete(options);
  },
  /**
   * (bookNew, {id: 1}) // update bookNew where id=1
   *
   * (bookNew) => update all
   * @param bookNew {{bookName?: string, author?: string, publishYear?: number, pageNumber?: number, id?: number, }}
   * @param options {{}|{bookName?: string, author?: string, publishYear?: number, pageNumber?: number, id?: number, }}
   * @returns {Promise<UpdateResult>}
   */
  bookUpdate: async (bookNew, options = {}) => {
    return await dataSource.getRepository('book').update(options, bookNew);
  },
  /**
   * {select: {bookName: true}, where: {id: 1}}
   * 
   * [typeorm/docs/find-options.md](https://github.com/typeorm/typeorm/blob/master/docs/find-options.md#find-options)
   * @param options {{select?: {bookName?: boolean, author?: boolean, publishYear?: boolean, pageNumber?: boolean, id?: boolean, }, where?: {bookName?: string, author?: string, publishYear?: number, pageNumber?: number, id?: number, }}}
   * @returns {Promise<null|{id?: number, bookName: string, author: string, publishYear: number, pageNumber: number, }>}
   */
  bookFindOne: async (options) => {
    let ret = await dataSource.getRepository('book').findOne(options);
    return ret ? ret : null;
  },
  /**
   * bookFind() => find all
   * 
   * bookFind({select: {bookName: true}})
   * 
   * bookFind({select: {bookName: true, xxxx: true}, where: {author: Like('%mary%')}})
   * 
   * [typeorm/docs/find-options.md](https://github.com/typeorm/typeorm/blob/master/docs/find-options.md#find-options)
   * @param options {null|{select?: {bookName?: boolean, author?: boolean, publishYear?: boolean, pageNumber?: boolean, id?: boolean, }, where?: {bookName?: string, author?: string, publishYear?: number, pageNumber?: number, id?: number, }}}
   * @returns {Promise<[{id?: number, bookName: string, author: string, publishYear: number, pageNumber: number, }]>}
   */
  bookFind: async (options = null) => {
    return options
      ? await dataSource.getRepository('book').find(options)
      : await dataSource.getRepository('book').find();
  },
  /**
  * @param options {null|{bookName?: string, author?: string, publishYear?: number, pageNumber?: number, id?: number, }} { author: "mary" }
  * @return {Promise<number>}
  */
  bookCount: async (options = null) => {
    return await dataSource.getRepository('book').countBy(options)
  },
  /**
  * 
  * @param columnName {string} "pageNumber"
  * @param options {null|{bookName?: string, author?: string, publishYear?: number, pageNumber?: number, id?: number, }} { author: "mary" }
  * @return {Promise<number>}
  */
  bookSum: async (columnName, options = null) => {
    return await dataSource.getRepository('book').sum(columnName, options)
  },
  /**
  * 
  * @param columnName {string} "pageNumber"
  * @param options {null|{bookName?: string, author?: string, publishYear?: number, pageNumber?: number, id?: number, }} { author: "mary" }
  * @return {Promise<number>}
  */
  bookAverage: async (columnName, options = null) => {
    return await dataSource.getRepository('book').average(columnName, options)
  },
  /**
  * 
  * @param columnName {string} "publishYear"
  * @param options {null|{bookName?: string, author?: string, publishYear?: number, pageNumber?: number, id?: number, }} null or  { author: "mary" }
  * @returns {Promise<{val:number, entity: {id?: number, bookName: string, author: string, publishYear: number, pageNumber: number, }}>} val => min value, entity => has the min value
  */
  bookMinimum: async (columnName, options = null) => {
    let key_ = columnName
    let val = await dataSource.getRepository('book').minimum(columnName, options)
    let findOption = {}
    findOption[key_] = val
    let entity = await dataSource.getRepository('book').findOneBy(findOption)
    return {val, entity}
  },
  /**
  * 
  * @param columnName {string} "publishYear"
  * @param options {null|{bookName?: string, author?: string, publishYear?: number, pageNumber?: number, id?: number, }} null or {author: "mary"}
  * @returns {Promise<{val:number, entity: {id?: number, bookName: string, author: string, publishYear: number, pageNumber: number, }}>} val => max value, entity => has the min value
  */
  bookMaximum: async (columnName, options = null) => {
    let key_ = columnName
    let val = await dataSource.getRepository('book').maximum(columnName, options)
    let findOption = {}
    findOption[key_] = val
    let entity = await dataSource.getRepository('book').findOneBy(findOption)
    return {val, entity}
  },
  

}

module.exports = {
  table: table
}

```

#### in app.js (express)
```javascript
const express = require('express');
const {table} = require('./util.typeorm');
const {dbInitValue} = require('./datasource');
const {Like} = require('typeorm');
const app = express();

// {
//   "result": "ok",
//   "data": {
//     "val": 1993,
//     "entity": {
//       "id": 2,
//       "bookName": "The Wonderful Wizard of Oz",
//       "author": "L. Frank Baum",
//       "publishYear": 1993,
//       "pageNumber": 0
//     }
//   }
// }
app.get('/max', async (req, res) => {

  let obj = await table.bookMaximum(
    'publishYear',
  );
  // let obj = null;
  console.log(`meslog number=\n`, obj);
  res.status(200).send({result: 'ok', data: obj});
});

// [
//   {
//     "bookName": "TO KILL A MOCKINGBIRD",
//     "author": "Harper Lee",
//     "publishYear": 1960
//   },
//   {
//     "bookName": "The Wonderful Wizard of Oz",
//     "author": "L. Frank Baum",
//     "publishYear": 1993
//   }
// ]
app.get('/findAll', async (req, res) => {
  let arr = await table.bookFind({
    select: {
      bookName: true, author: true, publishYear: true,
    },
  });
  // let arr = null
  console.log(`meslog arr=\n`, arr);

  res.status(200).send(arr);

});

//init data of database
dbInitValue(async () => {
  await table.bookInsert([
    {
      bookName: 'TO KILL A MOCKINGBIRD',
      author: 'Harper Lee',
      publishYear: 1960,
    },
    {
      bookName: 'The Wonderful Wizard of Oz',
      author: 'L. Frank Baum',
      publishYear: 1993,
    },
  ]);
});


//*******************************************************

let port = 3000;
let urlLocalhost = `http://localhost:${port}`;
app.listen(port, async () => {
  console.log(`app running ${urlLocalhost}`);

});
```

#### datasource.js
```javascript
'use strict';
      
const {DataSource} = require('typeorm');
const {
  getEntitySchemaList, 
  getPathDatabase,
} = require('./util.datasource.js');

const dataSource = new DataSource({
  type: 'better-sqlite3',
  database: getPathDatabase(),
  synchronize: true,
  logging: false,
  entities: getEntitySchemaList(),
});

dataSource.initialize().then(() => {
  console.log('datasource init');
}).catch((err) => {
  console.log('datasource err');
  console.log(err);
});

module.exports = {
  dataSource: dataSource,
  dbInitValue: (callback) => {
    dataSource.initialize().then(async (connection) => {
      callback(connection);
    })
  }
};

```

#### util.datasource.js
```javascript
'use strict';

function getEntitySchemaList() {
  const {EntitySchema} = require('typeorm');
  const entities = [];

  const bookObj = require('./entity/book.entity.js');
  const bookEntitySchema = new EntitySchema(Object.create(bookObj));
  entities.push(bookEntitySchema);
  

  return entities;
}


function getPathDatabase() {
  const path = require('path');
  let appDataPath = 
    process.env.APPDATA 
    || 
    (process.platform === 'darwin' 
      ? process.env.HOME + '/Library/Preferences' 
      : process.env.HOME + "/.local/share");
  
  return path.join(appDataPath, "test", "db.sqlite");
}


module.exports = {
  getEntitySchemaList: getEntitySchemaList,
  getPathDatabase: getPathDatabase,
};

```


---

## how to install ?
```shell
npm install @vacantthinker/util_typeorm_js -D
```

## LICENSE
[MIT](/LICENSE)



