require('underscore');

var sys = require('sys');

function handle(ctx, mapping, args) {
    return _.reduce(args, {mapping: mapping, args: args}, function(memo, arg) {
        if(memo.broken || memo.finished) return memo;

        var test = memo.mapping[arg],
          rest = _.rest(memo.args);
        if(rest && _.isUndefined(test)) {
            return {broken: true, arg: arg};
        } else if(_.isFunction(test)) {
            test.apply(ctx, rest);
            return {finished: true};
        } else {
            return {mapping:test, args: rest};
        }
    });
}

exports.handle = function(ctx, mapping, args) {
    if(!mapping) {
        sys.puts('No command line handler found.');
        return;
    }
    var result = handle(ctx, mapping, args);
    if(result.broken) {
        sys.puts('No command line handler found ("' + result.arg + '").');
    } else if(!result.finished) {
        sys.puts('More paramaters should be supplied in command.');
    }
}
