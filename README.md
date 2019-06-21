# SQL-CMD
A SQL command builder using the 'modifier' paradigm.


## Import
```typescript
import { ECSQLCMD, ECSQLCMDQuery } from "@elijahjcobb/sql-cmd";
```

## `SELECT`

### Basic Query
```typescript
const cmd: ECSQLCMD = ECSQLCMD
    .select("tab")
    .where("key", "<=", 10);

cmd.generate() // => SELECT * FROM tab WHERE (key<=10);
```

### Nested Conditions
```typescript
const cmd: ECSQLCMD = ECSQLCMD
    .select("tab")
    .whereThese(ECSQLCMDQuery
        .or()
        .whereThese(ECSQLCMDQuery
        	.and()
        	.where("age", ">=", 18)
        	.where("age", "<=", 21)
        	.whereThese(ECSQLCMDQuery
        		.or()
        		.where("gender", "=", true)
        		.where("isCool", "!=", false)
        	)
        )
	.whereThese(ECSQLCMDQuery
		.and()
		.where("age", ">=", 13)
		.where("age", "<=", 16)
	)
);
cmd.generate() // string => SELECT * FROM tab WHERE ((age>=18 AND age<=21 AND (gender=true OR isCool!=false)) OR (age>=13 AND age<=16));
```

## `Delete`
```typescript
const cmd: ECSQLCMD = ECSQLCMD
	.delete("tab")
	.where("x", "=", "John");

cmd.generate() // => DELETE FROM tab WHERE (x='John');;
```

## `Insert`
```typescript
const data: Buffer = crypto.randomBytes(2);

const cmd: ECSQLCMD = ECSQLCMD
	.insert("tab")
	.set("name", "Elijah")
	.set("age", 20)
	.set("isMale", true)
	.set("buff", data);

cmd.generate() // => INSERT INTO tab (name, age, isMale, buff) VALUES ('Elijah', 20, true, <data as hex string>);
```

## `Update`
```typescript
const cmd: ECSQLCMD = ECSQLCMD
	.update("tab")
	.set("name", "Elijah")
	.where("id", "=", "xxx");

cmd.generate() // => UPDATE tab SET name='Elijah' WHERE (id='xxx');
```

## Documentation
Everything is completely documented. You can view the
[declaration files](https://github.com/elijahjcobb/sql-cmd/tree/master/dist) or even the
[source code](https://github.com/elijahjcobb/sql-cmd/tree/master/ts) on GitHub.

## Bugs
If you find any bugs please [create an issue on GitHub](https://github.com/elijahjcobb/sql-cmd/issues)
or if you are old fashioned email me at [elijah@elijahcobb.com](mailto:elijah@elijahcobb.com).
