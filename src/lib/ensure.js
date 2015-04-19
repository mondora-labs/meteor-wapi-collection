module.exports = function ensure (error, condition) {
    if (!condition) {
        throw error;
    }
};
