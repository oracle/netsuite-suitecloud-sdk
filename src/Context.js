const FileUtils = require('./FileUtils');
const ApplicationConstants = require('./ApplicationConstants');

class AccountDetails{

    constructor(){
        this._isAccountSetup = false;
    }

    initializeFromFile(file){
        if (FileUtils.exists(file)) {
            var fileContentJson = FileUtils.read(file);
            this.initializeFromObj(fileContentJson)
        }
    }

    initializeFromObj(obj){
        this._netsuiteUrl = obj.netsuiteUrl;
        this._compId = obj.compId;
        this._email = obj.email;
        this._roleId = obj.roleId;
        this._password = obj.password;
        this._authenticationMode = obj.authenticationMode;
        this._isAccountSetup = true;
    }

    getEmail(){
        return this._email;
    }

    getPassword(){
        return this._password;
    }

    getRoleId(){
        return this._roleId;
    }

    getCompId(){
        return this._compId;
    }

    getNetSuiteUrl(){
        return this._netsuiteUrl;
    }

    getAuthenticationMode(){
        return this._authenticationMode;
    }

    isAccountSetup(){
        return this._isAccountSetup;
    }
}

var accountDetails = new AccountDetails();
accountDetails.initializeFromFile(ApplicationConstants.ACCOUNT_DETAILS_FILENAME);

module.exports = {
    SDKFileName : ApplicationConstants.SDF_JAR_PATHNAME,
    CurrentAccountDetails : accountDetails,
} 