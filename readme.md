
## how to use ?

#### dir
```text
xxxx-project/
  server/
    db/
      entity/
        config.entity.js
      
      datasource.js         <== generator by xxx.js geneTypeormAll()
      util.datasource.js    <== generator by xxx.js geneTypeormAll()
      util.typeorm.js       <== generator by xxx.js geneTypeormAll()
  
  xxx.js  <== (node xxx.js)
```

#### in xxx.js
```javascript
const {geneTypeormAll} = require('@vacantthinker/util_typeorm_js');
geneTypeormAll()
```

#### generator util.typeorm.js datasource.js util.datasource.js
```shell
node xxx.js
```

#### util.typeorm.js

```javascript
const {dataSource} = require('./datasource.js');

const table = {

  // config.entity.js
  // **************************************************************************
  // configRepository
  configRepo: async () => {
    return await dataSource.getRepository('config');
  },
  // save config
  configSave: async (value) => {
    return await dataSource.getRepository('config').save(value);
  },
  // delete config
  configDelete: async (value) => {
    return await dataSource.getRepository('config').delete(value);
  },
  // findOneBy(key) ==> merge(findObj, value) ===> save(findObj)
  configUpdate: async (value, findKey) => {
    const findObj = await dataSource.getRepository('config').findOneBy(findKey);
    await dataSource.getRepository('config').merge(findObj, value);
    return await dataSource.getRepository('config').save(findObj)
  },
  // findOneBy(key)
  configFindOneBy: async (value) => {
    return await dataSource.getRepository('config').findOneBy(value);
  },
  // find() ==> return all config
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
  
  let configObj = require('./entity/config.entity.js');
  let configEntitySchema = new EntitySchema(Object.create(configObj));
  entities.push(configEntitySchema);

  return entities;
}

module.exports = {
  getEntitySchemaList: getEntitySchemaList,
};

```

#### in app.js (express)
```javascript
// init data of database
dbInitValue(async (connection) => {
  let findOneBy = await connection.getRepository('config').findOneBy({id: 1});
  if (findOneBy === null) {
    let configObj = {xx, xxxxx};
    connection.getRepository('config').save(configObj);
  }
})

app.get('/config/:name', async (req, res) => {
  let {name} = req.params;
  let config1 = {name};
  await table.configSave(config1)

  res.send(config1);
});

app.listen(3000, async () => {
  console.log(`running 3000`);
});
```

---

## how to install ?
```shell
npm install @vacantthinker/util_typeorm_js -D
```


