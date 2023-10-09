const { ModalSubmitInteraction, EmbedBuilder } = require('discord.js');
const { Git } = require('../../utils/git');

module.exports = {
    id: 'submit_faq',
    /**
     * 
     * @param {ModalSubmitInteraction} interaction 
     */
    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const git = new Git({
            owner: 'shimajiron',
            repo: 'Misaka_Network',
            branch: 'main'
        });
        const file = await git.getFile('FAQ.json');
        const faq = JSON.parse((await git.getBlob(file.sha)));
        const title = interaction.fields.getTextInputValue('faq_title_input');
        const link = interaction.fields.getTextInputValue('faq_link_input');
        if (faq.find((element) => element.link === link)) return interaction.editReply({ content: 'Already exists' });
        if (link.split('/').at(-3) !== interaction.guildId || !link.match(/discord.com\/channels(\/\d+){3}/)) return interaction.editReply({ content: 'Invalid message link' });
        faq.push({
            title,
            link
        });
        await git.updateRef({
            file,
            content: JSON.stringify(faq, null, 2),
            message: 'Update FAQ.json (via API)'
        });

        const embed = new EmbedBuilder()
        .setTitle('Updated FAQ')
        .setDescription('https://github.com/shimajiron/Misaka_Network/blob/main/FAQ.json');

        await interaction.editReply({ embeds: [embed] });
    }
}
