module.exports = {
	name: 'interactionCreate',
	async execute(interaction, client) {
		if (interaction.isChatInputCommand()) {
			const command = client.slashCommands.get(interaction.commandName);
			if (!command) return;
			try {
				await command.execute(interaction, client);
			} catch (error) {
				console.error(error);
				await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
			}
		} else if (interaction.isMessageContextMenuCommand()) {
			const context = client.contextMenus.get(interaction.commandName);
			if (!context) return;
			await context.run(interaction);
		} else if (interaction.isAutocomplete()) {
			const autocomplete = client.autocompletes.get(interaction.commandName);
			await autocomplete.execute(interaction, client);
		} else if (interaction.isModalSubmit()) {
			const modal = client.modals.get(interaction.customId);
			await modal.execute(interaction, client);
		}
	}
};
