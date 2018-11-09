'use strict';

var utils = require('../utils');
var GenericWorker = require('./GenericWorker');

/**
 * A worker that reads a content from a promised stream and emits chunks.
 * @constructor
 * @param {Promise} streamP the promise of the data to split
 */
function StreamWorker(streamP) {
    GenericWorker.call(this, "StreamWorker");
    var self = this;
    self.stream = null;

    streamP.then(function (stream) {
        self.stream = stream;
        stream.on("data", function (data) {
          self.push({
            data : data,
            meta : {
              percent : 0
            }
          });
        });

        stream.on("end", function () {
          self.end();
        });

        stream.on("error", function (e) {
          self.error(e);
        });
    }, function (e) {
        self.error(e);
    });
}

utils.inherits(StreamWorker, GenericWorker);

/**
 * @see GenericWorker.cleanUp
 */
StreamWorker.prototype.cleanUp = function () {
    GenericWorker.prototype.cleanUp.call(this);
    if (this.stream) this.stream.destroy();
    this.stream = null;
};

/**
 * @see GenericWorker.pause
 */
StreamWorker.prototype.pause = function () {
    if(!GenericWorker.prototype.pause.call(this)) {
        return false;
    }

    if (this.stream) this.stream.pause();
    return true;
};

/**
 * @see GenericWorker.resume
 */
StreamWorker.prototype.resume = function () {
    if(!GenericWorker.prototype.resume.call(this)) {
        return false;
    }

    if (this.stream) this.stream.resume();
    return true;
};

module.exports = StreamWorker;
