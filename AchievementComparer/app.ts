/// <reference path='Definitions/angular.d.ts' />
/// <reference path='Definitions/blizzard.d.ts' />
/// <reference path='Definitions/jquery.d.ts' />
/// <reference path='utils.ts' />

module AchievementComparer {
    'use strict';

    export interface Region {
        code: string;
        desc: string;
        host: string;
        locales: Locale[];
    }

    export interface Locale {
        code: string;
        desc: string;
    }

    var Regions: Region[] = [
        {
            code: "US",
            desc: "Americas",
            host: "http://us.battle.net",
            locales:
            [
                { code: "en_US", desc: "English (US)" },
                { code: "es_MX", desc: "Spanish (Mexico)" },
                { code: "pt_BR", desc: "Brazilian Portuguese" }
            ]
        },
        {
            code: "EU",
            desc: "Europe",
            host: "http://eu.battle.net",
            locales:
            [
                { code: "en_GB", desc: "English (UK)" },
                { code: "es_ES", desc: "Spanish (Spain)" },
                { code: "fr_FR", desc: "French" },
                { code: "ru_RU", desc: "Russian" },
                { code: "de_DE", desc: "German" },
                { code: "pt_PT", desc: "Portuguese" },
                { code: "it_IT", desc: "Italian" }
            ]
        },
        {
            code: "KR",
            desc: "Korea",
            host: "http://kr.battle.net",
            locales: [{ code: "ko_KR", desc: "Korean" }]
        },
        {
            code: "TW",
            desc: "Taiwan",
            host: "http://tw.battle.net",
            locales: [{ code: "zh_TW", desc: "Chinese, Traditional" }]
        },
        {
            code: "CN",
            desc: "China",
            host: "http://www.battlenet.com.cn",
            locales: [{ code: "zh_CN", desc: "Chinese, Simplified" }]
        }];

    export interface Category extends BattleNet.AchievementCategory {
        total: number;
        leftContenderProgress: number;
        rightContenderProgress: number;
    }
    
    export class Contender {
        Avatar: string;
        Character: BattleNet.Character;
        Region: Region;

        constructor(address?: string) {
            this.Avatar = this.formatAvatar();
            if (address) {
                Storage.loadCharacter(name.split("@").reverse().join("/"), (character: BattleNet.Character) => {
                    this.Character = character;
                    this.Avatar = this.formatAvatar();
                } );
            }
        }

        private formatAvatar(): string {
            if (this.Character) return "{0}/static-render/eu/{1}?alt=/wow/static/images/2d/avatar/{2}-{3}.jpg".format(Regions[0].host, this.Character.thumbnail, this.Character.race, this.Character.gender);
            else return "{0}/wow/static/images/2d/avatar/{1}-{2}.jpg".format(Regions[0].host, Math.floor((Math.random() * 11) + 1), Math.floor((Math.random() * 2)));
        }

        unLoad() {
            this.Character = null;
            this.Avatar = this.formatAvatar();
        }

        reloadFromArmory() {
            if (this.Character) {
                Storage.loadCharacter(this.Character.realm + "/" + this.Character.name, (character: BattleNet.Character) => { this.Character = character; } , true);
                this.Avatar = this.formatAvatar();
            }
        }
    }

    export interface LocaleData {
        locale: Locale;
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

        setLocale(locale: Locale);
        loadCharacter(contender: string, callback: (character: BattleNet.Character) => void, forceReload?: boolean);
    }

    export class Storage implements IStorage {
        currentLocale: Locale;
        lastLeftContender: string;
        lastRightContender: string;
        localeData: LocaleData;
        cachedCharacters: BattleNet.Character[];

        public injection(): any[] {
            return [
                Storage
            ]
        }

        constructor() {
            this.setLocale((localStorage.getItem("data") !== null) ? JSON.parse(localStorage.getItem("data")).locale : Regions[0].locales[0]);
            this.lastLeftContender = localStorage.getItem("leftContender");
            this.lastRightContender = localStorage.getItem("rightContender");
            this.cachedCharacters = JSON.parse(localStorage.getItem("characters")) || [];
        }

