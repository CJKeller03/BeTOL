const DBController = require("../controllers/ImSearchController");

// Send the client a new image to tag based on the "match" value of their session cookie.
exports.SendNewImg = function (req,res) {

    // Set up vars
    var Match = undefined;

    // Check if this is a new client
    if (req.session.isNew) {

        // Client is new (or has cleared their cookies)
        //console.log("New session");
        try {
            // Attempt to find an unlocked match for the client to tag
            Match = DBController.GetRandomMatch()

        } catch (err) {
            // There are no unlocked matches (or there was a system err)
            // Send the client a 500 response and return
            console.log(err);
            res.status(500).send(
                "Whoops! Unfortunately, we weren't able to find an available match. Please try again later."
            )
            return
        }

        // Set the "match" value of the client's session cookie to the match found
        req.session.Match = Match;
    } else {

        // Client is not new. Get the match they are working on from the session cookie
        //console.log("old session");
        Match = req.session.Match;
    }

    //console.log("Age after: ",req.session.maxAge);

    // Get the next image that needs to be tagged for this match
    DBController.GetImg(Match).then(([ImgPath,ImgName]) => {
        //console.log(ImgName);
        // Set the client's "ImgNum" value to the index of the image returned. This will be used later when
        // the client sends the tag data back.
        req.session.ImgNum = ImgName;

        // Send the client a 200 response along with the image.
        res.status(200).sendFile(ImgPath);
    }).catch(err => {
        // Something went wrong when the search controller tried to get the next image.
        // Send the client a 500 response  
        console.log(err);
        res.status(500).send("Whoops! Looks like there was an error.")
    });
};



// Save the tag data the client sends back
exports.SaveTagData = function (req,res) {

    // Check if this is a new client
    if (req.session.isNew) {
        // The client is new. Reset their session (so that the controller that gets called next sets the 
        // session cookie correctly) and redirect them to the correct endpoint.
        
        req.session = null;
        res.redirect("/api/tag");
    } else {
        //console.log(req.body);

        // This is an existing client. Asyncronously send the databse controller the client's current match,
        // the index of the image they just tagged, the tag data, and the client's session id.

        DBController.SaveTag(req.session.Match,req.session.ImgNum,req.body,req.session.Id).catch((err) => {
            // Something went wrong while trying to save the data. Log the err.
            console.log(err);
        });

        // Asyncronously check if this is the last image for the client's current match.
        if (req.session.ImgNum < 14) {
            // This isn't the last image, respond with the next one.
            DBController.GetImg(req.session.Match).then(([ImgPath,ImgName]) => {
                //console.log(ImgName);
                // Set the client's "ImgNum" value to the index of the image returned. This will be used later when
                // the client sends the tag data back.
                req.session.ImgNum = ImgName;

                // Send the client a 200 response along with the image.
                res.status(200).sendFile(ImgPath);
            }).catch(err => {
                // Something went wrong when the search controller tried to get the next image.
                // Send the client a 500 response
                console.log(err);
                res.status(500).send("Whoops! Looks like there was an error.")
            });
        } else {
            // This is the last image for the match. Redirect the client to a different page to thank them and
            // ask if they'd like to tag another match.
            res.redirect("/")
        }
    }

    //res.redirect("/api/tag");
}