'use strict';

const path = require('path');
const {MANIFEST_XML} = require("../ApplicationConstants")
const FileUtils = require('../utils/FileUtils');
const xml2js = require('xml2js')

module.exports = {

    getProjectType : () => {
        const manifestString = FileUtils.readAsString(path.join("./", MANIFEST_XML))

        let projectType = ''   
        let parser = new xml2js.Parser();
        parser.parseString(manifestString, function (err, result) {
            projectType = result.manifest.$.projecttype;
        });

        return projectType
    }
        
    

	
};
