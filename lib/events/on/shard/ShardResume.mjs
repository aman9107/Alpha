export default (client, id, events) => {
    console.log(`[shar#${id}] :: reconnected(${events}) :: [${client.util.time}]`);
};
