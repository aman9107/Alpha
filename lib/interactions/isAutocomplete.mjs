export default async (client, i) => {
    (async () => {
        if (i.commandName !== "help")
            return;
        const option = i.options.getFocused(true);
        if (option.name === "category") {
            const options = client.commands.slash.reduce((total, command) => {
                if (total[total.length - 1]?.name !== command.category)
                    total.push({
                        name: command.category,
                        value: command.category,
                    });
                return total;
            }, []);
            await i.respond(options);
        }
        else if (option.name === "command") {
            const options = client.commands.slash.reduce((total, command) => {
                if (command.data.name.includes(option.value.toLowerCase())) {
                    const a_option = {
                        name: command.data.name,
                        value: command.data.name,
                    };
                    total.push(a_option);
                }
                return total;
            }, []);
            await i.respond(options);
        }
    })();
};
