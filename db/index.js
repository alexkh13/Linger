module.exports = {
    getAdapter: function(name) {
        return require('./adapter/' + name);
    }
};