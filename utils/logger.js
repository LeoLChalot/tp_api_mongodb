import chalk from 'chalk';

/* 
 * Logger utility for logging messages to the console with different colors and formats.
 * @module utils/logger
 * @requires chalk
*/
const Logger = {
	info: message => {
		console.log(`${chalk.blueBright(`[INFO] ${new Date().toLocaleTimeString()}`)} - ${message}`);
	},

	warn: message => {
		console.log(`${chalk.yellow(`[WARN] ${new Date().toLocaleTimeString()}`)} - ${message}`);
	},

	error: message => {
		console.log(`${chalk.magenta(`[ERROR] ${new Date().toLocaleTimeString()}`)} - ${message}`);
	},

	success: message => {
		console.log(
			`${chalk.greenBright(`[SUCCESS] ${new Date().toLocaleTimeString()}`)} - ${message}`
		);
	},
};

export default Logger;
