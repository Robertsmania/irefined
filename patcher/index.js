const patchAsar = require('patch-asar')
const path = require('path')

const inputAsar = path.join(__dirname, "app.asar")
const patchFolder = path.join(__dirname, "patches")

patchAsar(inputAsar, patchFolder).then(()=>{
	console.log("Successfully Patched .asar archive in place")
}).catch(error => {
	console.log(error)
})