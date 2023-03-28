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
  const lineEnter = `\n`;
  textArr.pushItem = function(...values) {
    values.forEach((value) => {
      textArr.push(value);
      textArr.push(lineEnter);
    });
  };

  const filenameList = fs.readdirSync(pathTarget);
  callbacks.forEach((callback) => {
    filenameList.forEach((filename) => {
      const text = callback(filename);
      if (Array.isArray(text)) {
        Array.from(text).forEach((value) => {
          textArr.pushItem(value);
        });
      } else {
        textArr.pushItem(text);
      }
    });
  });

  const reduce = textArr.reduce((str, value) => {
    return str.concat(value);
  }, '');
  return reduce;
}

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

    let line1 = `  ${entityName}: `;
    let line2 = `await dataSource.getRepository('${entityName}'),`;

    let line3 = `  ${entityName}Create: await this.${entityName}.create,`;
    let line4 = `  ${entityName}Save: await this.${entityName}.save,`;
    let line5 = `  ${entityName}Delete: await this.${entityName}.delete,`;
    let line6 = `  ${entityName}Merge: await this.${entityName}.merge,`;
    let line7 = `  ${entityName}FindOneBy: await this.${entityName}.findOneBy,`;
    let line8 = `  ${entityName}Find: await this.${entityName}.find,`;

    return [line1.concat(line2), line3, line4, line5, line6, line7, line8];
  });

  let text =
      `'use strict';

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
      `'use strict';
      
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

    let line1 = `let ${entityName}Obj = `;
    let line2 = `require('./${dirName}/${entityName}.entity.js');`;
    let line3 = `  let ${entityName}EntitySchema =`;
    let line4 = `new EntitySchema(Object.create(configObj));`;

    return [line1.concat(line2), line3.concat(line4)];
  }, (filename) => {
    const reg = /.+(?=\.entity\.js)/;
    const mat = filename.match(reg);
    const entityName = mat[0]; // eg: config

    let line1 = `  entities.push(${entityName}EntitySchema);`;
    return line1;
  });

  let text =
      `'use strict';

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