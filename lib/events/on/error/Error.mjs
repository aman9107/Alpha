export default (client, err) => {
    console.log(`[client] :: error :: [${client.util.time}]`);
    console.error([err.stack || err.message]);
};
