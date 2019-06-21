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

import { ECSQLCMD, ECSQLCMDQuery } from "../index";

describe("Select Queries", () => {

	test("Base Query", () => {

		const cmd: ECSQLCMD = ECSQLCMD
			.select()
			.from("tab");

		const realCmd: string = `SELECT * FROM tab;`;

		expect(cmd.generate()).toEqual(realCmd);

	});

	test("Limiting", () => {

		const cmd: ECSQLCMD = ECSQLCMD
			.select()
			.from("tab")
			.limit(12);

		const realCmd: string = `SELECT * FROM tab LIMIT 12;`;

		expect(cmd.generate()).toEqual(realCmd);

	});

	test("Sorting", () => {

		const cmd: ECSQLCMD = ECSQLCMD
			.select()
			.from("tab")
			.sort("foo", "<");

		const realCmd: string = `SELECT * FROM tab ORDER BY foo ASC;`;

		expect(cmd.generate()).toEqual(realCmd);

	});

	test("Sorting & Limiting", () => {

		const cmd: ECSQLCMD = ECSQLCMD
			.select()
			.from("tab")
			.sort("foo", "<")
			.limit(12);

		const realCmd: string = `SELECT * FROM tab ORDER BY foo ASC LIMIT 12;`;

		expect(cmd.generate()).toEqual(realCmd);

	});

	test("Conditionals", () => {

		const cmd: ECSQLCMD = ECSQLCMD
			.select()
			.from("tab")
			.where(ECSQLCMDQuery
				.and()
				.where("key1", "=", "hi")
				.where("key2", "<=", 10)
			);

		const realCmd: string = `SELECT * FROM tab WHERE (key1='hi' AND key2<=10);`;

		expect(cmd.generate()).toEqual(realCmd);

	});

	test("Nested Conditional", () => {

		const cmd: ECSQLCMD = ECSQLCMD
			.select()
			.from("tab")
			.where(ECSQLCMDQuery
				.or()
				.whereThese(ECSQLCMDQuery
					.and()
					.where("age", ">", 18)
					.where("age", "<", 21)
				)
				.where("age", "=", 16)
			);

		const realCmd: string = `SELECT * FROM tab WHERE ((age>18 AND age<21) OR age=16);`;

		expect(cmd.generate()).toEqual(realCmd);

	});

	test("Multi Layered Nested Conditional", () => {

		const cmd: ECSQLCMD = ECSQLCMD
			.select()
			.from("tab")
			.where(ECSQLCMDQuery
				.or()
				.whereThese(ECSQLCMDQuery
					.and()
					.where("age", ">=", 18)
					.where("age", "<=", 21)
					.whereThese(
						ECSQLCMDQuery
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

		const realCmd: string = `SELECT * FROM tab WHERE ((age>=18 AND age<=21 AND (gender=true OR isCool!=false)) OR (age>=13 AND age<=16));`;

		expect(cmd.generate()).toEqual(realCmd);

	});

});

describe("Delete Queries", () => {

});

describe("Insert Queries", () => {

});

describe("Update Queries", () => {

});