var jsonObject = {"bindings": [
        {"ircEvent": 1, "method": "newURI", "regex": "^http://.*"},
        {"ircEvent": 2, "method": "deleteURI", "regex": "^delete.*"},
        {"ircEvent": 3, "method": "randomURI", "regex": "^random.*"}
    ]
};

var jsonString = '{"bindings":[{"ircEvent":1,"method":"newURI","regex":"^http://.*"},{"ircEvent":2,"method":"deleteURI","regex":"^delete.*"},{"ircEvent":3,"method":"randomURI","regex":"^random.*"}]}';

function testToJSON() {
    test = toJSON(jsonObject);
    assert("Generated JSON string wasn't equal to the expected value.", (test == jsonString));
}

function testParseJSON() {
    test = parseJSON(jsonString);
    assert("", (toJSON(test) == toJSON(jsonObject)));
}