/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
	/*
	 * ----[EXAMPLE TEST]----
	 * Each test should completely test the response of the API end-point including response status code!
	 */
	test("#example Test GET /api/books", function (done) {
		chai
			.request(server)
			.get("/api/books")
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.isArray(res.body, "response should be an array");
				assert.property(
					res.body[0],
					"commentcount",
					"Books in array should contain commentcount"
				);
				assert.property(
					res.body[0],
					"title",
					"Books in array should contain title"
				);
				assert.property(
					res.body[0],
					"_id",
					"Books in array should contain _id"
				);
				done();
			});
	});
	/*
	 * ----[END of EXAMPLE TEST]----
	 */

	suite("Routing tests", function () {
		suite(
			"POST /api/books with title => create book object/expect book object",
			function () {
				test("Test POST /api/books with title", function (done) {
					chai
						.request(server)
						.post("/api/books")
						.send({ title: "Functional test 1" })
						.end((err, res) => {
							assert.equal(res.status, 200);
							assert.isObject(res.body, "response should be an object");
							assert.property(res.body, "_id", "book object should have _id");
							assert.property(
								res.body,
								"title",
								"book object should have title"
							);
							done();
						});
				});

				test("Test POST /api/books with no title given", function (done) {
					chai
						.request(server)
						.post("/api/books")
						.send({ title: "" })
						.end((err, res) => {
							assert.equal(res.status, 200);
							assert.equal(res.text, "missing required field title");
							done();
						});
				});
			}
		);

		suite("GET /api/books => array of books", function () {
			test("Test GET /api/books", function (done) {
				chai
					.request(server)
					.get("/api/books")
					.end((err, res) => {
						assert.equal(res.status, 200);
						assert.isArray(res.body, "response should be an array");
						assert.property(res.body[0], "commentcount");
						assert.property(res.body[0], "title");
						assert.property(res.body[0], "_id");
						done();
					});
			});
		});

		suite("GET /api/books/[id] => book object with [id]", function () {
			test("Test GET /api/books/[id] with id not in db", function (done) {
				chai
					.request(server)
					.get("/api/books/invalid_id_of_characters")
					.end((err, res) => {
						assert.equal(res.status, 200);
						assert.equal(res.text, "no book exists");
						done();
					});
			});

			test("Test GET /api/books/[id] with valid id in db", function (done) {
				chai
					.request(server)
					.post("/api/books")
					.send({ title: "Test book object with [id]" })
					.end((err, res) => {
						chai
							.request(server)
							.get(`/api/books/${res.body._id}`)
							.end((err, res) => {
								assert.equal(res.status, 200);
								assert.isObject(res.body, "response should be an object");
								assert.property(res.body, "comments");
								assert.property(res.body, "commentcount");
								assert.property(res.body, "title");
								assert.property(res.body, "_id");
								done();
							});
					});
			});
		});

		suite(
			"POST /api/books/[id] => add comment/expect book object with id",
			function () {
				test("Test POST /api/books/[id] with comment", function (done) {
					chai
						.request(server)
						.post("/api/books")
						.send({ title: "Test book object with comment" })
						.end((err, res) => {
							chai
								.request(server)
								.post(`/api/books/${res.body._id}`)
								.send({ _id: res.body._id, comment: "Functional test comment" })
								.end((err, res) => {
									assert.equal(res.status, 200);
									assert.isObject(res.body, "response should be an object");
									assert.property(res.body, "comments");
									assert.property(res.body, "commentcount");
									assert.property(res.body, "title");
									assert.property(res.body, "_id");
									done();
								});
						});
				});

				test("Test POST /api/books/[id] without comment field", function (done) {
					chai
						.request(server)
						.post("/api/books/invalid_id_of_characters")
						.send({ _id: "invalid_id_of_characters", comment: "" })
						.end((err, res) => {
							assert.equal(res.status, 200);
							assert.equal(res.text, "missing required field comment");
							done();
						});
				});

				test("Test POST /api/books/[id] with comment, id not in db", function (done) {
					chai
						.request(server)
						.post("/api/books")
						.send({ title: "Test book object with comment" })
						.end((err, res) => {
							chai
								.request(server)
								.delete(`/api/books/invalid_id`)
								.end((err, res) => {
									assert.equal(res.status, 200);
									assert.equal(res.text, "no book exists");
									done();
								});
						});
				});
			}
		);

		suite("DELETE /api/books/[id] => delete book object id", function () {
			test("Test DELETE /api/books/[id] with valid id in db", function (done) {
				chai
					.request(server)
					.post("/api/books")
					.send({ title: "Test book to delete" })
					.end((err, res) => {
						chai
							.request(server)
							.delete(`/api/books/${res.body._id}`)
							.send({ _id: res.body._id })
							.end((err, res) => {
								assert.equal(res.status, 200);
								assert.equal(res.text, "delete successful");
								done();
							});
					});
			});

			test("Test DELETE /api/books/[id] with id not in db", function (done) {
				chai
					.request(server)
					.delete("/api/books/invalid_id_of_characters")
					.send({ _id: "invalid_id_of_characters" })
					.end((err, res) => {
						assert.equal(res.status, 200);
						assert.equal(res.text, "no book exists");
						done();
					});
			});
		});
	});
});
