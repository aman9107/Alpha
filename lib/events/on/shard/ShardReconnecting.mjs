export default (client, id) => {
    console.log(`[shard#${id}] :: reconnecting :: [${client.util.time}]`);
};
