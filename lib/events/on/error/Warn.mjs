export default (client, warning) => {
    console.log(`[client] :: warning :: [${client.util.time}]`);
    console.warn([warning]);
};
