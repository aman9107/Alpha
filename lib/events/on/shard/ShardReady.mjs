export default (client, id, na) => {
    console.log(`[shard#${id}] :: connected :: [${client.util.time}]`);
    if (na instanceof Set)
        console.log(" unavailable Guild", na);
};
