'use strict';

const fs = require("fs");
const path = require('path');
const mv = require("mv");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const DB = path.join(__dirname,"../../MatchData");

const AttemptLimit = 10;
const LockDuration = 30 * 1000; // In milliseconds

/*
mv(path.join(DB,"/Untagged",Match,ImgName), path.join(DB,"/In_Progress",Match,ImgName),{mkdirp:true, clobber:false}, function(err) {
    console.log(err);
})
*/

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
        const ImgPath = Match

        console.log("GetImg: ",Match)

        // Read all images in the folder
        var err,Images = await readdir(ImgPath);

        // Throw error if read failed or if folder is empty
        if (err || Images.length < 2) {
            throw err;
        }

        Images = Images.filter((value,index,arr) => {
            return !(value.includes("Lock")) && !(value.includes("DS"))
        });

        // Sort array of images in ascending order (lowest number first)
        Images.sort((a,b) => {
            return parseInt(a) - parseInt(b);
        })
        
        // Select the smallest number
        const ImgName = Images[0];
        //console.log(ImgName);

        // Return the image path
        return [path.join(Match,ImgName), ImgName.split(".")[0]];
        
    } catch (err) {
        console.log(err);
        throw err;
    };
    
};

exports.GetRandomMatch =  function () {

    //Read the directory and get the files
    const Source = path.join(DB,"/Untagged")

    var Match = undefined

    const dirs = fs.readdirSync(Source, {withFileTypes: true})
    .filter(file => file.isDirectory())
    .map(file => {
        return path.join(Source, file.name);
    });

    console.log(dirs.length);
    
    //for (var i = 0; i < AttemptLimit; i++) {
    while (!Match) {
        
        var CurIndex = randomIndex(dirs.length-1)
        var Location = dirs[CurIndex];
        console.log("Location: ",Location);

        if (fs.existsSync(path.join(Location,"/Lock.json"))) {
            console.log("Has lock file");
            const LockFile = fs.readFileSync(path.join(Location,"/Lock.json"));
            if (new Date(LockFile) < Date.now()) {
                console.log("Lockfile Expired");
                fs.writeFileSync(path.join(Location,"/Lock.json"),new Date(Date.now() + LockDuration).toJSON());
                Match = Location;
                break
            } else {
                dirs.splice(CurIndex,1);
                console.log("Failed, ",dirs.length);
                if (dirs.length < 1) {
                    break
                }
            }
        } else {
            console.log("No lock file");
            fs.writeFileSync(path.join(Location,"/Lock.json"),new Date(Date.now() + LockDuration).toJSON());
            Match = Location;
            break
        }
        
    }

    if (!Match) {
        throw Error("Couldn't find unlocked match");
    } else {
        return Match;
    }
};