const EventEmitter = require('events').EventEmitter;
const FileUtils = require('./utils/FileUtils');
const ApplicationConstants = require('./ApplicationConstants');
const path = require('path');

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
        this._encyptionKey = obj.encryptionKey;
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

    getEncryptionKey() {
        return this._encyptionKey;
    }

    isAccountSetup(){
        return this._isAccountSetup;
    }
}

var accountDetails = new AccountDetails();
accountDetails.initializeFromFile(ApplicationConstants.ACCOUNT_DETAILS_FILENAME);

module.exports = {
    EventEmitter : new EventEmitter(),
    SDKFilePath : path.join(__dirname, ApplicationConstants.SDF_SDK_PATHNAME),
    CurrentAccountDetails : accountDetails,
};