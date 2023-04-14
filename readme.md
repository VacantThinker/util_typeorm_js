
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
   * config repo
   * @returns {Promise<Repository>}
   */
  configRepo: async () => {
    return await dataSource.getRepository('config');
  },
  /**
   * save config
   * @param entityObj
   * @returns {Promise<void>}
   */
  configInsert: async (entityObj) => {
    await dataSource.getRepository('config').insert(entityObj);
  },
  /**
   * {id: 1}
   * @param options
   * @returns {Promise<*>}
   */
  configDelete: async (options) => {
    return await dataSource.getRepository('config').delete(options);
  },
  /**
   * configNew, {id: 1}
   * @param configNew
   * @param options
   * @returns {Promise<{"id":"number","savelocation":"string","tmplocation":"string","appdatacache":"string"}>}
   */
  configUpdate: async (configNew, options) => {
    await dataSource.getRepository('config').update(options, configNew);
    return await dataSource.getRepository('config').findOneBy(options);
  },
  /**
   * {} --> updateall
   *
   * @param configNew
   * @returns {Promise<void>}
   */
  configUpdateAll: async (configNew) => {
    await dataSource.getRepository('config').update({}, configNew);
  },
  /**
   * {id: 1}
   * @param options
   * @returns {Promise<null|{"id":"number","savelocation":"string","tmplocation":"string","appdatacache":"string"}>}
   */
  configFindOneWhere: async (options) => {
    let ret = await dataSource.getRepository('config').findOneBy(options);
    return ret ? ret : null;
  },
  /**
   * {select: {name: 'mari'}, where: {id: 1}}
   * @param options
   * @returns {Promise<null|{"id":"number","savelocation":"string","tmplocation":"string","appdatacache":"string"}>}
   */
  configFindOne: async (options) => {
    let ret = await dataSource.getRepository('config').findOne(options);
    return ret ? ret : null;
  },
  /**
   * null or {select: {name: 'mari'}, where: {id: 1}}
   * @param options
   * @returns {Promise<[{"id":"number","savelocation":"string","tmplocation":"string","appdatacache":"string"}]>}
   */
  configFind: async (options) => {
    if (options === null) {
      return await dataSource.getRepository('config').find();
    } else {
      return await dataSource.getRepository('config').find(options);
    }
  },
  /**
   * {id: 1}
   * @param options
   * @returns {Promise<[{"id":"number","savelocation":"string","tmplocation":"string","appdatacache":"string"}]>}
   */
  configFindWhere: async (options) => {
    return await dataSource.getRepository('config').findBy(options);
  },
  /**
   * {name: 'mari'} to {name: Like('%mari%')}
   * @param options
   * @returns {Promise<[{"id":"number","savelocation":"string","tmplocation":"string","appdatacache":"string"}]>}
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


