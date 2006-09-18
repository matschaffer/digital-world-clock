/**
 * JSON support library adapted from http://www.json.org/js.html
 *
 * The publicly available library has been altered to provide toJSONString as a global function rather than
 * instance methods added to all objects.
 */
 
/**
 * Parses a JSON string and returns the corresponding object.
 */
function parseJSON(x) {
    try {
        return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
                x.replace(/"(\\.|[^"\\])*"/g, ''))) &&
            eval('(' + x + ')');
    } catch (e) {
        return false;
    }
};

/**
 * Reference for special characters when turning strings into JSON.
 */
var jsonStringReference = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };
        
/**
 * Holds JSON mapping functions for various object types.
 */
var jsonFunctions = {
      array: function (x) {
        var a = ['['], b, f, i, l = x.length, v;
        for (i = 0; i < l; i += 1) {
            v = x[i];
            f = jsonFunctions[typeof v];
            if (f) {
                v = f(v);
                if (typeof v == 'string') {
                    if (b) {
                        a[a.length] = ',';
                    }
                    a[a.length] = v;
                    b = true;
                }
            }
        }
        a[a.length] = ']';
        return a.join('');
    },
    'boolean': function (x) {
        return String(x);
    },
    'null': function (x) {
        return "null";
    },
    number: function (x) {
        return isFinite(x) ? String(x) : 'null';
    },
    object: function (x) {
        if (x) {
            if (x instanceof Array) {
                return jsonFunctions.array(x);
            }
            var a = ['{'], b, f, i, v;
            for (i in x) {
                v = x[i];
                f = jsonFunctions[typeof v];
                if (f) {
                    v = f(v);
                    if (typeof v == 'string') {
                        if (b) {
                            a[a.length] = ',';
                        }
                        a.push(jsonFunctions.string(i), ':', v);
                        b = true;
                    }
                }
            }
            a[a.length] = '}';
            return a.join('');
        }
        return 'null';
    },
    string: function (x) {
        if (/["\\\x00-\x1f]/.test(x)) {
            x = x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                var c = jsonStringReference[b];
                if (c) {
                    return c;
                }
                c = b.charCodeAt();
                return '\\u00' +
                    Math.floor(c / 16).toString(16) +
                    (c % 16).toString(16);
            });
        }
        return '"' + x + '"';
    }  
};

/**
 * Converts an object to a string containing JSON.
 */
function toJSON(thing) {
    return jsonFunctions[typeof thing](thing);
}