const xl = require('excel4node');
const fs = require("fs");
const path = require("path");
const wb = new xl.Workbook();
console.log("before");
function excelFunction (){
    let dir = path.join(__dirname + "\\Player_Stats");
    let dir_file = fs.readdirSync(dir);
    for(let i = 0; i < dir_file.length; i++){
        let team_file = dir_file[i];
        let player_path = path.join(dir, team_file);
        let player_file = fs.readdirSync(player_path);
        for(let j = 0; j < player_file.length; j++){
            let new_dir = path.join(dir, team_file, player_file[j]);
            let data = fs.readFileSync(new_dir, 'utf-8');
            let arr = JSON.parse(data);
            const ws = wb.addWorksheet(player_file[j]);
            const headingColumnNames = [
                "Runs",
                "Bowls",
                "Fours",
                "Sixes",
                "S/R",
                "Match_No",
                "Venue",
                "Date",
                "Rival Team"
            ]
            //Write Column Title in Excel file
            let headingColumnIndex = 1;
            headingColumnNames.forEach(heading => {
                ws.cell(1, headingColumnIndex++)
                    .string(heading)
            });
            //Write Data in Excel file
            let rowIndex = 2;
                arr.forEach( record => {
                    let columnIndex = 1;
                    Object.keys(record ).forEach(columnName =>{
                        ws.cell(rowIndex,columnIndex++)
                            .string(record [columnName])
                    });
                    rowIndex++;
                });
                wb.write(team_file+".xlsx");
            
        
        }
    }
    
}
excelFunction();
console.log("after");

module.exports = {
    excelFunction : excelFunction
}
