// ----------------------------------------------
// REDUCERS TEST
// ----------------------------------------------
import * as DBSERVER from 'spacetimedb/server';
// missing range function
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import spacetimedb from '../module';
// ----------------------------------------------
// 
// ----------------------------------------------

function getAllMethods(obj:any) {
    return Object.getOwnPropertyNames(obj).filter(prop => {
        return typeof obj[prop] === 'function';
    });
}

/*
 [ 
'ArrayBuilder', 
'ArrayColumnBuilder', 
'BoolBuilder', 
'BoolColumnBuilder', 
'BooleanExpr', 
'ByteArrayBuilder', 
'ByteArrayColumnBuilder', 
'ColumnBuilder', 
'ColumnExpression', 
'ConnectionIdBuilder', 
'ConnectionIdColumnBuilder', 
'F32Builder', 
'F32ColumnBuilder', 
'F64Builder', 
'F64ColumnBuilder', 
'I128Builder', 
'I128ColumnBuilder', 
'I16Builder', 
'I16ColumnBuilder', 
'I256Builder', 
'I256ColumnBuilder', 
'I32Builder', 
'I32ColumnBuilder', 
'I64Builder', 
'I64ColumnBuilder', 
'I8Builder', 
'I8ColumnBuilder', 
'IdentityBuilder', 
'IdentityColumnBuilder', 
'OptionBuilder', 
'OptionColumnBuilder', 
'ProductBuilder', 
'ProductColumnBuilder', 
'RefBuilder', 
'ResultBuilder', 
'ResultColumnBuilder', 
'RowBuilder', 
'ScheduleAtBuilder', 
'ScheduleAtColumnBuilder', 
'SenderError', 
'SimpleSumBuilder', 
'SimpleSumColumnBuilder', 
'SpacetimeHostError', 
'StringBuilder', 
'StringColumnBuilder', 
'SumBuilder', 
'SumColumnBuilder', 
'TimeDurationBuilder', 
'TimeDurationColumnBuilder', 
'TimestampBuilder', 
'TimestampColumnBuilder', 
'TypeBuilder', 
'U128Builder', 
'U128ColumnBuilder', 
'U16Builder', 
'U16ColumnBuilder', 
'U256Builder', 
'U256ColumnBuilder', 
'U32Builder', 
'U32ColumnBuilder', 
'U64Builder', 
'U64ColumnBuilder', 
'U8Builder', 
'U8ColumnBuilder', 
'UuidBuilder', 
'UuidColumnBuilder', 
'and', 
'createTableRefFromDef', 
'evaluateBooleanExpr', 
'getQueryAccessorName', 
'getQueryTableName', 
'getQueryWhereClause', 
'isRowTypedQuery', 
'isTypedQuery', 
'literal', 
'makeQueryBuilder', 
'not', 
'or', 
'schema', 
'table', 
'toCamelCase', 
'toComparableValue', 
'toSql' 
]

*/

// ----------------------------------------------
// 
// ----------------------------------------------
export const call_test = spacetimedb.reducer(
    { text: t.string() }, 
    (ctx, { text }) => {
  console.info(`User ${ctx.sender}: ${text}`);
  console.log(getAllMethods(DBSERVER));

  // let test = new Range({ tag: 'included', value: 1n }, { tag: 'unbounded' });
  // let test = new range({ tag: 'included', value: 1n }, { tag: 'unbounded' });
  // console.log(test);
  
  // ctx.db.message.insert({
  //   sender: ctx.sender,
  //   text,
  //   sent: ctx.timestamp,
  // });
});


