const DBController = require("../controllers/ImSearchController");

exports.SendNewImg = function (req,res) {
    var Match = undefined;

    //console.log("Age before: ",req.session.maxAge);
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
    }

    //console.log("Age after: ",req.session.maxAge);

    DBController.GetImg(Match).then(([ImgPath,ImgName]) => {
        console.log(ImgName);
        req.session.ImgNum = ImgName;
        res.status(200).sendFile(ImgPath);
    }).catch(err => {
        console.log(err);
        res.status(400).send("Whoops! Looks like there was an error.")
    });
};

exports.SaveTagData = function (req,res) {
    if (req.session.isNew) {
        req.session = null;
        res.redirect("/api/tag");
    } else {
        console.log(req.body);

        DBController.SaveTag(req.session.Match,req.session.ImgNum,req.body,req.session.Id).catch((err) => {
            console.log(err);
        });

        if (req.session.ImgNum < 14) {
            DBController.GetImg(req.session.Match).then(([ImgPath,ImgName]) => {
                console.log(ImgName);
                req.session.ImgNum = ImgName;
                res.status(200).sendFile(ImgPath);
            }).catch(err => {
                console.log(err);
                res.status(400).send("Whoops! Looks like there was an error.")
            });
        } else {
            res.redirect("/")
        }
    }

    //res.redirect("/api/tag");
}