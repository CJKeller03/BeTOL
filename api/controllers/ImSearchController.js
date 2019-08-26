'use strict';

const fs = require("fs");
const path = require('path');
const util = require("util");
const rimraf = require("rimraf");

const readdir = util.promisify(fs.readdir);
const writefile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);
const DB = path.join(__dirname,"../../MatchData");

const AttemptLimit = 10;
const LockDuration = 1 * 1000; // In milliseconds

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
    
};

exports.GetRandomMatch =  function () {
    console.log("GetRandomMatch")

    // Set up vars
    const Source = path.join(DB,"/Untagged")

    var Match = undefined

    // Read the source directory and get all of the folders inside
    const dirs = fs.readdirSync(Source, {withFileTypes: true})
    .filter(file => file.isDirectory())
    .map(file => {
        return path.join(Source, file.name);
    });
    
    //for (var i = 0; i < AttemptLimit; i++) {

    // While a match hasn't been selected, loop
    while (!Match) {
        // Select a random index
        var CurIndex = randomIndex(dirs.length-1);

        // Get the path to the folder at that index
        var Location = dirs[CurIndex];
        
        // Check if the folder contains a lock file
        if (fs.existsSync(path.join(Location,"/Lock"))) {

            // Read the lock file
            const LockFile = fs.readFileSync(path.join(Location,"/Lock"));

            // Check if the lock file has expired
            if (new Date(LockFile) < Date.now()) {

                // Reset the lockfile with a new expiry, select this match, and break out of the loop
                fs.writeFileSync(path.join(Location,"/Lock"),new Date(Date.now() + LockDuration).toJSON());
                Match = Location;
                break

            } else {
                // The lock on this match is active. Remove this from the array so it isn't selected again
                dirs.splice(CurIndex,1);
                if (dirs.length < 1) {
                    // Every available folder is locked or unaccessible. Break the loop without selecting a match
                    break
                }
            }
        } else {
            // This folder doesn't contain a lock file. Select this match,
            // create a lock file with the appropriate expiry, and break the loop.

            fs.writeFileSync(path.join(Location,"/Lock"),new Date(Date.now() + LockDuration).toJSON());
            Match = Location;
            break

        }
        
    }

    // Check if a match has been selected
    if (!Match) {
        throw Error("Couldn't find unlocked match");
    } else {
        return Match;
    }
};


exports.SaveTag =  async function (Match, ImgNum, Data, SessionID) {

    Match = path.basename(Match);

    const Source = path.join(DB,"/Untagged");
    const Dest = path.join(DB,"/Complete");

    try {
        if (new Date(fs.readFileSync(path.join(Source,Match,"/Lock"))) < Date.now()) {
            console.warn("Lockfile has expired. Multiple users could edit this match simultaneously.");
        }
    } catch (err) {
        console.log(err);
        throw err;
    }

    fs.mkdir(path.join(Dest,Match), { recursive: true }, (err) => {
        if (err) throw err;
    });

    Data["User"] = SessionID;
    Data["TimeSubmitted"] = new Date(Date.now()).toJSON();

    writefile(path.join(Dest,Match,ImgNum),JSON.stringify(Data)).then(() => {
        console.log("written");
    }).catch((err) => {
        console.log(err);
    })

    const MatchDir = path.join(Source,Match)

    unlink(path.join(MatchDir,ImgNum+".jpg")).then(() => {
        console.log("unlinked");

        const DirLength = fs.readdirSync(path.join(MatchDir)).filter((value,index,arr) => {
            return !(value.includes("Lock")) && !(value.includes("DS"))
        }).length 

        //console.log(DirLength);

        if (DirLength < 1) {
            rimraf(MatchDir, function () { console.log('done'); });
        }

    }).catch((err) => {
        console.log(err);
    });

    return
};