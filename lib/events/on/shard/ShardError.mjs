export default (client, err, id) => {
    console.log(`[shard#${id}] :: errored :: [${client.util.time}]`);
    console.error([err.stack || err.message]);
};
