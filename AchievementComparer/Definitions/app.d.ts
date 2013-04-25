/// <reference path='blizzard.d.ts' />

declare module AchievementComparer {

    export interface Region {
        code: string;
        desc: string;
        host: string;
        locales: string[]
    }

    export interface LocaleList {
        [index: string]: string;
    }

    export interface Category extends BattleNet.AchievementCategory {
        total: number;
        leftContenderProgress: number;
        rightContenderProgress: number;
    }

    export interface LocaleData {
        locale: string;
        achievements: BattleNet.AchievementCategory[];
        classes: BattleNet.CharacterClass[];
        races: BattleNet.CharacterRace[];
        realms: BattleNet.RealmStatus[];
    }

    export interface IStorage {
        lastLeftContender: string;
        lastRightContender: string;
        localeData: LocaleData;
        cachedCharacters: BattleNet.Character[];

        setLocale(locale: string);
        loadCharacter(contender: string, callback: (character: BattleNet.Character) => void , forceReload?: boolean);
    }

    export interface IScope extends ng.IScope {
        Math: Math;

        location: ng.ILocationService;

        currentLocale: string;
        locales: { [index: string]: string; }
        region: Region;
        regions: Region[];
        categories: BattleNet.AchievementCategory[];
        cachedCharacters: BattleNet.Character[];
        category: Category;
        leftContender: Contender;
        rightContender: Contender;

        achievementProgress: (contender: BattleNet.Character, achievementId: number) => string;
        criteriaProgress: (contender: BattleNet.Character, criteriaId: number) => string;
        sortWeight: (achievement: BattleNet.Achievement) => number;
        classDesc: (classId: number) => string;
        raceDesc: (raceId: number) => string;
    }

}