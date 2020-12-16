"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writeFileAsync = exports.statAsync = exports.readFileAsync = exports.closeAsync = exports.openAsync = exports.writeAsync = exports.readAsync = void 0;

var _util = require("util");

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var readAsync = (0, _util.promisify)(_fs.default.read);
exports.readAsync = readAsync;
var writeAsync = (0, _util.promisify)(_fs.default.write);
exports.writeAsync = writeAsync;
var openAsync = (0, _util.promisify)(_fs.default.open);
exports.openAsync = openAsync;
var closeAsync = (0, _util.promisify)(_fs.default.close);
exports.closeAsync = closeAsync;
var readFileAsync = (0, _util.promisify)(_fs.default.readFile);
exports.readFileAsync = readFileAsync;
var statAsync = (0, _util.promisify)(_fs.default.stat);
exports.statAsync = statAsync;
var writeFileAsync = (0, _util.promisify)(_fs.default.writeFile);
exports.writeFileAsync = writeFileAsync;