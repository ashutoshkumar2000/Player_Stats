const cheerio = require("cheerio");
const request = require("request");
const fs = require("fs");
const path = require("path");

const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";



request(url, cb);
function cb (err, resp, html){
    if(err){
        console.log(err);
    }
    else{
        extractHTML(html);
    }
}

function extractHTML(html){
    let selectorTool = cheerio.load(html);
    let viewAllRes = selectorTool(".label.blue-text.blue-on-hover").attr("href");
    viewAllResLink = "https://www.espncricinfo.com/"+viewAllRes;
    getScoreCard(viewAllResLink);
}

function getScoreCard(link){
    request(link, cb);
    function cb(err, resp, html){
        if(err){
            console.log(err);
        }
        else{
            extractScore(html);
        }
    }
}

function extractScore(html){
    let selectorTool = cheerio.load(html);
    let scoreCardEleArr = selectorTool('a[data-hover = "Scorecard"]');
    for(let i = 0; i < scoreCardEleArr.length; i++){
        let scoreCardLink = selectorTool(scoreCardEleArr[i]).attr("href");
        scoreCardLink = "https://www.espncricinfo.com/" + scoreCardLink;
        getPlayerStats(scoreCardLink);
    }
}

function getPlayerStats(link){
    request(link, cb);
    function cb(err, resp, html){
        if(err){
            console.log(err);
        }
        else{
            extractPlayerStat(html);
        }
    }
}


function extractPlayerStat(html){
    let selectorTool = cheerio.load(html);

    /*-----Extract Batsman Information from the scorecard table-----*/
    let PlayerStatElemArr = selectorTool(".table.batsman");

    /*-----Extract Name of the team the player is part of-----*/
    let TeamNameArr = selectorTool("li>strong");

    /*-----Extract Venue, date, match_no etc of the match played-----*/
    let matchInfo = selectorTool(".match-info.match-info-MATCH .description").text().split(",");
    let matchNo = matchInfo[0];
    let venue = matchInfo[1];
    let date = matchInfo[2];

    for(let i = 0; i< PlayerStatElemArr.length; i++){
        let teamName = selectorTool(TeamNameArr[i]).text().replace("innings", "").trim();

        /*-----Extract Name of the rival team-----*/
        let rival = "";
        if(i == 0){
            rival = selectorTool(TeamNameArr[1]).text().replace("innings", "").trim();
        }
        else{
            rival = selectorTool(TeamNameArr[0]).text().replace("innings", "").trim();
        }


        /*-----Extract info about each and every batsman-----*/
        let singleInningBat = selectorTool(PlayerStatElemArr[i]).find("tbody tr");
        for(let j = 0; j < singleInningBat.length-1; j+=2){
            singleInningBatCol = selectorTool(singleInningBat[j]).find("td");

            let name = selectorTool(singleInningBatCol[0]).text().trim();
            name = name.replace("(c)", ""); 
            name = name.replace("†", "");

            let runs = selectorTool(singleInningBatCol[2]).text().trim();
            let bowls = selectorTool(singleInningBatCol[3]).text().trim();
            let fours = selectorTool(singleInningBatCol[5]).text().trim();
            let sixes = selectorTool(singleInningBatCol[6]).text().trim();
            let sr = selectorTool(singleInningBatCol[7]).text().trim();

            /*-----Creation of the folders and JSON Files-----*/
            let dir = path.join(__dirname + "\\Player_Stats", teamName);
            let filePath = path.join(dir, name + ".json");

            if(!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }


            let player = {
                "Runs" : runs,
                "Bowls" : bowls,
                "Fours" : fours,
                "Sixes" : sixes,
                "S/R" : sr,
                "Match_No" : matchNo,
                "Venue": venue,
                "Date" : date,
                "Rival Team" : rival
            };

            if(fs.existsSync(filePath)){
                
                let data = fs.readFileSync(filePath ,'utf-8');               

                    let arr = JSON.parse(data);
                    
                    arr.push(player);
                
                    fs.writeFileSync(filePath, JSON.stringify(arr));
            }
            else{
                let player_1 = [player];
                fs.writeFileSync(filePath, JSON.stringify(player_1));
            }
        }
    }
}




