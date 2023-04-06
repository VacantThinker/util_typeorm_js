
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

#### config.entity.js
```javascript
module.exports = {
  name: 'config',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    name: {
      type: 'varchar', default: '',
    },
  },
};
```

#### in xxx.js
```javascript
const {geneTypeormAll} = require('@vacantthinker/util_typeorm_js');
geneTypeormAll()
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

  // config.entity.js
  // **************************************************************************
  /**
   * 
   * @returns {Promise<*>}
   */
  configRepo: async () => {
    return await dataSource.getRepository('config');
  },
  /**
   * 
   * @param entityObj
   * @returns {Promise<void>}
   */
  configSave: async (entityObj) => {
    return await dataSource.getRepository('config').save(entityObj);
  },
  /**
   * 
   * @param options
   * @returns {Promise<*>}
   */
  configDelete: async (options) => {
    return await dataSource.getRepository('config').delete(options);
  },
  /**
   * 
   * @param entityNew
   * @param options
   * @returns {Promise<void>}
   */
  configUpdate: async (entityNew, options) => {
    const findObj = await dataSource.getRepository('config').findOneBy(options);
    await dataSource.getRepository('config').merge(findObj, entityNew);
    return await dataSource.getRepository('config').save(findObj)
  },
  /**
   * {id: 1}
   * @param options
   * @returns {Promise<*>} findObj
   */
  configFindOneWhere: async (options) => {
    return await dataSource.getRepository('config').findOneBy(options);
  },
  /**
   * {select: {name: 'mari'}, where: {id: 1}}
   * @param options
   * @returns {Promise<*>} findObj
   */
  configFindOne: async (options) => {
    return await dataSource.getRepository('config').findOne(options);
  },
  /**
   * null or {select: {name: 'mari'}, where: {id: 1}}
   * @param options
   * @returns {Promise<*>}
   */
  configFind: async (options) => {
    if (options === null) {
      return await dataSource.getRepository('video').find();
    }else {
      return await dataSource.getRepository('video').find(options);
    }
  },
  /**
   * {id: 1}
   * @param options
   * @returns {Promise<*>}
   */
  configFindWhere: async (options) => {
    return await dataSource.getRepository('config').findBy(options);
  },
  /**
   * {name: 'mari'} to {name: Like('%mari%')}
   * @param options
   * @returns {Promise<*>}
   */
  configFindWhereLike: async (options) => {
    const searchKey = Object.keys(options)[0];
    const searchVal = Object.values(options)[0];
    options[searchKey] = Like(`%${searchVal}%`);
    return await dataSource.getRepository('config').findBy(options);
  },

};

module.exports = {
  table: table,
};

```

#### datasource.js
```javascript
'use strict';
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
'use strict';
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


