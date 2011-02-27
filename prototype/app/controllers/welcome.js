module.exports = function (env) {
    var welcome = env.templates.welcome;
    return function (req, res, next) {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end(welcome());
    };
};
