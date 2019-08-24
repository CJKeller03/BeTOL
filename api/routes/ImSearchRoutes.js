
'use strict';

module.exports = function(app) {

    const controller = require("../controllers/ImSearchController");
    
    //var MatchPermission = req.cookie.Match
    /*
    if (cookie == undefined) {
        app.route("/*")
            .get((req, res) => {
                res.cookie()
                
            })
            .post((req, res) => {
                res.status(403).send("Sorry, you can't post match data without permission.")
            })

    }
    */
   
    app.route("/api/:match")
        .get(controller.GetMatch)

};