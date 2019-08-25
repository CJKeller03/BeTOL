
'use strict';

module.exports = function(app) {

    const controller = require("../controllers/APIResponseController");

    app.route("/api/tag")
        .get(controller.SendNewImg)
        .post(controller.SaveTagData)

};