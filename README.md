<div align="center">
  <img width="150px" src="./avatar.png"/>
</div>

## Alpha

This is a well structured discord bot made with discord.js v14.14.1 as a reference for those who are getting started or are looking for ideas to make their bot scalable.

Three simple ideas have been employed for this approach:

- Using recursions for organising files and folders
- Extending the client to hook more necessary items
- Trying to make as many references as possible from the lib itself (e.g. enums)

### Pros

#### Commands

It supports both slash and text commands; however, you should ignore the plee of your users and drop the idea of having text commands altogether.

It takes tremendous effort and manipulation to validate and maintain text commands, not to mention the amount of code you'd have to write.

#### Interactions

Interactions have their own folders in groups, making it easier to keep things in place without filling a thousand lines per file.

Interaction file names are actually [method names as documented in the official docs](https://discord.js.org/docs/packages/discord.js/14.14.1/BaseInteraction:Class) that verify the type of interaction we're dealing with.<br>
For example:

- Interaction => `<BaseInteraction>.isChatInputCommand()`
- File name => `isChatInputCommand.mjs`

#### Events

Events can also be grouped into folders, but with one restriction that it shall only contain two folders on the root level: 'on' and 'once', representing the client events.

Event file names are enums from the library itself.<br>
For example:

- Event => `Discord.Events.ClientReady`
- File name => `ClientReady.mjs`

Any other folder nested underneath these folders by the same name ('on' or 'once') is not ideal and might cause unintended behaviour.

#### Utility

I've added some basic util for queueing/paging, timing/evaluating dates/timestamps, and formatting code; but you can have your own.

#### Updates

If you've been with the discord.js community before, it's not hard to say that the lib updates almost every 3-4 months.

This design aims to keep things as basic and minimal as possible to prevent the requirement of updating your code on every **minor** update.

### Cons

#### Sharding

Developers may have their own methods and/or libraries for sharding; so this example is not going to cover any of those.

#### Database

Choosing a database and how it should be sharded is also very specific to the developer's needs, so that's not being covered as well.

## Configuration

This project is available in typescript (src) and javascript (lib), which can both be configured from their respective `util` folders.
