const isEmpty = (obj) =>
  Object.keys(obj).length === 0 && obj.constructor === Object;

const wrapBacktick = (input) => {
  if (typeof input === "string") {
    return input.split(", ").map((str) => "`" + str + "`");
  }
  return input.map((str) => "`" + str + "`");
};

exports.generateDropTableQueryStmt = (tableName) => `
  DROP TABLE IF EXISTS ${tableName};
`;

exports.generateCreateTableQueryStmt = (tableName, attributes) => `
  CREATE TABLE IF NOT EXISTS ${wrapBacktick(tableName)} (
    \`id\` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    ${Object.keys(attributes).reduce((strSum, attribute) => {
      const { dataType, required, defaultValue } = attributes[attribute];
      return (
        strSum +
        `${wrapBacktick(attribute)} ${dataType} ${
          required ? "NOT NULL" : "NULL"
        }${defaultValue ? ` DEFAULT '${defaultValue}'` : ""}, 
        `
      );
    }, "")}
    \`isDeleted\` tinyint(1) DEFAULT '0',
    \`createdAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`id\` (\`id\`)
  ) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;
`;

exports.generateFindQueryStmt = ({
  tableName,
  isOne,
  attributes = "*",
  where = {},
  rawWhere,
  sortBy,
}) => `
  SELECT ${attributes === "*" ? "*" : wrapBacktick(attributes)} 
  FROM ${tableName}
  ${rawWhere || !isEmpty(where) ? `WHERE ` : ""}
  ${
    !isEmpty(where)
      ? `${Object.entries(where)
          .map((o) => `${o[0]}=${o[1]}`)
          .join(" AND ")}`
      : ""
  } 
  ${!rawWhere || isEmpty(where) ? `` : ` AND `}
  ${rawWhere ?? ""}
  ${sortBy ? `ORDER BY ${sortBy.attribute} ${sortBy.order} ` : ""}
  ${isOne ? "LIMIT 1" : ""}
`;

exports.generateCreateQueryStmt = (tableName, input) => `
  INSERT INTO ${tableName} (${wrapBacktick(Object.keys(input))})
  VALUES (${Object.values(input)})
`;

exports.generateUpdateQueryStmt = (tableName, input) =>
  `
  UPDATE ${tableName}
  SET ${Object.entries(input)
    .map((o) => `\`${o[0]}\`=${o[1]}`)
    .join(", ")}
  WHERE id = ${input.id}
`;

exports.generateDeleteQueryStmt = (tableName, id) => `
  UPDATE ${tableName}
  SET isDeleted = 1
  WHERE id = ${id}
`;
