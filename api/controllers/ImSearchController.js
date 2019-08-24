'use strict';

const fs = require("fs");
const path = require('path');
const mv = require("mv");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const DB = path.join(__dirname,"../../MatchData");

async function GetImgPath(Match) {
    const ImgPath = path.join(DB,"/Untagged",Match);
    var err,Images = await readdir(ImgPath);
    if (err) {
        console.log(err);
    }

    if (Images.length < 2) {
        throw Error ("No images in folder");
    }

    Images.sort((a,b) => {
        return parseInt(a) - parseInt(b)
    })
    console.log(Images[1]);
    return Images[1]; 
    
}

exports.GetMatch = function(req,res) {
    var Match = req.params.match;
    GetImgPath(Match).then(ImgName => {
        res.set("ImgNum",ImgName.split(".")[0])
        res.status(200).sendFile(path.join(DB,"/Untagged",Match,ImgName));
        mv(path.join(DB,"/Untagged",Match,ImgName), path.join(DB,"/In_Progress",Match,ImgName),{mkdirp:true, clobber:false}, function(err) {
            console.log(err);
        })
    }).catch(err => {
        console.log(err);
        res.status(400).send("Image does not exist")
    })
    
};