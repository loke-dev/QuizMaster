/**
 * This callback function sends request to the database
 * @param config
 * @param callback
 */
function request(config, callback) {

    config.url = config.url || "";
    config.method = config.method || "post";
    config.contenttype = config.contenttype || "application/json";
    config.answer = config.answer || null;

    var req = new XMLHttpRequest();

    req.addEventListener("load", function() {

        if (req.status > 400) {
            callback(req.status);
        }

        callback(null, req.responseText);

    });

    req.open(config.method, config.url);
    req.setRequestHeader("Content-Type", config.contenttype);
    req.send(config.answer);
}

module.exports = {
    request: request
};
