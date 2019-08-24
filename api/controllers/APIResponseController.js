const DBController = require("../controllers/ImSearchController");

exports.SendNewImg = function (req,res) {
    DBController.GetImg(req.params.match).then(([ImgPath,ImgName]) => {
        res.status(200).sendFile(ImgPath);
    }).catch(err => {
        console.log(err);
        res.status(400).send("Whoops! Looks like there was an error.")
    });
};