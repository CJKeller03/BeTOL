
'use strict';

module.exports = function(app) {

    const controller = require("../controllers/APIResponseController");

    app.route("/api/:match")
        .get(controller.SendNewImg)

};