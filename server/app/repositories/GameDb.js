const Game = require('../models/Game');
const mongodb = require('mongodb');

exports.getAll = async function () {
    return Game.find().select('-__v').lean().exec();
};

exports.getByName = async function (name) {
    let regex = new RegExp(`${name}`, "i");
    return Game.find({"name": {$regex: regex}}).select('-__v -_id -userId -createdAt -updatedAt').lean().exec();
};

exports.getByExactName = async function (name) {
    return Game.findOne({name});
};

exports.getById = async function (id) {
    return Game.findOne({_id: new mongodb.ObjectID(id)}).select('-__v').lean().exec();
};

exports.createGame = async function (data, userId) {
    let {name, dateReleased, publisherId, consoleId} = data;
    const newGame = new Game({
        name,
        userId,
        consoleId,
        publisherId,
        dateReleased
    });
    await newGame.save();
    return newGame;
};

exports.deleteById = async function (id) {
    return await Game.deleteOne({_id: new mongodb.ObjectID(id)}).select('-__v');
};
