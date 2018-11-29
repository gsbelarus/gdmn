import path from 'path';

function getRelativePath(rootPath) {
  return function(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [rootPath].concat(args));
  };
}

const getRootRelativePath = getRelativePath(path.resolve(__dirname, '../../'));

export { getRelativePath, getRootRelativePath };
