# WoW Achievement Comparer
## Introduction

This is a hobby project I'm working on to cover for an old feature of the WoW Armory which was lost after the deprecation of the old community sites. This feature allowed you to compare two characters against each other and see which achievements they had in common, who had acomplished more, etc...

## Features

* Simple, responsive and intuitive UI based on Blizz's Armory.
* All requests to the WoW API are cached.
* Purely client-side: no need to register, quick load, hostings costs, can use a copy from the local filesystem.
* Supports all regions and localizations.
* Achievements have Wowhead Tooltips and links.

## Roadmap

* Migrate to IndexedDB, localStore is becoming pretty slow and constraining.
* Implement a WebApp manifest for offline usage if cached data is available.
* Need to find a better way to display achievement criteria progress.
* I'd love to implement a Summary section with a breakdown of progress per category, much like the one you can see in the Armory.

## Known Issues

* Character loading stucks until you reload the app.
* Filters are currently disabled until I find time to revamp the system.

## FAQ

### Will you ever charge or display ads?
Never. I do this just for fun (Really, developing is lots of fun, you should try someday).

### Why can't I use this in older browsers?
Because IE<10 and old browsers are insecure, give me cancer and make my battle pets cry. Remember I do this for fun.

### Why haven't you added the possibility to do XYZ?
Probably because you are reading this and not creating a feature request <a href="https://github.com/nesukun/AchievementComparer/issues/new">here</a>.

### Why the app is ugly as hell?
Because that's subjective and I have the artistic sensibility of a drunk walrus.

### Can I help?
Sure! If you have fixes make a pull request. If you want to be more involved in the development I could add you as a collaborator.

### This has saved my life! How can I repay you?
You know... there is this little message in the bottom-left corner of the app...
