require('dotenv').config();
const fs = require('node:fs');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { Player } = require('discord-player');

const client = new Client(
	{
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.MessageContent
		],
		partials: [
			Partials.Channel,
			Partials.User,
			Partials.GuildMember,
		]
	}
);

client.player = new Player(client);
client.player.extractors.loadDefault();

client.slashCommands = new Collection();
const slashcmdFiles = fs.readdirSync('./interactions/commands').filter(file => file.endsWith('.js'));
for (const file of slashcmdFiles) {
	const command = require(`./interactions/commands/${file}`);
	client.slashCommands.set(command.data.name, command);
}

client.autocompletes = new Collection();
const autocompleteFiles = fs.readdirSync('./interactions/autocompletes').filter(file => file.endsWith('.js'));
for (const file of autocompleteFiles) {
	const command = require(`./interactions/autocompletes/${file}`);
	client.autocompletes.set(command.name, command);
}

client.contextMenus = new Collection();
const contextFiles = fs.readdirSync("./interactions/contexts").filter((file) => file.endsWith(".js"));
for (const file of contextFiles) {
    const context = require(`./interactions/contexts/${file}`);
    client.contextMenus.set(context.data.name, context);
}

client.modals = new Collection();
const modalFiles = fs.readdirSync("./interactions/modals").filter((file) => file.endsWith(".js"));
for (const file of modalFiles) {
    const modal = require(`./interactions/modals/${file}`);
    client.modals.set(modal.id, modal);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

client.login(process.env['TOKEN']);