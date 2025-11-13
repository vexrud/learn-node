const xlsx = require("node-xlsx");
const CustomError = require("./Error");
const Enum = require("../config/Enum");

class Import {

    constructor() {

    }

    fromExcel(filePath) {
        let workSheets = xlsx.parse(filePath);

        if (!workSheets || workSheets.length == 0) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Invalid Excel format.", "Invalid Excel format.");

        let rows = workSheets[0].data;
        
        if (rows.length == 0) throw new CustomError(Enum.HTTP_CODES.NOT_ACCEPTABLE, "File is empty.", "File is empty");

        return rows;        
    }
}

module.exports = Import;