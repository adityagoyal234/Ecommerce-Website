//this method contains the path of the main file that is index.js

import path from 'path';

const mainModuleFilePath = process.argv[1];
const absoluteMainModuleDirectory = path.dirname(mainModuleFilePath);

export default absoluteMainModuleDirectory;
