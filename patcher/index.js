const process = require('process')
const patchAsar = require('patch-asar')
const path = require('path')
const fs = require('fs')

const pf86 = process.env['ProgramFiles(x86)']
const irPath = path.join(pf86, "/iRacing/ui/resources/")
const inputAsar = path.join(irPath, "app.asar")
const patchFolder = path.join(__dirname, "patches")

if (!fs.existsSync(irPath + '.irefined')) {

	fs.openSync(irPath + '.irefined', 'w');

	if (!fs.existsSync(inputAsar + '.bak')) {
		console.log("Backing up app.asar")
		fs.copyFile(inputAsar, inputAsar + '.bak', (err) => {
			if (err) throw err;
		});
	}

	console.log("Installing iRefined...")

	fs.cpSync(path.join(process.cwd(), "iref"), path.join(irPath, "iref"), {recursive: true});

	patchAsar(inputAsar, patchFolder).then(() => {
		console.log("Success!")
	}).catch(error => {
		console.log(error)
	})

} else {
	console.log("iRefined already installed!")
}
