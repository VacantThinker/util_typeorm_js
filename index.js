const fs = require('fs');
const path = require('path');
const stringList = {
  // 'server'
  string_server: 'server',
  // 'server'
  string_db: 'db',
  // 'server'
  string_entity: 'entity',
  // 'db.sqlite'
  string_db_sqlite3: 'db.sqlite',

  // 'util.typeorm.js'
  filename_util_typeorm: 'util.typeorm.js',
  // 'util.datasource.js'
  filename_util_datasource: 'util.datasource.js',
  // 'datasource.js'
  filename_datasource: 'datasource.js',
};

/**
 * find dir/ level up
 *
 * eg: xxx-project/server/db/entity/
 *
 * return xxx-project/server/db/
 *
 * @param pathTarget
 * @param filename
 * @returns {string}
 */
function getPathByLevelUp(
    pathTarget = null,
    filename = null) {

  if (pathTarget === null) {
    pathTarget = findPathTarget();
  }

  const basename = path.basename(pathTarget);
  const pathLevelUp = pathTarget.replace(basename, '');
  if (filename === null) {
    return pathLevelUp;
  } else {
    return path.join(pathLevelUp, filename);
  }
}

/**
 * default: xxx-project/server/db/entity/
 * @returns {string}
 */
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
 *
 * return textArray.reduce( (str, value)=>{
 *
 *   return str.concat(value)
 *
 * }, '')
 *
 * @param pathTarget xxx/ dir
 * @param callbacks calback array
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
function geneUtilTypeormJs(pathTarget = null,) {
  if (pathTarget === null) {
    pathTarget = findPathTarget();
  }

  const reduce = handleTextArr(pathTarget, (filename) => {
    const reg = /.+(?=\.entity\.js)/;
    const mat = filename.match(reg);
    const entityName = mat[0]; // eg: config --> config.entity.js

    const line =
        `
  // ${entityName}.entity.js
  // **************************************************************************
  /**
   * ${entityName} repo
   * @returns {Promise<Repository>}
   */
  ${entityName}Repo: async () => {
    return await dataSource.getRepository('${entityName}');
  },
  /**
   * save ${entityName}
   * @param entityObj
   * @returns {Promise<Object>}
   */
  ${entityName}Insert: async (entityObj) => {
    await dataSource.getRepository('${entityName}').insert(entityObj);
  },
  /**
   * {id: 1}
   * @param options
   * @returns {Promise<*>}
   */
  ${entityName}Delete: async (options) => {
    return await dataSource.getRepository('${entityName}').delete(options);
  },
  /**
   * {id: 1}
   * @param entityNew
   * @param options
   * @returns {Promise<Object>}
   */
  ${entityName}Update: async (entityNew, options) => {
    const findObj = await dataSource.getRepository('${entityName}').findOneBy(options);
    await dataSource.getRepository('${entityName}').merge(findObj, entityNew);
    return await dataSource.getRepository('${entityName}').save(findObj)
  },
  /**
   * {id: 1}
   * @param options
   * @returns {Promise<Object>}
   */
  ${entityName}FindOneWhere: async (options) => {
    return await dataSource.getRepository('${entityName}').findOneBy(options);
  },
  /**
   * {select: {name: 'mari'}, where: {id: 1}}
   * @param options
   * @returns {Promise<Object>}
   */
  ${entityName}FindOne: async (options) => {
    return await dataSource.getRepository('${entityName}').findOne(options);
  },
  /**
   * null or {select: {name: 'mari'}, where: {id: 1}}
   * @param options
   * @returns {Promise<Array>}
   */
  ${entityName}Find: async (options) => {
    if (options === null) {
      return await dataSource.getRepository('${entityName}').find();
    }else {
      return await dataSource.getRepository('${entityName}').find(options);
    }
  },
  /**
   * {id: 1}
   * @param options
   * @returns {Promise<Array>}
   */
  ${entityName}FindWhere: async (options) => {
    return await dataSource.getRepository('${entityName}').findBy(options);
  },
  /**
   * {name: 'mari'} to {name: Like('%mari%')}
   * @param options
   * @returns {Promise<Array>}
   */
  ${entityName}FindWhereLike: async (options) => {
    const searchKey = Object.keys(options)[0];
    const searchVal = Object.values(options)[0];
    options[searchKey] = Like(\`%\${searchVal}%\`);
    return await dataSource.getRepository('${entityName}').findBy(options);
  },
  
`;

    return line;
  });

  const text =
      `'use strict';
      
const {dataSource} = require('./datasource.js');
const {Like} = require('typeorm');

const table = {
  ${reduce}
}

module.exports = {
  table: table
}
`;

  const file = getPathByLevelUp(pathTarget, stringList.filename_util_typeorm);
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

  const text =
      `'use strict';
      
const {DataSource} = require('typeorm');
const {
  getEntitySchemaList, 
  getDatabasePath
} = require('./util.datasource.js');

const dataSource = new DataSource({
  type: 'better-sqlite3',
  database: getDatabasePath(),
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
      callback(connection)
    })
  }
};
`;

  if (pathTarget === null) {
    pathTarget = findPathTarget();
  }
  pathTarget = getPathByLevelUp(pathTarget);
  const file = path.join(pathTarget, stringList.filename_datasource);
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

    const line =
        `  const ${entityName}Obj = require('./${dirName}/${entityName}.entity.js');
  const ${entityName}EntitySchema = new EntitySchema(Object.create(${entityName}Obj));
  entities.push(${entityName}EntitySchema);
  
`;

    return line;
  });

  const text =
      `'use strict';
      
function getEntitySchemaList() {
  const {EntitySchema} = require('typeorm');
  const entities = [];

${reduce}
  return entities;
}

function getDatabasePath() {
  const path = require('path');
  const homedir = require('os').homedir();
  let dbLocaltion = path.join(homedir,
    'AppData', 'Roaming', 'youtube_playlist_download_queue',
    'dbsqlite3', 'db.sqlite');
  return dbLocaltion;
}

module.exports = {
  getEntitySchemaList: getEntitySchemaList,
  getDatabasePath: getDatabasePath,
};
`;

  const file = getPathByLevelUp(pathTarget,
      stringList.filename_util_datasource);
  fs.writeFileSync(file, text);
  console.log(`file=\n`, file, `\n`);
  console.log(`text=\n`, text, `\n`);
}

/**
 * please make sure
 *
 * you have entity/ dir
 *
 * eg: entity/config.entity.js
 *
 * @param pathDir entity dir path
 */
function geneTypeormAll(pathDir) {
  geneDataSourceJs(pathDir);
  geneUtilDataSourceJs(pathDir);
  geneUtilTypeormJs(pathDir);
}

module.exports = {
  geneTypeormAll: geneTypeormAll,
  geneDataSourceJs: geneDataSourceJs,
  geneUtilDataSourceJs: geneUtilDataSourceJs,

  geneUtilTypeormJs: geneUtilTypeormJs,
};