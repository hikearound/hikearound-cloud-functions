exports.parseDescription = function (description) {
    if (description.includes('\\n')) {
        return description.replace(/\\n/g, '\n');
    }
    return description;
};

exports.truncateText = function (text, truncationLength) {
    if (truncationLength == null) {
        truncationLength = 150;
    }

    if (text.length > truncationLength) {
        return `${text.substring(0, truncationLength)}...`;
    }

    return text;
};
