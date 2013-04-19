/// <reference path='Definitions/jquery.d.ts' />
/// <reference path='Definitions/angular.d.ts' />
/// <reference path='Definitions/blizzard.d.ts' />

module AchievementComparer {
    'use strict';

    export interface Category extends BattleNet.AchievementCategory {
        total: number;
        leftContenderProgress: number;
        rightContenderProgress: number;
    }

    //export interface Contender extends BattleNet.Character {
    //    isReloading: bool;
    //}

    export interface Region {
        code: string;
        desc: string;
        host: string;
        locales: string[];
    }

    export interface DataCollection {
        locale: string;
        achievements: BattleNet.AchievementCategory[];
        classes: BattleNet.CharacterClass[];
        races: BattleNet.CharacterRace[];
        realms: BattleNet.RealmStatus[];
    }

    export interface IScope extends ng.IScope {
        Math: Math;

        location: ng.ILocationService;

        region: () => Region;
        categories: BattleNet.AchievementCategory[];
        recentCharacters: BattleNet.Character[];
        category: Category;
        leftContender: BattleNet.Character;
        leftContenderDummyAvatar: string;
        selectLeftContender: (string) => void;
        reloadLeftContender: () => void;
        rightContender: BattleNet.Character;
        rightContenderDummyAvatar: string;
        selectRightContender: (string) => void;
        reloadRightContender: () => void;

        achievementProgress: (contender: BattleNet.Character, achievementId: number) => string;
        criteriaProgress: (contender: BattleNet.Character, criteriaId: number) => string;
        classDesc: (classId: number) => string;
        raceDesc: (raceId: number) => string;
    }

    export interface IStorage {
        currentRegion: Region;
        currentLocale: string;
        data: DataCollection;
        lastLeftContender: string;
        lastRightContender: string;
        recentCharacters: BattleNet.Character[];
        regions: Region[];

        getCharacter(contender: string, forceReload?: bool): BattleNet.Character;
    }

    export class Storage implements IStorage {

        public injection(): any[] {
            return [
                Storage
            ]
        }

        currentRegion: Region;
        currentLocale: string;
        data: DataCollection;
        lastLeftContender: string;
        lastRightContender: string;
        recentCharacters: BattleNet.Character[];
        regions: Region[];

        constructor() {

            this.regions = [
                { code: "US", desc: "Americas", host: "http://us.battle.net", locales: ["en_US", "es_MX", "pt_BR"] },
                { code: "EU", desc: "Europe", host: "http://eu.battle.net", locales: ["en_GB", "es_ES", "fr_FR", "ru_RU", "de_DE", "pt_PT", "it_IT"] },
                { code: "KR", desc: "Korea", host: "http://kr.battle.net", locales: ["ko_KR"] },
                { code: "TW", desc: "Taiwan", host: "http://tw.battle.net", locales: ["zh_TW"] },
                { code: "CN", desc: "China", host: "http://www.battlenet.com.cn", locales: ["zh_CN"] }];

            this.currentRegion = this.regions.filter((region) => { return region.code == localStorage.getItem("region"); })[0] || this.regions[0];
            this.setLocale(localStorage.getItem("data").locale || this.currentRegion.locales[0]);
            this.lastLeftContender = localStorage.getItem("leftContender");
            this.lastRightContender = localStorage.getItem("rightContender");
            this.recentCharacters = JSON.parse(localStorage.getItem("characters")) || [];
        }

        setLocale(locale: string): void {
            this.currentLocale = locale;
            this.data = JSON.parse(localStorage.getItem("data"));
            if (this.data === null || this.data.locale != locale) {
                var achievements: BattleNet.AchievementCategory[];
                var classes: BattleNet.CharacterClass[];
                var races: BattleNet.CharacterRace[];
                var realms: BattleNet.RealmStatus[];

                $.getJSON(this.currentRegion.host + "/api/wow/data/character/achievements?locale=" + locale + "&jsonp=?").done((json: BattleNet.Achievements) => {
                    achievements = json.achievements;
                    if ([classes, races, realms].every((current) => { return current != null })) {
                        localStorage.setItem("data", JSON.stringify(this.data = { locale: locale, achievements: achievements, classes: classes, races: races, realms: realms }));
                        localStorage.setItem("region", this.currentRegion.code);
                        localStorage.setItem("locale", locale);
                    }
                });

                $.getJSON(this.currentRegion.host + "/api/wow/data/character/classes?locale=" + locale + "&jsonp=?").done((json: BattleNet.Classes) => {
                    classes = json.classes;
                    if ([achievements, races, realms].every((current) => { return current != null })) {
                        localStorage.setItem("data" + locale, JSON.stringify(this.data = { locale: locale, achievements: achievements, classes: classes, races: races, realms: realms }));
                        localStorage.setItem("region", this.currentRegion.code);
                        localStorage.setItem("locale", locale);
                    }
                });

                $.getJSON(this.currentRegion.host + "/api/wow/data/character/races?locale=" + locale + "&jsonp=?").done((json: BattleNet.Races) => {
                    races = json.races;
                    if ([achievements, classes, realms].every((current) => { return current != null })) {
                        localStorage.setItem("data", JSON.stringify(this.data = { locale: locale, achievements: achievements, classes: classes, races: races, realms: realms }));
                        localStorage.setItem("region", this.currentRegion.code);
                        localStorage.setItem("locale", locale);
                    }
                });

                $.getJSON(this.currentRegion.host + "/api/wow/realm/status?locale=" + locale + "&jsonp=?").done((json: BattleNet.Realms) => {
                    realms = json.realms;
                    if ([achievements, classes, races].every((current) => { return current != null })) {
                        localStorage.setItem("data", JSON.stringify(this.data = { locale: locale, achievements: achievements, classes: classes, races: races, realms: realms }));
                        localStorage.setItem("region", this.currentRegion.code);
                        localStorage.setItem("locale", locale);
                    }
                });
            }
        }

