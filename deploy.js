require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');

const commands = [];
const commandFiles = fs.readdirSync('./interactions/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./interactions/commands/${file}`);
	commands.push(command.data.toJSON());
}
const contextFiles = fs.readdirSync("./interactions/contexts/").filter((file) => file.endsWith(".js"));

for (const file of contextFiles) {
	const contexts = require(`./interactions/contexts/${file}`);
	commands.push(contexts.data.toJSON());
}

const rest = new REST({version: '10'}).setToken(process.env['TOKEN']);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');
		await rest.put(
			Routes.applicationGuildCommands(process.env['CLIENT_ID'], process.env['GUILD_ID']),
			{ body: [] },
		);
		await rest.put(
			Routes.applicationCommands(process.env['CLIENT_ID']),
			{ body: [] },
		);
		await rest.put(
			Routes.applicationCommands(process.env['CLIENT_ID']),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
