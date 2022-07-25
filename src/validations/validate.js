const urlRegex = (value) => {
    let urlRegex = /^(?:(?:(?:https?|http):)?\/\/.*\.(?:png|gif|webp|com|in|org|co|co.in|net|jpeg|jpg))/i;
    if (urlRegex.test(value))
        return true;
}



module.exports = {urlRegex}