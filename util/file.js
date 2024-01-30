const fs = require("fs");

const deleteFile = (filePath) => {
  fs.unlink(filePath.slice(1), (err) => {
    if (err) {
      throw err;
    }
  });
};

exports.deleteFile = deleteFile;
