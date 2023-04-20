

## how to use ?

#### sample: dir
```text
xxxx-project/
  server/
    db/
      entity/
        friend.entity.js
      
      datasource.js         <== generate by xxx.js geneTypeormAll()
      util.datasource.js    <== generate by xxx.js geneTypeormAll()
      util.typeorm.js       <== generate by xxx.js geneTypeormAll()
  
  xxx.js  <== (node xxx.js)
```

#### friend.entity.js
```javascript
module.exports = {
  name: 'friend',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    nickName: {
      type: 'varchar', default: '',
    },
    firstName: {
      type: 'varchar', default: '',
    },
    lastName: {
      type: 'varchar', default: '',
    },
    livein: {
      type: 'varchar', default: '',
    },
  },
};
```

#### xxx.js
```javascript
// use default path
const {geneTypeormAll} = require('@vacantthinker/util_typeorm_js');
geneTypeormAll(); // default: xxx-project/server/db/entity/
```
```javascript
// use custom path
const path = require('path');
const {geneTypeormAll} = require('@vacantthinker/util_typeorm_js');

let pathDirEntity = path.join(__dirname, 'entity');
let pathDirGeneFile = path.join(__dirname, 'server', 'db');
geneTypeormAll(pathDirEntity, pathDirGeneFile,);
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
  
  // friend.entity.js
  // **************************************************************************
  /**
   * friend repo
   * @returns {Promise<Repository>}
   */
  friendRepo: async () => {
    return await dataSource.getRepository('friend');
  },
  /**
   * friendNew1 => insert friendNew1
   *
   * [friendNew1, friendNew2, ...] => insert friendNew1, friendNew2, ...
   * @param entityObj {[{nickName?: string, firstName?: string, lastName?: string, livein?: string, id?: number, }]|{nickName?: string, firstName?: string, lastName?: string, livein?: string, id?: number, }}
   * @returns {Promise<InsertResult>}
   */
  friendInsert: async (entityObj) => {
    return await dataSource.getRepository('friend').insert(entityObj);
  },
  /**
   * {id: 1} => delete id=1
   * @param options {Object:{nickName?: string, firstName?: string, lastName?: string, livein?: string, id?: number, }}
   * @returns {Promise<DeleteResult>}
   */
  friendDelete: async (options) => {
    return await dataSource.getRepository('friend').delete(options);
  },
  /**
   * friendNew, {id: 1} => update id=1
   *
   * friendNew => update all
   * @param friendNew {{nickName?: string, firstName?: string, lastName?: string, livein?: string, id?: number, }}
   * @param options {{}|{nickName?: string, firstName?: string, lastName?: string, livein?: string, id?: number, }}
   * @returns {Promise<UpdateResult>}
   */
  friendUpdate: async (friendNew, options = {}) => {
    return await dataSource.getRepository('friend').update(options, friendNew);
  },
  /**
   * {select: {firstName: true}, where: {id: 1}}
   * 
   * [typeorm/docs/find-options.md](https://github.com/typeorm/typeorm/blob/master/docs/find-options.md#find-options)
   * @param options {{select: {nickName?: boolean, firstName?: boolean, lastName?: boolean, livein?: boolean, id?: boolean, }, where: {nickName?: string, firstName?: string, lastName?: string, livein?: string, id?: number, }}}
   * @returns {Promise<null|{id?: number, nickName: string, firstName: string, lastName: string, livein: string, }>}
   */
  friendFindOne: async (options) => {
    let ret = await dataSource.getRepository('friend').findOne(options);
    return ret ? ret : null;
  },
  /**
   * friendFind() => find all
   * 
   * friendFind({select: {firstName: true}})
   * 
   * friendFind({select: {firstName: true, lastName: true}, where: {nickName: Like('%mary%')}})
   * 
   * [typeorm/docs/find-options.md](https://github.com/typeorm/typeorm/blob/master/docs/find-options.md#find-options)
   * @param options {null|{select: {nickName?: boolean, firstName?: boolean, lastName?: boolean, livein?: boolean, id?: boolean, }, where: {nickName?: string, firstName?: string, lastName?: string, livein?: string, id?: number, }}}
   * @returns {Promise<[{id?: number, nickName: string, firstName: string, lastName: string, livein: string, }]>}
   */
  friendFind: async (options = null) => {
    return options
      ? await dataSource.getRepository('friend').find(options)
      : await dataSource.getRepository('friend').find();
  },
  /**
  * @param options {null|{nickName?: string, firstName?: string, lastName?: string, livein?: string, id?: number, }} { firstName: "mary" }
  * @return {Promise<number>}
  */
  friendCount: async (options = null) => {
    return await dataSource.getRepository('friend').countBy(options)
  },
  /**
  * 
  * @param columnName {string} "age"
  * @param options {null|{nickName?: string, firstName?: string, lastName?: string, livein?: string, id?: number, }} { firstName: "mary" }
  * @return {Promise<number>}
  */
  friendSum: async (columnName, options = null) => {
    return await dataSource.getRepository('friend').sum(columnName, options)
  },
  /**
  * 
  * @param columnName {string} "age"
  * @param options {null|{nickName?: string, firstName?: string, lastName?: string, livein?: string, id?: number, }} { firstName: "mary" }
  * @return {Promise<number>}
  */
  friendAverage: async (columnName, options = null) => {
    return await dataSource.getRepository('friend').average(columnName, options)
  },
  /**
  * 
  * @param columnName {string} "age"
  * @param options {null|{nickName?: string, firstName?: string, lastName?: string, livein?: string, id?: number, }} null or  { firstName: "mary" }
  * @returns {Promise<{val:number, entity: {id?: number, nickName: string, firstName: string, lastName: string, livein: string, }}>} val => min value, entity => has the min value
  */
  friendMinimum: async (columnName, options = null) => {
    let key_ = columnName
    let val = await dataSource.getRepository('friend').minimum(columnName, options)
    let findOption = {}
    findOption[key_] = val
    let entity = await dataSource.getRepository('friend').findOneBy(findOption)
    return {val, entity}
  },
  /**
  * 
  * @param columnName {string} "age"
  * @param options {null|{nickName?: string, firstName?: string, lastName?: string, livein?: string, id?: number, }} null or {firstName: "mary"}
  * @returns {Promise<{val:number, entity: {id?: number, nickName: string, firstName: string, lastName: string, livein: string, }}>} val => max value, entity => has the min value
  */
  friendMaximum: async (columnName, options = null) => {
    let key_ = columnName
    let val = await dataSource.getRepository('friend').maximum(columnName, options)
    let findOption = {}
    findOption[key_] = val
    let entity = await dataSource.getRepository('friend').findOneBy(findOption)
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
//     "val": 45,
//     "entity": {
//       "id": 45,
//       "nickName": "jesica",
//       "firstName": "jesica",
//       "lastName": "",
//       "livein": ""
//     }
//   }
// }
app.get('/maxid', async (req, res) => {

  let obj = await table.friendMaximum(
    'id',
  );
  console.log(`meslog number=\n`, obj);
  res.status(200).send({result:'ok', data: obj});
});

// [
//   {
//     "firstName": "mary",
//     "lastName": ""
//   },
//   {
//     "firstName": "Ashley",
//     "lastName": ""
//   },
//   {
//     "firstName": "jesica",
//     "lastName": ""
//   }
// ]
app.get('/firendAll', async (req, res) => {
  let arr = await table.friendFind({
    select: {
      firstName: true, lastName: true,
    },
  }); // SELECT "firstName", "lastName" FROM "friend"

  console.log(`meslog arr=\n`, arr);

  res.status(200).send(arr);

});

let port = 3000;
let urlLocalhost = `http://localhost:${port}`;
app.listen(port, async () => {
  console.log(`app running ${urlLocalhost}`);
  //init data of database
  dbInitValue(async () => {
    await table.friendInsert([
      {nickName: 'mary', firstName: 'mary'},
      {nickName: 'Ashley', firstName: 'Ashley'},
      {nickName: 'jesica', firstName: 'jesica'},
    ]);
  });

});
```

#### datasource.js
```javascript
'use strict';
      
const {DataSource} = require('typeorm');
const {
  getEntitySchemaList, 
} = require('./util.datasource.js');

const dataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'db.sqlite',
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

  const friendObj = require('./entity/friend.entity.js');
  const friendEntitySchema = new EntitySchema(Object.create(friendObj));
  entities.push(friendEntitySchema);
  

  return entities;
}

module.exports = {
  getEntitySchemaList: getEntitySchemaList,
};

```


---

## how to install ?
```shell
npm install @vacantthinker/util_typeorm_js -D
```

## LICENSE
[MIT](/LICENSE)



