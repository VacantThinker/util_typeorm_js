const fs = require('fs');
const path = require('path');

const stringList = {
  // 'server'
  string_server: 'server',
  // 'db'
  string_db: 'db',
  // 'entity'
  string_entity: 'entity',

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

/**
 *
 * @param entityObj
 * @returns {{key_: string, value_: *}}
 */
function findPrimaryKey(entityObj) {
  let find = Object.keys(entityObj.columns)
    .find((key_) => {
      let value_ = entityObj.columns[key_];
      if (value_.hasOwnProperty('primary')) {
        let primaryVal = value_.primary;
        if (primaryVal === true) {
          return key_;
        }
      }
    });
  let val = entityObj.columns[find];
  return {key_: find, value_: val};
}

function convertEntityToSelectString(entityObj) {

  let o = entityObj.columns;
  let ret = [];
  ret.push('{');
  Object.keys(o).forEach((key_) => {
    let jstype = 'boolean';
    let arr = [`${key_}?`, ':', ' ', jstype, ',', ' '];
    ret.push(...arr);
  });
  ret.push('}');
  let reduce = ret.reduce((str, value) => {
    return str.concat(value);
  }, '');

  return reduce;
}

function convertEntityToUpdateString(entityObj) {

  let o = entityObj.columns;
  let ret = [];
  ret.push('{');
  Object.keys(o).forEach((key_) => {
    let val = o[String(key_)];
    let jstype = convertType(val.type);
    let arr = [`${key_}?`, ':', ' ', jstype, ',', ' '];
    ret.push(...arr);
  });
  ret.push('}');
  let reduce = ret.reduce((str, value) => {
    return str.concat(value);
  }, '');

  return reduce;
}

function convertEntityToReturnString(entityObj) {
  let {key_: find, value_} = findPrimaryKey(entityObj);

  let o = entityObj.columns;
  let ret = [];
  ret.push('{');
  delete entityObj.columns[find];
  let arrPk = [`${find}?`, ':', ' ', convertType(value_.type), ',', ' '];
  ret.push(...arrPk);

  Object.keys(o).forEach((key_) => {
    let val = o[String(key_)];
    let jstype = convertType(val.type);
    let arr = [key_, ':', ' ', jstype, ',', ' '];
    ret.push(...arr);
  });
  entityObj.columns[find] = value_;
  ret.push('}');
  let reduce = ret.reduce((str, value) => {
    return str.concat(value);
  }, '');

  console.log(`meslog reduce=\n`, reduce);

  return reduce;
}

/**
 * gene util.typeorm.js file
 * @param pathDirEntity
 * @param pathDirGeneFile
 */
function geneUtilTypeormJs(
  pathDirEntity = null,
  pathDirGeneFile = null,
) {
  if (pathDirEntity === null) {
    pathDirEntity = findPathTarget();
  }

  const reduce = handleTextArr(pathDirEntity, (filename) => {
    const requirePath = path.join(pathDirEntity, filename);
    const entityObj = Object.assign({}, require(requirePath));

    const entityName = entityObj.name;
    const entityReturnString = convertEntityToReturnString(entityObj);
    const entityUpdateString = convertEntityToUpdateString(entityObj);
    const entitySelectString = convertEntityToSelectString(entityObj);

    // `await dataSource.getRepository('${entityName}')`
    const dbTableString = `await dataSource.getRepository('${entityName}')`;

    const line =
      `
  // ${entityName}.entity.js
  // **************************************************************************
  /**
   * ${entityName} repo
   * @returns {Promise<Repository>}
   */
  ${entityName}Repo: async () => {
    return ${dbTableString};
  },
  /**
   * ${entityName}New1 => insert ${entityName}New1
   *
   * [${entityName}New1, ${entityName}New2, ...] => insert ${entityName}New1, ${entityName}New2, ...
   * @param entityObj {[${entityUpdateString}]|${entityUpdateString}}
   * @returns {Promise<InsertResult>}
   */
  ${entityName}Insert: async (entityObj) => {
    return ${dbTableString}.insert(entityObj);
  },
  /**
   * {id: 1} => delete id=1
   * @param options {Object:${entityUpdateString}}
   * @returns {Promise<DeleteResult>}
   */
  ${entityName}Delete: async (options) => {
    return ${dbTableString}.delete(options);
  },
  /**
   * ${entityName}New, {id: 1} => update id=1
   *
   * ${entityName}New => update all
   * @param ${entityName}New {Object:${entityUpdateString}}
   * @param options {{}|${entityUpdateString}}
   * @returns {Promise<UpdateResult>}
   */
  ${entityName}Update: async (${entityName}New, options = \{\}) => {
    return ${dbTableString}.update(options, ${entityName}New);
  },
  /**
   * {select: {firstName: true}, where: {id: 1}}
   * 
   * [typeorm/docs/find-options.md](https://github.com/typeorm/typeorm/blob/master/docs/find-options.md#find-options)
   * @param options {{select: ${entitySelectString}, where: ${entityUpdateString}}}
   * @returns {Promise<null|${entityReturnString}>}
   */
  ${entityName}FindOne: async (options) => {
    let ret = ${dbTableString}.findOne(options);
    return ret ? ret : null;
  },
  /**
   * ${entityName}Find() => find all
   * 
   * ${entityName}Find({select: {firstName: true}})
   * 
   * ${entityName}Find({select: {firstName: true, lastName: true}, where: {nickName: Like('%mary%')}})
   * 
   * [typeorm/docs/find-options.md](https://github.com/typeorm/typeorm/blob/master/docs/find-options.md#find-options)
   * @param options {null|{select: ${entitySelectString}, where: ${entityUpdateString}}}
   * @returns {Promise<[${entityReturnString}]>}
   */
  ${entityName}Find: async (options = null) => {
    return options
      ? ${dbTableString}.find(options)
      : ${dbTableString}.find();
  },
  
`;

    return line;
  });

  const text =
    `'use strict';
      
const {dataSource} = require('./datasource.js');

const table = {
  ${reduce}
}

module.exports = {
  table: table
}
`;

  if (pathDirGeneFile === null) {
    pathDirGeneFile = getPathByLevelUp(pathDirEntity)
  }

  const file = path.join(pathDirGeneFile,
    stringList.filename_util_typeorm);
  fs.writeFileSync(file, text);
  console.log(`file=\n`, file, `\n`);
  console.log(`text=\n`, text, `\n`);
}

/**
 * generate datasource.js file
 * @param pathDirEntity
 * @param pathDirGeneFile
 */
function geneDataSourceJs(
  pathDirEntity = null,
  pathDirGeneFile = null,
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
      callback(connection);
    })
  }
};
`;

  if (pathDirEntity === null) {
    pathDirEntity = findPathTarget();
  }
  if (pathDirGeneFile === null) {
    pathDirGeneFile = getPathByLevelUp(pathDirEntity);
  }

  const file = path.join(pathDirGeneFile, stringList.filename_datasource);
  fs.writeFileSync(file, text);
  console.log(`file=\n`, file, `\n`);
  console.log(`text=\n`, text, `\n`);
}

/**
 * generate util.datasource.js file
 * @param pathDirEntity
 * @param pathDirGeneFile
 */
function geneUtilDataSourceJs(
  pathDirEntity = null,
  pathDirGeneFile = null,
) {
  if (pathDirEntity === null) {
    pathDirEntity = findPathTarget();
  }

  const dirName = stringList.string_entity;
  const reduce = handleTextArr(pathDirEntity, (filename) => {
    const requirePath = path.join(pathDirEntity, filename);
    const entityObj = Object.assign({}, require(requirePath));

    const entityName = entityObj.name;

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

  if (pathDirGeneFile === null) {
    pathDirGeneFile = getPathByLevelUp(pathDirEntity)
  }

  const file = path.join(pathDirGeneFile,
    stringList.filename_util_datasource);
  fs.writeFileSync(file, text);
  console.log(`file=\n`, file, `\n`);
  console.log(`text=\n`, text, `\n`);
}

/**
 *
 * default: xxx-project/server/db/entity/
 *
 * please make sure you have entity/ dir
 *
 * eg: entity/config.entity.js
 *
 * @param pathDirEntity entity dir path
 * @param pathDirGeneFile
 */
function geneTypeormAll(
  pathDirEntity = null,
  pathDirGeneFile = null
) {

  geneDataSourceJs(pathDirEntity, pathDirGeneFile);
  geneUtilDataSourceJs(pathDirEntity, pathDirGeneFile);
  geneUtilTypeormJs(pathDirEntity, pathDirGeneFile);
}

module.exports = {
  geneTypeormAll: geneTypeormAll,
  geneDataSourceJs: geneDataSourceJs,
  geneUtilDataSourceJs: geneUtilDataSourceJs,

  geneUtilTypeormJs: geneUtilTypeormJs,
};