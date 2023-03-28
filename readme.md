
## how to use ?

#### in xxx.js, --> node xxx.js --> generator util.typeorm.js file
```javascript
const {geneTypeormAll} = require('@vacantthinker/util_typeorm_js');

geneTypeormAll()
```

#### util.typeorm.js

```javascript
const {dataSource} = require('./datasource.js');

const table = {

  configRepo: async () => {
    return await dataSource.getRepository('config');
  },
  configPost: async (value, callback) => {
    const createObj = await dataSource.getRepository('config').create(value);
    if (typeof callback === 'function') {
      const handleObj = callback(createObj);
      return await this.configSave(handleObj);
    } else if (callback === null) {
      return await this.configSave(value);
    } else {
      return null;
    }
  },
  configSave: async (value) => {
    return await dataSource.getRepository('config').save(value);
  },
  configDelete: async (value) => {
    return await dataSource.getRepository('config').delete(value);
  },
  configPut: async (value, findKey) => {
    const findObj = await this.configFindOneBy(findKey);
    await dataSource.getRepository('config').merge(findObj, value);
    return await this.configSave(findObj);
  },
  configFindOneBy: async (value) => {
    return await dataSource.getRepository('config').findOneBy(value);
  },
  configFind: async () => {
    return await dataSource.getRepository('config').find();
  },

};

module.exports = {
  table: table,
};

```

#### datasource.js
```javascript
      
const {DataSource} = require('typeorm');
const {getEntitySchemaList} = require('./util.datasource.js');

const entities = getEntitySchemaList();
const dataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'db.sqlite',
  synchronize: true,
  logging: true,
  entities,
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
      callback(connection)
    })
  }
};
```

#### util.datasource.js
```javascript

const {EntitySchema} = require('typeorm');

function getEntitySchemaList() {
  const entities = [];
  
  let configObj 
    = require('./entity/config.entity.js');
  let configEntitySchema 
    = new EntitySchema(Object.create(configObj));
  entities.push(configEntitySchema);

  return entities;
}

module.exports = {
  getEntitySchemaList: getEntitySchemaList,
};

```

#### in app.js (express)

```javascript
dbInitValue(async (connection) => {
  let findOneBy = await connection.getRepository('config').findOneBy({id: 1});
  if (findOneBy === null) {
    let configObj = {xx, xxxxx};
    connection.getRepository('config').save(configObj);
  }
})
```

---

## how to install ?
```shell
npm install @vacantthinker/util_typeorm_js -D
```


