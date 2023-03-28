const fs = require('fs');
const path = require('path');
const stringList = {
  // 'server'
  string_server: 'server',
  // 'server'
  string_db: 'db',
  // 'server'
  string_entity: 'entity',
  // 'util.typeorm.js'
  filename_util_typeorm: 'util.typeorm.js',
  // 'util.datasource.js'
  filename_util_datasource: 'util.datasource.js',
  // 'datasource.js'
  filename_datasource: 'datasource.js',

};

function getPathByLevelUp(
    pathTarget = null,
    filename = null) {

  if (pathTarget === null) {
    pathTarget = findPathTarget();
  }

  let basename = path.basename(pathTarget);
  let pathLevelUp = pathTarget.replace(basename, '');
  if (filename === null) {
    return pathLevelUp;
  } else {
    return path.join(pathLevelUp, filename);
  }
}

function findPathTarget() {
  const pathRoot = process.cwd();

  const pathTarget = path.join(pathRoot,
      stringList.string_server,
      stringList.string_db,
      stringList.string_entity);

  return pathTarget;
}

/**
 * create an array, save text
 * @param pathTarget
 * @param callbacks
 * @returns {*}
 */
function handleTextArr(pathTarget, ...callbacks) {
  const textArr = [];

  const filenameList = fs.readdirSync(pathTarget);
  callbacks.forEach((callback) => {
    filenameList.forEach((filename) => {
      const text = callback(filename);
      if (Array.isArray(text)) {
        Array.from(text).forEach((value) => {
          textArr.push(value);
        });
      } else {
        textArr.push(text);
      }
    });
  });

  const reduce = textArr.reduce((str, value) => {
    return str.concat(value);
  }, '');
  return reduce;
}

/**
 * gene util.typeorm.js file
 * @param pathTarget
 */
function geneUtilTypeormJs(
    pathTarget = findPathTarget(),
) {
  if (pathTarget === null) {
    pathTarget = findPathTarget();
  }

  const reduce = handleTextArr(pathTarget, (filename) => {
    const reg = /.+(?=\.entity\.js)/;
    const mat = filename.match(reg);
    const entityName = mat[0]; // eg: config --> config.entity.js


  let line =
`
  // **************************************************************************
  // ${entityName}.entity.js
  ${entityName}Repo: async () => {
    return await dataSource.getRepository('${entityName}');
  },
  ${entityName}Post: async (value, callback) => {
    const createObj = await dataSource.getRepository('${entityName}').create(value);
    if (typeof callback === 'function') {
      const handleObj = callback(createObj);
      return await this.${entityName}Save(handleObj)
    } else if (callback === null) {
      return await this.${entityName}Save(createObj)
    } else {
      return null;
    }
  },
  ${entityName}Save: async (value) => {
    return await dataSource.getRepository('${entityName}').save(value);
  },
  ${entityName}Delete: async (value) => {
    return await dataSource.getRepository('${entityName}').delete(value);
  },
  ${entityName}Put: async (value, findKey) => {
    const findObj = await this.${entityName}FindOneBy(findKey);
    await dataSource.getRepository('${entityName}').merge(findObj, value);
    return await this.${entityName}Save(findObj)
  },
  ${entityName}FindOneBy: async (value) => {
    return await dataSource.getRepository('${entityName}').findOneBy(value);
  },
  ${entityName}Find: async () => {
    return await dataSource.getRepository('${entityName}').find();
  },
  
`

    return line
  });

  let text =
      `
const {dataSource} = require('./datasource.js');

const table = {
  ${reduce}
}

module.exports = {
  table: table
}
`;

  let file = getPathByLevelUp(pathTarget, stringList.filename_util_typeorm);
  fs.writeFileSync(file, text);
  console.log(`file=\n`, file, `\n`);
  console.log(`text=\n`, text, `\n`);
}

/**
 * generator datasource.js file
 * @param pathTarget
 */
function geneDataSourceJs(
    pathTarget = null,
) {
  if (pathTarget === null) {
    pathTarget = getPathByLevelUp();
  }
  let text =
      `      
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
`;

  let file = path.join(pathTarget, stringList.filename_datasource);
  fs.writeFileSync(file, text);
  console.log(`file=\n`, file, `\n`);
  console.log(`text=\n`, text, `\n`);
}

/**
 * generator util.datasource.js file
 * @param pathTarget
 */
function geneUtilDataSourceJs(
    pathTarget = null,
) {
  if (pathTarget === null) {
    pathTarget = findPathTarget();
  }

  const dirName = stringList.string_entity;
  const reduce = handleTextArr(pathTarget, (filename) => {
    const reg = /.+(?=\.entity\.js)/;
    const mat = filename.match(reg);
    const entityName = mat[0]; // eg: config

    let line =
`
  let ${entityName}Obj 
    = require('./${dirName}/${entityName}.entity.js');
  let ${entityName}EntitySchema 
    = new EntitySchema(Object.create(${entityName}Obj));
  entities.push(${entityName}EntitySchema);

`

    return line
  });

  let text =
      `
const {EntitySchema} = require('typeorm');

function getEntitySchemaList() {
  const entities = [];
  ${reduce}
  return entities;
}

module.exports = {
  getEntitySchemaList: getEntitySchemaList,
};
`;

  let file = getPathByLevelUp(
      null, stringList.filename_util_datasource);
  fs.writeFileSync(file, text);
  console.log(`file=\n`, file, `\n`);
  console.log(`text=\n`, text, `\n`);
}

function geneTypeormAll() {
  geneDataSourceJs();
  geneUtilDataSourceJs();
  geneUtilTypeormJs();
}

module.exports = {
  geneTypeormAll: geneTypeormAll,
  geneDataSourceJs: geneDataSourceJs,
  geneUtilDataSourceJs: geneUtilDataSourceJs,

  geneUtilTypeormJs: geneUtilTypeormJs,
};