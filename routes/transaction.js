const express = require('express');
const router = express.Router();
const TransactionItem = require('../models/Transaction');
const User = require('../models/User');

const isLoggedIn = (req, res, next) => {
	if (res.locals.loggedIn) {
		next();
	} else {
		res.redirect('/login');
	}
};

router.get('/transaction', isLoggedIn, async (req, res) => {
	const sortBy = req.query.sortBy;
	const sortOptions = {
		category: {
			Category: 1
		},
		date: {
			Date: 1
		},
		amount: {
			Amount: 1
		},
		description: {
			Description: 1
		},
	};

	const items = await TransactionItem
		.find({
			userId: req.user._id
		})
		.sort(sortOptions[sortBy] || {});

	res.render('transaction', {
		items
	});
});

router.post('/transaction', isLoggedIn, async (req, res) => {
	const transaction = new TransactionItem({
		Description: req.body.description,
		Amount: req.body.amount,
		Category: req.body.category,
		Date: req.body.date,
		userId: req.user._id,
	});

	await transaction.save();
	res.redirect('/transaction');
});

router.get('/transaction/remove/:itemId', isLoggedIn, async (req, res) => {
	await TransactionItem.deleteOne({
		_id: req.params.itemId
	});
	res.redirect('/transaction');
});

router.get('/transaction/transactionedit/:itemId', isLoggedIn, async (req, res) => {
	const item = await TransactionItem.findById(req.params.itemId);
	res.locals.item = item;
	res.render('transactionupdate');
});

router.post('/transaction/update', isLoggedIn, async (req, res) => {
	const {
		itemId,
		Description,
		Category,
		Amount,
		Date
	} = req.body;
	await TransactionItem.findOneAndUpdate({
		_id: itemId
	}, {
		$set: {
			Description,
			Category,
			Amount,
			Date
		}
	});
	res.redirect('/transaction');
});

router.get('/transaction/groupby', isLoggedIn, async (req, res) => {
	const results = await TransactionItem.aggregate([{
		$group: {
			_id: "$Category",
			total: {
				$sum: "$Amount"
			}
		}
	}, ]);

	res.render('groupedTransactions', {
		results
	});
});

module.exports = router;