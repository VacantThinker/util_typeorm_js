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
 * find dir/ level up
 *
 * eg: xxx-project/server/router/
 *
 * return xxx-project/server/
 *
 * @param pathTarget
 * @param filename
 * @returns
 */
function getPathByLevelUp(
  pathTarget = null,
  filename = null) {

  if (pathTarget === null) {
    return;
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

function convertType(dbtype) {
  const typeObj = {
    varchar: 'string',
    text: 'string',
    boolean: 'boolean',
    int: 'number',
  };
  return typeObj[dbtype];
}

function convertEntityToResultType(pathTarget, filename) {
  const requirePath = path.join(pathTarget, filename);
  const entityObj = require(requirePath);
  const retObj = {};
  Object.keys(entityObj.columns).forEach((key_) => {
    let val = entityObj.columns[key_];
    let jstype = convertType(val.type);
    retObj[key_] = jstype;
  });
  console.log('meslog ', `retObj=\n`, retObj);
  const retstring = JSON.stringify(retObj, null, '');
  return retstring;
}

/**
 * gene util.typeorm.js file
 * @param pathTarget
 */
function geneUtilTypeormJs(pathTarget = null) {
  if (pathTarget === null) {
    pathTarget = findPathTarget();
  }

  const reduce = handleTextArr(pathTarget, (filename) => {
    const reg = /.+(?=\.entity\.js)/;
    const mat = filename.match(reg);
    const entityName = mat[0]; // eg: config --> config.entity.js
    const retstring = convertEntityToResultType(pathTarget, filename);

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
   * @returns {Promise<void>}
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
   * ${entityName}New, {id: 1}
   * @param ${entityName}New
   * @param options
   * @returns {Promise<${retstring}>}
   */
  ${entityName}Update: async (${entityName}New, options) => {
    await dataSource.getRepository('${entityName}').update(options, ${entityName}New)
    return await dataSource.getRepository('${entityName}').findOneBy(options);
  },
  /**
   * {} --> updateall
   * 
   * @param ${entityName}New
   * @returns {Promise<void>}
   */
  ${entityName}UpdateAll: async (${entityName}New) => {
    await dataSource.getRepository('${entityName}').update({}, ${entityName}New)
  },
  /**
   * {id: 1}
   * @param options
   * @returns {Promise<null|${retstring}>}
   */
  ${entityName}FindOneWhere: async (options) => {
    let ret = await dataSource.getRepository('${entityName}').findOneBy(options);
    return ret ? ret : null
  },
  /**
   * {select: {name: 'mari'}, where: {id: 1}}
   * @param options
   * @returns {Promise<null|${retstring}>}
   */
  ${entityName}FindOne: async (options) => {
    let ret = await dataSource.getRepository('${entityName}').findOne(options);
    return ret ? ret : null
  },
  /**
   * null or {select: {name: 'mari'}, where: {id: 1}}
   * @param options
   * @returns {Promise<[${retstring}]>}
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
   * @returns {Promise<[${retstring}]>}
   */
  ${entityName}FindWhere: async (options) => {
    return await dataSource.getRepository('${entityName}').findBy(options);
  },
  /**
   * {name: 'mari'} to {name: Like('%mari%')}
   * @param options
   * @returns {Promise<[${retstring}]>}
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

module.exports = {
  getEntitySchemaList: getEntitySchemaList,
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