'use strict';

const fs = require("fs");
const path = require('path');
const util = require("util");

const rimraf = util.promisify(require("rimraf"));
const readdir = util.promisify(fs.readdir);
const writefile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);
const DB = path.join(__dirname,"../../MatchData");

const AttemptLimit = 10;
const LockDuration = 1 * 1000; // In milliseconds

//Grabs a random index between 0 and length
function randomIndex(length) {
    return Math.floor(Math.random() * (length));
}

// Get an image from a match folder
exports.GetImg = async function (Match) {
    
    // Create the path
    const ImgPath = Match

    //console.log("GetImg: ",Match)

    // Read all images in the folder
    var err,Images = await readdir(ImgPath);

    // Throw error if read failed or if folder is empty
    if (err || Images.length < 2) {
        throw err;
    }

    // Filter out the lock file and the garbage .DS_Store files that MacOS automatically creates
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

// Get a random untagged match that isn't currently locked.
exports.GetRandomMatch =  function () {
    //console.log("GetRandomMatch")

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
                // The lock is expired. 
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



// Save json data from a client to a folder in the "Complete" directory.
exports.SaveTag =  async function (Match, ImgNum, Data, SessionID) {

    // Get the TBA match key from the path
    Match = path.basename(Match);

    // Set up some convenient path consts
    const Source = path.join(DB,"/Untagged");
    const Dest = path.join(DB,"/Complete");
    const MatchDir = path.join(Source,Match);

    
    if (new Date(fs.readFileSync(path.join(Source,Match,"/Lock"))) < Date.now()) {
        // The lockfile for this match is expired. The client's cookie should have expired before the lock file,
        // but it hasn't. If this occurs, something has gone wrong.  
        console.warn("\x1b[33m%s\x1b[0m","Lockfile has expired. Multiple users could edit this match simultaneously.");
    }
    
    // Create the directory path the data should be saved to. If it already exists, nothing will happen.
    fs.mkdir(path.join(Dest,Match), { recursive: true }, (err) => {
        if (err) throw err;
    });

    // Add the client's session id and the current time to the json file the client submitted, just in case.
    Data["User"] = SessionID;
    Data["TimeSubmitted"] = new Date(Date.now()).toJSON();

    // Stringify the json data and write it to a file with the same name as the image it refers to.
    writefile(path.join(Dest,Match,ImgNum),JSON.stringify(Data)).catch((err) => {
        // Something went wrong while trying to save the data.
        console.log(err);
    })
    
    // Delete the original image from the folder to save disc space.
    unlink(path.join(MatchDir,ImgNum+".jpg")).then(() => {
        //console.log("unlinked");

        // Read how many files (excluding the lock file and garbage .DS_Store files) are left in the match folder.
        const DirLength = fs.readdirSync(path.join(MatchDir)).filter((value,index,arr) => {
            return !(value.includes("Lock")) && !(value.includes("DS"))
        }).length 

        //console.log(DirLength);

        // If there are no images left in the folder, delete it too.
        if (DirLength < 1) {
            rimraf(MatchDir).catch((err) => {
                // rimraf failed to delete the empty match folder.
                console.log(err);
            });
        }

    }).catch((err) => {
        // unlink failed to delete the image.
        console.log(err);
    });
};