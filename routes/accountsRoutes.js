const express = require('express');

const db = require('../data/dbConfig');
const { orWhereNotExists } = require('../data/dbConfig');

const router = express.Router();

router.get('/', (req, res) => {
    db('accounts')
    .limit(req.query.limit || 20)
    .orderBy(req.query.sortby || 'id', req.query.sortdir || 'asc')
    .then(accounts => {
        res.status(200).json({ data: accounts });
    })
    .catch(error => {
        console.log(error)
        res.status(500).json({ error: error.message });
    });
});

router.get('/:id', validateAccountId, (req, res) => {
    res.status(200).json({ account: req.account });
});

router.post('/', (req, res) => {
    const account = req.body;
    if (!account.name || !account.budget) {
        res.status(400).json({ message: "Missing required name and budget fields" });
    } else {
        db('accounts')
        .insert(account)
        .returning('id')
        .then(ids => {
            res.status(201).json({ message: `Successfully created new account with id ${ids[0]}`, account: { id: ids[0], ...account } });
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({ error: error.message });
        });
    }
});

router.put('/:id', validateAccountId, (req, res) => {
    const changes = req.body;
    const id = req.params.id;
    
    db('accounts')
    .where({ id })
    .update(changes)
    .then(count => {
        if (count) {
            res.status(200).json({ message: "Updated successfully", account: { id, ...changes } });
        } else {
            res.status(404).json({ message: "You should never get this error" });
        }
    })
    .catch(error => {
        console.log(error)
        res.status(500).json({ error: error.message });
    });
});

router.delete('/:id', validateAccountId, (req, res) => {
    const id = req.params.id;

    db('accounts')
    .where({ id })
    .del()
    .then(count => {
        if (count) {
            res.status(200).json({ message: "Deleted successfully", id });
        } else {
            res.status(404).json({ message: "You should never get this error" });
        }
    })
    .catch(error => {
        console.log(error)
        res.status(500).json({ error: error.message });
    });
});

// id validation

function validateAccountId(req, res, next) {
    db('accounts')
    .where({ id: req.params.id })
    .first()
    .then(account => {
        if (account){
            req.account = account;
            next();
        } else {
            res.status(404).json({ message: `Account with id ${req.params.id} does not exist` })
        }
    })
    .catch(error => {
        console.log(error)
        res.status(500).json({ error: error.message });
    });
}

module.exports = router;