
'use strict';

module.exports = function(app) {

    const controller = require("../controllers/ImSearchController");

    app.route("/test")
        .get(controller.GetRandomMatch)

};