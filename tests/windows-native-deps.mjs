import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);

// Vite's Windows SSR runner needs file URLs when externalizing native packages.
// This changes test loading only; assertions and the production build stay intact.
export function windowsNativeDependencies(){
  return {name:'test-windows-native-dependencies',enforce:'pre',resolveId(id){
    if(process.platform!=='win32'||id.startsWith('.')||id.startsWith('/')||id.startsWith('@/')||id.startsWith('\0')||id.startsWith('node:')||id.includes(':'))return null;
    try{return {id:pathToFileURL(require.resolve(id)).href,external:true};}catch{return null;}
  }};
}
