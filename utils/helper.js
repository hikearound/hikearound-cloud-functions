exports.parseDescription = function (description) {
    if (description.includes('\\n')) {
        description = description.replace(/\\n/g, '\n');

        return exports.truncateText(description, 350);
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

exports.getFirstName = function (name) {
    name = name.split(' ');
    return name[0];
};
