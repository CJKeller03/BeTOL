
'use strict';

const path = require("path");

module.exports = function(app) {

    const controller = require("../controllers/APIResponseController");

    app.route("/")
        .get((req,res) => {res.status(200).send("Thanks!");})

    app.route("/api/tag")
        .get(controller.SendNewImg)
        .post(controller.SaveTagData)

    app.route("/api/test")
        .get((req,res) => {res.sendFile(path.resolve('TestForm.html'))})
};