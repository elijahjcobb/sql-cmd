/**
 *
 * Elijah Cobb
 * elijah@elijahcobb.com
 * https://elijahcobb.com
 *
 *
 * Copyright 2019 Elijah Cobb
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

import { ECMap, ECArrayList } from "@elijahjcobb/collections";

enum ECSQLCMDMethod {
	select = "SELECT",
	update = "UPDATE",
	insert = "INSERT",
	delete = "DELETE"
}

type ECSQLCMDSort = "<" | ">";
type ECSQLCMDOperator = "=" | "!=" | ">" | "<" | ">=" | "<=" | "in" | "like";
type ECSQLCMDValue = string | number | boolean | undefined | null;

const escapeValue: (value: ECSQLCMDValue) => string | number | boolean = (value: ECSQLCMDValue): string | number | boolean => {

	if (value === null || value === undefined) return "NULL";
	else if (typeof value === "string") {

		let escaped: string = value;

		escaped = escaped.replace(RegExp(`'`, "g"), `\\'`);
		escaped = escaped.replace(RegExp(`"`, "g"), `\\"`);
		escaped = `'${escaped}'`;

		return escaped;

	} else return value;

};

interface ECSQLGeneratable {
	generate(): string;
}

export class ECSQLCMD implements ECSQLGeneratable {

	private readonly method: ECSQLCMDMethod;
	private table: string | undefined;
	private orderings: { key: string, direction: ECSQLCMDSort}[] = [];
	private limitOfItems: number = -1;
	private parameters: ECMap<string, ECSQLCMDValue> = new ECMap<string, ECSQLCMDValue>();
	private queries: ECSQLCMDQuery | undefined;

	private constructor(method: ECSQLCMDMethod) { this.method = method; }

	public from(table: string): ECSQLCMD {

		this.table = table;
		return this;

	}

	public into(table: string): ECSQLCMD {

		this.table = table;
		return this;

	}

	public in(table: string): ECSQLCMD {

		this.table = table;
		return this;

	}

	public sort(key: string, direction: ECSQLCMDSort): ECSQLCMD {

		this.orderings.push({ key, direction });
		return this;

	}

	public limit(limit: number): ECSQLCMD {

		this.limitOfItems = limit;
		return this;

	}

	public set(key: string, value: ECSQLCMDValue): ECSQLCMD {

		this.parameters.set(key, value);
		return this;

	}

	public generate(): string {

		if (this.table === undefined) throw Error("You must specify a table with from(), in(), or into().");
		let command: string = "";

		if (this.method === ECSQLCMDMethod.select) {

			command = `SELECT * FROM ${this.table}`;
			if (this.queries) command += ` WHERE ${this.queries.generate()}`;
			if (this.orderings.length > 0) {

				command += ` ORDER BY `;
				const formattedOrders: string[] = [];

				this.orderings.forEach((ordering: { key: string, direction: ECSQLCMDSort}) => {

					formattedOrders.push(`${ordering.key} ${ordering.direction === "<" ? "ASC" : "DESC"}`);

				});

				command += formattedOrders.join(", ");
			}

			if (this.limitOfItems !== -1) command += ` LIMIT ${this.limitOfItems}`;

		} else if (this.method === ECSQLCMDMethod.insert) {

			command = `INSERT INTO ${this.table}`;
			if (this.queries) command += ` WHERE ${this.queries.generate()}`;
			if (this.parameters.size() === 0) throw new Error("You must specify at least one parameter to insert.");

			command += ` (${this.parameters.keys().toString(", ")}) VALUES (`;
			command += this.parameters.values().map((value: ECSQLCMDValue) => { return escapeValue(value); }).toString(", ");
			command += ")";

		} else if (this.method === ECSQLCMDMethod.delete) {

			command = `DELETE FROM ${this.table}`;
			if (this.queries) command += ` WHERE ${this.queries.generate()}`;

		} else if (this.method === ECSQLCMDMethod.update) {

			command += `UPDATE ${this.table} SET`;

			const updateItems: string[] = [];

			this.parameters.forEach((key: string, value: ECSQLCMDValue) => {

				updateItems.push(`${key}=${escapeValue(value)}`);

			});

			command += ` ${updateItems.join(", ")}`;

			if (this.queries) command += ` WHERE ${this.queries.generate()}`;

		}

		command += ";";

		return command;

	}

	public where(query: ECSQLCMDQuery): ECSQLCMD {

		this.queries = query;
		return this;

	}

	public static select(): ECSQLCMD { return new ECSQLCMD(ECSQLCMDMethod.select); }
	public static update(): ECSQLCMD { return new ECSQLCMD(ECSQLCMDMethod.update); }
	public static insert(): ECSQLCMD { return new ECSQLCMD(ECSQLCMDMethod.insert); }
	public static delete(): ECSQLCMD { return new ECSQLCMD(ECSQLCMDMethod.delete); }

}

type ECSQLCMDQueryCondition = "AND" | "OR";
type ECSQLCMDQueryItems = {
	key: string,
	operator: ECSQLCMDOperator,
	value: ECSQLCMDValue
};

export class ECSQLCMDSubQuery implements ECSQLGeneratable {
	public readonly key: string;
	public readonly otherTable: string;
	public readonly otherKey: string;
	public readonly value: ECSQLCMDValue;

	public constructor(key: string, otherTable: string, otherKey: string, value: ECSQLCMDValue) {
		this.key = key;
		this.otherTable = otherTable;
		this.otherKey = otherKey;
		this.value = value;
	}

	public generate(): string {

		return `${this.key} IN (SELECT ${this.otherKey} FROM ${this.otherTable} WHERE ${this.otherKey}=${escapeValue(this.value)}`;

	}
}

export class ECSQLCMDQuery implements ECSQLGeneratable {

	private condition: ECSQLCMDQueryCondition | undefined;
	private items: ECArrayList<ECSQLCMDQueryItems | ECSQLCMDQuery | ECSQLCMDSubQuery> = new ECArrayList<ECSQLCMDQueryItems | ECSQLCMDQuery | ECSQLCMDSubQuery>();

	public where(key: string, operator: ECSQLCMDOperator, value: ECSQLCMDValue): ECSQLCMDQuery {

		this.items.add({key, operator, value});
		return this;

	}

	public whereThese(query: ECSQLCMDQuery): ECSQLCMDQuery {

		this.items.add(query);
		return this;

	}

	public whereKeyIsValueOfQuery(key: string, otherTable: string, otherKey: string, value: ECSQLCMDValue): ECSQLCMDQuery {

		this.items.add(new ECSQLCMDSubQuery(key, otherTable, otherKey, value));
		return this;

	}

	public generate(): string {

		const parts: string[] = [];

		this.items.forEach((item: ECSQLCMDQueryItems | ECSQLCMDQuery | ECSQLCMDSubQuery) => {

			if (item instanceof ECSQLCMDQuery || item instanceof ECSQLCMDSubQuery) parts.push(item.generate());
			else parts.push(item.key + item.operator + escapeValue(item.value));

		});

		const command: string = parts.join(` ${this.condition} `);
		return `(${command})`;

	}


	private static builder(condition: ECSQLCMDQueryCondition): ECSQLCMDQuery {

		const q: ECSQLCMDQuery = new ECSQLCMDQuery();
		q.condition = condition;

		return q;

	}

	public static and(): ECSQLCMDQuery { return this.builder("AND"); }
	public static or(): ECSQLCMDQuery { return this.builder("OR"); }


}