        getCharacter(contender: string, forceReload?: bool): BattleNet.Character {
            var characters: BattleNet.Character[] = JSON.parse(localStorage.getItem("characters")) || [];
            if (forceReload || !characters.some((character) => { return contender == character.realm + '/' + character.name; })) {
                $.getJSON(this.currentRegion.host + "/api/wow/character/" + contender + "?locale=" + this.currentLocale + "&fields=achievements,guild&jsonp=?").done((json) => {
                    characters.push(json);
                    localStorage.setItem("characters", JSON.stringify(characters));
                    this.recentCharacters = characters;
                    return json;
                });
            } else {
                return characters.filter((character) => { return contender == character.realm + '/' + character.name; })[0];
            }
        }
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

            $scope.categories = Storage.data.achievements;
            $scope.recentCharacters = Storage.recentCharacters;
            $scope.leftContenderDummyAvatar = Math.floor((Math.random() *11) +1) + "-" + Math.floor((Math.random() *2));
            if (Storage.lastLeftContender !== null)
                $scope.leftContender = Storage.getCharacter(Storage.lastLeftContender);
            $scope.rightContenderDummyAvatar = Math.floor((Math.random() * 11) + 1) + "-" + Math.floor((Math.random() * 2));
            if (Storage.lastRightContender !== null)
                $scope.rightContender = Storage.getCharacter(Storage.lastRightContender);

            $scope.$watch('location.path()', (path) => this.onPath(path));

            $scope.reloadLeftContender = () => { $scope.leftContender = Storage.getCharacter($scope.leftContender.realm + "/" + $scope.leftContender.name, true); };
            $scope.selectLeftContender = (contender: string) => { $scope.leftContender = (contender === '') ? null : Storage.getCharacter(contender.split('@').reverse().join('/')); $scope.location = $location; };

            $scope.reloadRightContender = () => { $scope.rightContender = Storage.getCharacter($scope.rightContender.realm + "/" + $scope.rightContender.name, true); };
            $scope.selectRightContender = (contender: string) => { $scope.rightContender = (contender === '') ? null : Storage.getCharacter(contender.split('@').reverse().join('/')); $scope.location = $location; };

            $scope.region = () => { return Storage.currentRegion; };
            $scope.achievementProgress = (contender, achievementId) => this.achievementProgress(contender, achievementId);
            $scope.classDesc = (classId) => { return (classId === undefined) ? "" : Storage.data.classes.filter((currentClass) => { return currentClass.id == classId })[0].name };
            $scope.raceDesc = (raceId) => { return (raceId === undefined) ? "" : Storage.data.races.filter((currentRace) => { return currentRace.id == raceId })[0].name };
  
            $scope.location = $location;
        }

        onPath(path: string) {
            if (!(this.$scope.leftContender && this.$scope.leftContender)) return;
            if (path === "") path = "/" + this.$scope.categories[0].name;
            var categoryPath = path.split("/");
            if (categoryPath.length == 2) {
                var category = this.$scope.categories.filter((category) => { return category.name == categoryPath[1] })[0];
                var total = 0, leftContenderProgress = 0, rightContenderProgress = 0;
                category.achievements.forEach((achievement) => {
                    total += achievement.points;
                    if (this.$scope.leftContender.achievements.achievementsCompleted.indexOf(achievement.id) >= 0)
                        leftContenderProgress += achievement.points;
                    if (this.$scope.rightContender.achievements.achievementsCompleted.indexOf(achievement.id) >= 0)
                        rightContenderProgress += achievement.points;
                });
                this.$scope.category = Object.create(category, { total: { value: total }, leftContenderProgress: { value: leftContenderProgress }, rightContenderProgress: { value: rightContenderProgress } });
            } else if (categoryPath.length == 3) {
                var category = this.$scope.categories.filter((currentCategory) => { return currentCategory.name == categoryPath[1] })[0];
                var subcategory = category.categories.filter((currentSubcategory) => { return currentSubcategory.name == categoryPath[2] })[0];
                var total = 0, leftContenderProgress = 0, rightContenderProgress = 0;
                subcategory.achievements.forEach((achievement) => {
                    total += achievement.points;
                    if (this.$scope.leftContender.achievements.achievementsCompleted.indexOf(achievement.id) >= 0)
                        leftContenderProgress += achievement.points;
                    if (this.$scope.rightContender.achievements.achievementsCompleted.indexOf(achievement.id) >= 0)
                        rightContenderProgress += achievement.points;
                });
                this.$scope.category = Object.create(subcategory, { total: { value: total }, leftContenderProgress: { value: leftContenderProgress }, rightContenderProgress: { value: rightContenderProgress } });
            }
            $("html, body").animate({ scrollTop: 0 }, "slow");
        }

        achievementProgress = (contender: BattleNet.Character, achievementId: number): string => {
            if (contender.achievements.achievementsCompleted.indexOf(achievementId) == -1)
                return "Incomplete";
            return new Date(contender.achievements.achievementsCompletedTimestamp[contender.achievements.achievementsCompleted.indexOf(achievementId)] * 1000).toDateString();
        };

        criteriaProgress = (contender: BattleNet.Character, criteriaId: number): string => {
            if (contender.achievements.criteria.indexOf(criteriaId) == -1)
                return "0";
            return contender.achievements.criteriaQuantity[contender.achievements.criteria.indexOf(criteriaId)].toString();
        };
    }

    angular.module('AchievementComparer', [])
            .controller('Controller', Controller.prototype.injection())
            .service('Storage', Storage.prototype.injection());
}