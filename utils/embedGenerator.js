const { EmbedBuilder } = require('discord.js');

module.exports = {
    tweakEmbed: (packageData) => {
        return new EmbedBuilder()
        .setAuthor({ name:`${packageData.repository.name}`, iconURL:packageData.repository.icon})
        .setTitle(packageData.name)
        .setDescription(packageData.description || null)
        .addFields(
            { name:'Author', value:packageData?.author || packageData.repository.default?.Author?.Label, inline:true },
            { name:'Version', value:packageData.package.version, inline:true },
            { name:'PackageID', value:packageData.packageid, inline:true },
            { name:'Repository', value:`[${packageData.repository.name}](${packageData.repository.link})`, inline:true },
            { name:'Repo Type', value:packageData.repository.type, inline:true },
            { name:'Tweak Page', value:`[Open](https://straight-tamago.github.io/misaka/?repo=${packageData.repository.link}&tweak=${packageData.packageid})`, inline:true }
        )
        .setThumbnail(packageData.Icon || null)
        .setImage(packageData?.Screenshot?.at(0) || null)
        .setColor('Random');
    }
}