        setLocale(locale: Locale): void {
            this.currentLocale = locale;
            var currentRegion = Regions.single((region) => { return region.locales.indexOf(locale) > -1; } );
            this.localeData = JSON.parse(localStorage.getItem("data"));
            if (this.localeData === null || this.localeData.locale != locale) {
                var achievements: BattleNet.AchievementCategory[];
                var classes: BattleNet.CharacterClass[];
                var races: BattleNet.CharacterRace[];
                var realms: BattleNet.RealmStatus[];

                $.getJSON(currentRegion.host + "/api/wow/data/character/achievements?locale=" + locale + "&jsonp=?").done((json: BattleNet.Achievements) => {
                    achievements = json.achievements;
                    if ([classes, races, realms].every((current) => { return current != null })) {
                        localStorage.setItem("data", JSON.stringify(this.localeData = { locale: locale, achievements: achievements, classes: classes, races: races, realms: realms }));
                    }
                });

                $.getJSON(currentRegion.host + "/api/wow/data/character/classes?locale=" + locale + "&jsonp=?").done((json: BattleNet.Classes) => {
                    classes = json.classes;
                    if ([achievements, races, realms].every((current) => { return current != null })) {
                        localStorage.setItem("data", JSON.stringify(this.localeData = { locale: locale, achievements: achievements, classes: classes, races: races, realms: realms }));
                    }
                });

                $.getJSON(currentRegion.host + "/api/wow/data/character/races?locale=" + locale + "&jsonp=?").done((json: BattleNet.Races) => {
                    races = json.races;
                    if ([achievements, classes, realms].every((current) => { return current != null })) {
                        localStorage.setItem("data", JSON.stringify(this.localeData = { locale: locale, achievements: achievements, classes: classes, races: races, realms: realms }));
                    }
                });

                $.getJSON(currentRegion.host + "/api/wow/realm/status?locale=" + locale + "&jsonp=?").done((json: BattleNet.Realms) => {
                    realms = json.realms;
                    if ([achievements, classes, races].every((current) => { return current != null })) {
                        localStorage.setItem("data", JSON.stringify(this.localeData = { locale: locale, achievements: achievements, classes: classes, races: races, realms: realms }));;
                    }
                });
            }
        }

        loadCharacter(contender: string, callback: (character: BattleNet.Character) => void , forceReload: boolean = false) {
            var character = this.cachedCharacters.single((character) => { return (character.realm + "/" + character.name) === contender });
            var currentRegion = Regions.single((region) => { return region.locales.indexOf(this.currentLocale) > -1; });
            if (forceReload || character === null)
                $.getJSON(currentRegion.host + "/api/wow/character/" + contender + "?locale=" + this.currentLocale + "&fields=achievements,guild&jsonp=?").done(callback);
            else callback(character);
        }
    }

    export interface IScope extends ng.IScope {
        Math: Math;

        location: ng.ILocationService;

        locale: Locale;
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

    export class Controller {
        public injection(): any[] {
            return [
                '$scope',
                '$location',
                'Storage',
                'filterFilter',
                Controller
            ]
        }

