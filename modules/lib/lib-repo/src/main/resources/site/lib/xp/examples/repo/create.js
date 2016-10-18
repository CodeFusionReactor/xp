var repoLib = require('/lib/xp/repo.js');
var assert = require('/lib/xp/assert');

// BEGIN
// Creates a repository with default configuration
var result1 = repoLib.create({
    id: 'test-repo'
});

log.info('Repository created with id ' + result1.id);
// END

// BEGIN
// Creates a repository with checks disabled
var result2 = repoLib.create({
    id: 'test-repo2',
    settings: {
        //TODO
    }
});

log.info('Repository created with id ' + result2.id);
// END

// BEGIN
// First repository created.
var expected1 = {
    "id": "test-repo",
    settings: {
        //TODO
    }
};
// END
assert.assertJsonEquals(expected1, result1);

var expected2 = {
    "id": "test-repo2",
    settings: {
        //TODO
    }
};
assert.assertJsonEquals(expected2, result2);