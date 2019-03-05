const publisherDb = require('../repositories/PublisherDb');
const userDb = require('../repositories/UserDb');
const jwtHelper = require('../helpers/JwtHelper');
const logHelper = require('../helpers/LogHelper');
const publisherValidation = require('../validations/PublisherValidation');


exports.getAll = async function (req, res, next) {
    const authData = await jwtHelper.decodeToken(req, res);
    if (authData !== null) {
        let items = [];
        if(authData.role === "admin") {
            items = await publisherDb.getAll();
        }if(authData.role === "user") {
            let user = await userDb.getUser(authData.email);
            items = await publisherDb.getPublishersByUser(user.id);
        }
        for (item of items) {
            let user = await userDb.getById(item.userId);
            delete item.userId;
            item.user = user;
        }
        return res.json(items);
    } else {
        return res.sendStatus(403);
    }
};


exports.getByName = async function (req, res, next) {
    let items = await publisherDb.getByName(req.params.name);
    if (items === null || items === undefined || items.length === 0) {
        await logHelper.createLog(req.params.name + ' publisher not found.', '', "publisher-notfound");
    }
    return res.json(items);
};

exports.createByUser = async function (req, res, next) {
    const authData = await jwtHelper.decodeToken(req, res);
    if (authData !== null) {
        let {email} = authData;
        let error = publisherValidation.validateCreate(req);
        if (error) {
            return res.status(400).send({error})
        }
        let user = await userDb.getUser(email);
        if (user) {
            let newItem = await publisherDb.createPublisher(req.body, user.id);
            await logHelper.createLog(newItem.name + ' publisher created.', email, "publisher-crud");
            return res.status(200).send({message: newItem.name + ' added'});
        } else {
            return res.sendStatus(403);
        }
    } else {
        return res.sendStatus(403);
    }
};

exports.deleteById = async function (req, res, next) {
    const authData = await jwtHelper.decodeToken(req, res);
    let {email} = authData;
    let itemId = req.body.id;
    if (authData !== null && authData.role === "admin") {
        let {email} = authData;
        let error = publisherValidation.validateDelete(req);
        if (error) {
            return res.status(400).send({error})
        }
        let existingItem = await publisherDb.getById(itemId);
        if (existingItem) {
            await publisherDb.deletePublisherById(itemId);
            await logHelper.createLog(existingItem.name + ' publisher deleted.', email, "publisher-crud");
            return res.sendStatus(200);
        } else {
            return res.status(404).send({error: "Console not found"});
        }
    }
    if (authData !== null && authData.role === "user") {
        let error = publisherValidation.validateDelete(req);
        if (error) {
            return res.status(400).send({error})
        }
        let user = await userDb.getUser(email);
        if (user) {
            let ownItem = await publisherDb.getPublisherByUserandId(user._id, itemId);
            if (ownItem) {
                await publisherDb.deletePublisherById(itemId);
                await logHelper.createLog(ownItem.name + ' publisher deleted.', email, "publisher-crud");
                return res.status(200).send({message: ownItem.name + ' deleted'});
            } else {
                return res.sendStatus(403);
            }
        } else {
            return res.sendStatus(403);
        }
    } else {
        return res.sendStatus(403);
    }
};


exports.updateByUser = async function (req, res, next) {
    const authData = await jwtHelper.decodeToken(req, res);
    if (authData !== null) {
        let {email} = authData;
        let user = await userDb.getUser(email);
        if (user) {
            let error = publisherValidation.validateUpdate(req);
            if (error) {
                return res.status(400).send({error})
            }
            let {oldName, name, location, comment} = req.body;
            let item = await publisherDb.getByExactName(oldName);
            if (item) {
                if (name) item.name = name;
                if (location) item.location = location;
                if (comment) item.comment = comment;
                item.save();
                await logHelper.createLog(oldName + ' publisher updated.', email, "publisher-crud");
                return res.status(200).send({message: oldName + ' updated'});
            } else {
                return res.status(404).send({message: oldName + ' not found'});
            }
        } else {
            return res.sendStatus(403);
        }
    } else {
        res.sendStatus(403);
    }
};

exports.updateByAdmin = async function (req, res, next) {
    const authData = await jwtHelper.decodeToken(req, res);
    if (authData !== null && authData.role === "admin") {
        let error = publisherValidation.validateUpdate(req);
        if (error) {
            return res.status(400).send({error})
        }
        let {email} = authData;
        let {oldName, name, location, comment} = req.body;
        let item = await publisherDb.getByExactName(oldName);
        if (item) {
            if (name) item.name = name;
            if (location) item.location = location;
            if (comment) item.comment = comment;
            item.save();
            await logHelper.createLog(oldName + ' publisher updated.', email, "publisher-crud");
            return res.status(200).send({message: oldName + ' updated'});
        } else {
            return res.status(404).send({message: oldName + ' not found'});
        }
    } else {
        res.sendStatus(403);
    }
};
