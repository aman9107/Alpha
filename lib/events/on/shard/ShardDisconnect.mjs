export default (client, event, id) => {
    console.log(`[shard#${id}] :: disconnected :: [${client.util.time}]`);
    console.info([event]);
};