        constructor(
           private $scope: IScope,
           private $location: ng.ILocationService,
           private Storage: IStorage,
           private filterFilter
           ) {
            $scope.Math = Math;

            $scope.locale = Storage.localeData.locale;
            $scope.regions = Regions;
            $scope.region = $scope.regions.single((region) => { return region.locales.indexOf($scope.locale) > -1; } );

            $scope.$watch('locale', () => { Storage.setLocale($scope.locale); $scope.region = $scope.regions.single((region) => { return region.locales.indexOf($scope.locale) > -1; }); });

            $scope.$watch((scope) => { return Storage.cachedCharacters; }, () => { $scope.cachedCharacters = Storage.cachedCharacters; });

            $scope.$watch((scope) => { return Storage.localeData; }, () => { if (Storage.localeData) $scope.categories = Storage.localeData.achievements; });

            $scope.$watch('location.path()', (path) => this.onPath(path));

            $scope.achievementProgress = (contender: BattleNet.Character, achievementId: number): string => {
                if (contender.achievements.achievementsCompleted.indexOf(achievementId) == -1)
                    return "Incomplete";
                return new Date(contender.achievements.achievementsCompletedTimestamp[contender.achievements.achievementsCompleted.indexOf(achievementId)]).toDateString();
            };

            $scope.criteriaProgress = (contender: BattleNet.Character, criteriaId: number): string => {
                if (contender.achievements.criteria.indexOf(criteriaId) == -1)
                    return "0";
                return contender.achievements.criteriaQuantity[contender.achievements.criteria.indexOf(criteriaId)].toString();
            };

            $scope.sortWeight = (achievement: BattleNet.Achievement): number => {
                var weight = 4;
                if ($scope.leftContender.Character.achievements.achievementsCompleted.indexOf(achievement.id) != -1) weight -= 2;
                if ($scope.rightContender.Character.achievements.achievementsCompleted.indexOf(achievement.id) != -1) weight -= 1;
                return weight;
            };

            $scope.classDesc = (classId) => {
                return (classId === undefined) ? "" : Storage.localeData.classes.single((currentClass) => { return currentClass.id == classId }).name
            };

            $scope.raceDesc = (raceId) => {
                return (raceId === undefined) ? "" : Storage.localeData.races.single((currentRace) => { return currentRace.id == raceId }).name
            };

            $scope.location = $location;
        }

        onPath(path: string) {
            if (!(this.$scope.leftContender && this.$scope.leftContender)) return;
            if (path === "") path = "/" + this.$scope.categories[0].name;
            var categoryPath = path.split("/");
            if (categoryPath.length == 2) {
                var category = this.$scope.categories.single((category) => { return category.name == categoryPath[1] });
                var total = 0, leftContenderProgress = 0, rightContenderProgress = 0;
                category.achievements.forEach((achievement) => {
                    total += achievement.points;
                    if (this.$scope.leftContender.Character.achievements.achievementsCompleted.indexOf(achievement.id) >= 0)
                        leftContenderProgress += achievement.points;
                    if (this.$scope.rightContender.Character.achievements.achievementsCompleted.indexOf(achievement.id) >= 0)
                        rightContenderProgress += achievement.points;
                });
                this.$scope.category = Object.create(category, { total: { value: total }, leftContenderProgress: { value: leftContenderProgress }, rightContenderProgress: { value: rightContenderProgress } });
            } else if (categoryPath.length == 3) {
                var category = this.$scope.categories.single((currentCategory) => { return currentCategory.name == categoryPath[1] });
                var subcategory = category.categories.single((currentSubcategory) => { return currentSubcategory.name == categoryPath[2] });
                var total = 0, leftContenderProgress = 0, rightContenderProgress = 0;
                subcategory.achievements.forEach((achievement) => {
                    total += achievement.points;
                    if (this.$scope.leftContender.Character.achievements.achievementsCompleted.indexOf(achievement.id) >= 0)
                        leftContenderProgress += achievement.points;
                    if (this.$scope.rightContender.Character.achievements.achievementsCompleted.indexOf(achievement.id) >= 0)
                        rightContenderProgress += achievement.points;
                });
                this.$scope.category = Object.create(subcategory, { total: { value: total }, leftContenderProgress: { value: leftContenderProgress }, rightContenderProgress: { value: rightContenderProgress } });
            }

            $("html, body").animate({ scrollTop: 0 }, "slow");
        }
    }

    $(() => {
        var link: HTMLLinkElement = <HTMLLinkElement>document.createElement('link');
        link.type = 'image/gif';
        link.rel = 'shortcut icon';
        link.href = 'data:image/jpeg;base64,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';
        document.getElementsByTagName('head')[0].appendChild(link);
    });

    angular.module('AchievementComparer', [])
            .controller('Controller', Controller.prototype.injection())
            .service('Storage', Storage.prototype.injection());
}