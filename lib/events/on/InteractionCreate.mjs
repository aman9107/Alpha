export default async (client, i) => {
    for (const [type, interaction] of client.interactions) {
        if (i[type]?.()) {
            try {
                await interaction(client, i);
            }
            catch (err) {
                console.log(`[interaction] :: '${type.slice(2)}' Error :: [${client.util.time}]`);
                console.error([err.stack || err.message]);
            }
        }
    }
};
