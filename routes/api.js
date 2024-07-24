/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const mongoDB = require("mongodb");
const mongoose = require("mongoose");
module.exports = function (app) {
	mongoose.connect(process.env.MONGODB_URI);

	const bookSchema = new mongoose.Schema({
		title: { type: String, required: true },
		comments: { type: [String], required: true },
		commentcount: { type: Number, default: 0 },
	});

	const Book = mongoose.model("Book", bookSchema);

	app
		.route("/api/books")
		.get(async function (req, res) {
			//response will be array of book objects
			//json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
			try {
				const books = await Book.find({});
				res.json(books);
			} catch (err) {
				res.send(err);
			}
		})

		.post(async function (req, res) {
			let title = req.body.title;
			console.log("book to save: ", title);
			//response will contain new book object including at least _id and title
			const newBook = new Book({
				title: title,
				comments: [],
				commentcount: 0,
			});

			if (!title) {
				res.send("missing required field title");
				return;
			}

			try {
				const doc = await newBook.save();
				if (!doc) {
					console.log("No book saved");
					res.send("no book saved");
				}
				console.log("Saved book: ", doc.title);
				res.json({ _id: doc._id, title: doc.title });
			} catch (err) {
				console.log("Catch, Error saving book: ", err);
			}
		})

		.delete(async function (req, res) {
			//if successful response will be 'complete delete successful'
			try {
				const deletedBooks = await Book.deleteMany({});
				if (!deletedBooks) {
					console.log("No deleted books");
					res.send("No deleted books");
				}
				console.log("Deleted all books");
				res.send("complete delete successful");
			} catch (err) {
				console.log("Catch, Error deleting books: ", err);
			}
		});

	app
		.route("/api/books/:id")
		.get(async function (req, res) {
			let bookid = req.params.id;
			//json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
			try {
				const book = await Book.findById(bookid);
				if (!book) {
					console.log("Error getting book");
					res.send("no book exists");
					return;
				}
				res.json(book);
			} catch (err) {
				if (err.name === "CastError") {
					res.send("no book exists");
					return;
				}
				console.log("Catch, Error fetching book: ", err);
			}
		})

		.post(async function (req, res) {
			let bookid = req.params.id;
			let comment = req.body.comment;
			//json res format same as .get

			if (!comment) {
				res.send("missing required field comment");
				return;
			}

			try {
				const updatedBook = await Book.findByIdAndUpdate(
					bookid,
					{ $push: { comments: comment }, $inc: { commentcount: 1 } },
					{ new: true }
				);
				if (!updatedBook) {
					console.log("couldn't find updated book");
					res.send("no book exists");
					return;
				}
				console.log("updated book");
				res.json(updatedBook);
			} catch (err) {
				if (err.name === "CastError") {
					res.send("no book exists");
					return;
				}
				console.log("Catch, Error updating book: ", err);
			}
		})

		.delete(async function (req, res) {
			let bookid = req.params.id;
			//if successful response will be 'delete successful'
			try {
				const deletedBook = await Book.findByIdAndDelete(bookid);
				if (!deletedBook) {
					console.log("couldn't find deleted book");
					res.send("no book exists");
					return;
				}
				console.log("Deleted book");
				res.send("delete successful");
			} catch (err) {
				if (err.name === "CastError") {
					res.send("no book exists");
					return;
				}
				console.log("Catch, Error deleting book: ", err);
			}
		});
};
