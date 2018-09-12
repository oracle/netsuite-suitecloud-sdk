module.exports = {
    // https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
    COLORS : {
        'CYAN' : '\x1b[36m',
        'RED' : '\x1b[31m',
        'GREEN' : '\x1b[32m' 
    },
    println : function(message, color){
        if(color){
            console.log(`${color}%s\x1b[0m`, message);
        }else{
            console.log(message);
        }
        
    }
}