exports.parseDescription = function (description) {
    if (description.includes('\\n')) {
        return description.replace(/\\n/g, '\n');
    }
    return description;
};
