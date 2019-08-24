'use strict';

const fs = require("fs");
const path = require('path');
const mv = require("mv");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const DB = path.join(__dirname,"../../MatchData");

function GetUserData (req,res) {
    if (req.session.isNew) {
        
    }
}

//Grabs a random index between 0 and length
function randomIndex(length) {
    return Math.floor(Math.random() * (length));
}

exports.GetMatch = async function () {

    console.log("GetMatch");

};

exports.GetImg = async function (Match) {
    // Get an image from a match folder
    try {
        // Create the path
        const ImgPath = path.join(DB,"/Untagged",Match);

        // Read all images in the folder
        var err,Images = await readdir(ImgPath);

        // Throw error if read failed or if folder is empty
        if (err || Images.length < 2) {
            throw err;
        }

        // Sort array of images in ascending order (lowest number first)
        Images.sort((a,b) => {
            return parseInt(a) - parseInt(b);
        })
        
        // Select the smallest number
        const ImgName = Images[1];
        //console.log(ImgName);

        // Return the image path
        return [path.join(DB,"/Untagged",Match,ImgName), ImgName.split(".")[0]];
        
    } catch (err) {
        console.log(err);
        throw err;
    };
    
};

exports.GetRandomMatch =  function () {

    //Read the directory and get the files
    const Source = path.join(__dirname,"/MatchData/Untagged")

    var Match = undefined

    while (!Match) {
        const dirs = fs.readdirSync(Source)
        .map(file => {
            return path.join(Source, file);
        });

        var Match = (dirs[randomIndex(dirs.length-1)])

        /*
        if (fs.existsSync(path.join(Match,"/Lock.json"))) {
            const LockFile = JSON.parse(fs.readfileSync(Match))
            if (LockFile["Expires"] == "Past") {
                console.log("Lockfile Expired")
            }
        }
        */
    }
    //Add the file to the array and object
    return Match;
}