
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
  config: await dataSource().getRepository('config'),
  configCreate: await this.config.create,
  configSave: await this.config.save,
  configDelete: await this.config.delete,
  configMerge: await this.config.merge,
  configFindOneBy: await this.config.findOneBy,
  configFind: await this.config.find,

};

module.exports = {
  table: table,
};

```

#### in your app.js (express)

```javascript

```

---

## how to install ?
```shell
npm install @vacantthinker/util_typeorm_js -D
```


