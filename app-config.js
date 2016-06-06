function getEnvironment() {

    if(process.env.NODE_ENV =="production"){
        return "release";
    }else {
        return "development";
    }
}
var _ENVIRONMENT = getEnvironment();

console.log("_ENVIRONMENT::::"+_ENVIRONMENT);

module.exports = {
    SERVE_PORT:3000,
    _ENVIRONMENT:_ENVIRONMENT,
    MONGOOSE_CONNECTION:"mongodb://localhost:27017/helloworld",
    ROOT_DIR :__dirname,
    DEFAULT_AVATAR :"/public/static/images/avatar0.png"
};