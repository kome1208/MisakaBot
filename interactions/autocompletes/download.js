const axios = require('axios');

module.exports = {
    name: 'download',
    execute: async (interaction, client) => {
        const focused = interaction.options.getFocused(true);
        if (focused.name === 'version') {
            const { data } = await axios.get('https://api.github.com/repos/straight-tamago/misaka/releases', {
                headers: {
                    "Accept": "application/vnd.github+json",
                    "Authorization": "Bearer " + process.env['GITHUB_TOKEN'],
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            });
            const list = data.map((release) => ({ name: release.name || release.tag_name, value:`${release.id}` }))
            .filter((release) => (release.name.includes(focused.value) || release.value.includes(focused.value)));
            await interaction.respond(list.slice(0, 25));
        }
    }
}