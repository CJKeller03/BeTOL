const DBController = require("../controllers/ImSearchController");

const SessionDuration = 25 * 1000;

exports.SendNewImg = function (req,res) {
    var Match = undefined;

    if (req.session.isNew) {
        console.log("New session");
        try {
            Match = DBController.GetRandomMatch()
        } catch (err) {
            console.log(err);
            res.status(500).send(
                "Whoops! Unfortunately, we weren't able to find an available match. Please try again later."
            )
            return
        }
        req.session.Match = Match;
    } else {
        console.log("old session");
        Match = req.session.Match;
        req.session.maxAge = SessionDuration;
    }

    DBController.GetImg(Match).then(([ImgPath,ImgName]) => {
        console.log(ImgName);
        res.status(200).sendFile(ImgPath);
    }).catch(err => {
        console.log(err);
        res.status(400).send("Whoops! Looks like there was an error.")
    });
};

exports.SaveTagData = function (req,res) {
    if (req.session.isNew) {
        res.redirect("/api/tag");
    } 

    //res.redirect("/api/tag");
}