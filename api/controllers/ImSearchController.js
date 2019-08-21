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
    console.log(Images[1]);
    return Images[1]; 
    
}

exports.GetRandomMatch = function(req,res) {
    res.set('Index','0');
    var Match = "2019ohcl_qf3m1";
    GetImgPath(Match).then(ImgName => {
        res.status(200).sendFile(path.join(DB,"/Untagged",Match,ImgName));
        mv(path.join(DB,"/Untagged",Match,ImgName), path.join(DB,"/In_Progress",Match,ImgName),{mkdirp:true, clobber:false}, function(err) {
            console.log(err);
        })
    }).catch(err => {
        console.log(err);
    })
    
};